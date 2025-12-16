import { incrementHideCounts } from './count-storage.js';
import {
    getEnabledLocations,
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
    if (hasMembersOnlyBadge(v)) {
        const channelName = await getChannelName(v) || 'Unknown';

        try {
            // todo: pass location here so we can track stats separately for each location
            await incrementHideCounts(channelName);
        } catch (e) {
            console.error('Failed to increment hide count:', e);
        }

        v.remove();
    }
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

    // todo: Ideally we would disconnect the observer at this point and then reconnect when there is an unbound location,
    //  probably won't be too bad to add in the observer callback.
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

const observe = async (target, location) => {
    if (!target?.isConnected) {
        console.error('Target for location does not exist or is not connected', location);

        return;
    }

    const obs = new MutationObserver((mutations, self) => {
        if (!target.isConnected) {
            console.log('disconnecting observer for location', location);
            self.disconnect();
            locationObservers.delete(target);
            // todo: at this point, we need to check if there are any unbound nodes and then re-bind the root observer if there are

            return;
        }

        watchForMembersOnlyVideos(mutations, location);
    });

    obs.observe(target, { childList: true, subtree: true });
    locationObservers.set(target, { observer: obs, location: location});
    await clearInitialVideos(target, location);
    // todo: also remove this log
    console.log('Bound observer for location', location);
};

const observeLocations = async () => {
    const enabledLocations = await getEnabledLocations();

    if (!enabledLocations.length) {
        console.warn('No locations to hide are enabled.');

        return;
    }

    for (const location of enabledLocations) {
        const selector = getSelector(location);
        const container = document.querySelector(selector);

        if (!container) {
            // todo: remove this log later, expected behavior
            console.warn('No container found for location', location);

            continue;
        }

        await observe(container, location);
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

const init = async () => {
    await initSettings();
    await observeLocations();
    await initYtRootObserver();
};

(async () => await init())();
