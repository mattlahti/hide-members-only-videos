import { incrementHideCounts } from './count-storage.js';
import { debugLog } from './logger.js';
import {
    getEnabledLocations, getExcludedChannelNames,
    initSettings,
} from './settings-storage.js';
import { getSelector } from './site-location.js';
import {
    getChannelName,
    hasMembersOnlyBadge,
} from './video-data-extractor.js';

const PARENT_TAGS = [
    'ytd-rich-item-renderer',
    'yt-lockup-view-model',
    'ytd-playlist-video-renderer',
];

const locationObservers = new Map();

const removeIfMembersOnly = async (v, location) => {
    if (!hasMembersOnlyBadge(v)) {
        return;
    }

    const channelName = await getChannelName(v) || 'Unknown';
    const excludedChannelNames = await getExcludedChannelNames();

    if (excludedChannelNames.includes(channelName)) {
        await debugLog(`Channel name "${channelName}" is excluded from statistics, not incrementing hide counts.`);

        return;
    }

    try {
        await incrementHideCounts(channelName, location);
    } catch (e) {
        console.error('Failed to increment hide count:', e);
    }

    v.remove();
};

const filterMembersOnlyVideos = async (node, location) => {
    for (const parentTag of PARENT_TAGS) {
        const videos = node.matches(parentTag)
            ? [node]
            : node.querySelectorAll && node.querySelectorAll(parentTag);

        for (const v of videos) {
            await removeIfMembersOnly(v, location);
        }
    }
};

const clearInitialVideos = async (element, location) => {
    for (const parentTag of PARENT_TAGS) {
        for (const v of element.querySelectorAll(parentTag)) {
            await removeIfMembersOnly(v, location);
        }
    }
};

const watchForMembersOnlyVideos = async (mutations, location) => {
    for (const mutation of mutations) {
        const addedElements = Array.from(mutation.addedNodes).filter(node => node.nodeType === Node.ELEMENT_NODE);

        for (const element of addedElements) {
            await filterMembersOnlyVideos(element, location);
        }
    }
};

const onYtRootMutations = async (mutations) => {
    const unboundLocations = await getUnboundLocations();

    if (unboundLocations.length === 0) {
        return;
    }

    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);

        if (!addedNodes.length) {
            continue;
        }

        for (const node of addedNodes) {
            if (node.nodeType !== Node.ELEMENT_NODE) {
                continue;
            }

            for (const location of unboundLocations) {
                const selector = getSelector(location);
                const containerToObserve = node.matches(selector) || node.querySelector(selector);

                if (containerToObserve) {
                    await observe(containerToObserve, location);
                    unboundLocations.splice(unboundLocations.indexOf(location), 1);
                }
            }
        }
    }
};

const getUnboundLocations = async () => {
    const enabledLocations = await getEnabledLocations();
    const currentBoundLocations = Array.from(locationObservers.keys()).map(target => locationObservers.get(target).location);

    return enabledLocations.filter(location => !currentBoundLocations.includes(location));
};

const observe = async (container, location) => {
    if (!container?.isConnected) {
        await debugLog('No container found for location', location);

        return;
    }

    const observer = new MutationObserver(async (mutations, self) => {
        if (!container.isConnected) {
            await debugLog('Disconnecting observer for location', location);
            self.disconnect();
            locationObservers.delete(container);

            return;
        }

        await watchForMembersOnlyVideos(mutations, location);
    });

    observer.observe(container, { childList: true, subtree: true });
    locationObservers.set(container, { observer: observer, location: location});
    await clearInitialVideos(container, location);

    await debugLog('Bound observer for location', location);
};

const observeLocation = async location => {
    const selector = getSelector(location);
    const container = document.querySelector(selector);
    await observe(container, location);
};

const observeLocations = async () => {
    const enabledLocations = await getEnabledLocations();

    if (!enabledLocations.length) {
        await debugLog('No locations to hide are enabled.');

        return;
    }

    for (const location of enabledLocations) {
        await observeLocation(location);
    }
};

const initYtRootObserver = async () => {
    const ytRootObserver = new MutationObserver(onYtRootMutations);
    const element = document.body.querySelector('#content');
    ytRootObserver.observe(
        element,
        {
            childList: true,
            subtree: true,
        }
    );
};

const disconnectLocationObservers = async disabledLocations => {
    for (const [key, value] of locationObservers) {
        if (!disabledLocations.includes(value.location)) {
            continue;
        }

        value.observer.disconnect();
        locationObservers.delete(key);
        await debugLog('Disconnected observer for', value.location);
    }
};

const connectLocationObservers = async enabledLocations => {
    const promises = enabledLocations.map(async loc => {
        await debugLog('Starting to observe', loc);
        await observeLocation(loc);

        return loc;
    });

    await Promise.all(promises);
};

browser.runtime.onMessage.addListener(async message => {
    if (message.enabledLocations?.length) {
        await connectLocationObservers(message.enabledLocations);
    }

    if (message.disabledLocations?.length) {
        await disconnectLocationObservers(message.disabledLocations);
    }
});

const init = async () => {
    await initSettings();
    await observeLocations();
    await initYtRootObserver();
};

(async () => await init())();
