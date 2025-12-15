import { incrementHideCounts } from './count-storage.js';
import {
    getEnabledLocations,
    initSettings,
} from './settings-storage.js';
import {
    getSelector,
    LOCATIONS
} from './site-location.js';
import {
    getChannelName,
    hasMembersOnlyBadge,
} from './video-data-extractor.js';

let tileContainerObserver = null;
let ytRootObserver = null;

const PARENT_TAGS = [
    'ytd-rich-item-renderer',
    'yt-lockup-view-model',
    'ytd-playlist-video-renderer',
];

// todo: clean this up... it's a mess rn lmao but tired

const removeIfMembersOnly = async v => {
    if (hasMembersOnlyBadge(v)) {
        const channelName = await getChannelName(v) || 'Unknown';

        try {
            await incrementHideCounts(channelName);
        } catch (e) {
            console.error('Failed to increment hide count:', e);
        }

        v.remove();
    }
};

const filterMembersOnlyVideos = async node => {
    for (const parentTag of PARENT_TAGS) {
        const videos = node.matches(parentTag)
            ? [node]
            : node.querySelectorAll && node.querySelectorAll(parentTag);

        for (const v of videos) {
            await removeIfMembersOnly(v);
        }
    }
};

const clearInitialVideos = async element => {
    for (const parentTag of PARENT_TAGS) {
        for (const v of element.querySelectorAll(parentTag)) {
            await removeIfMembersOnly(v);
        }
    }
};

const onMutation = async mutation => {
    const addedElements = Array.from(mutation.addedNodes).filter(node => node.nodeType === Node.ELEMENT_NODE);

    for (const element of addedElements) {
        await filterMembersOnlyVideos(element);
    }
};

const onMutations = async mutations => {
    for (const mutation of mutations) {
        await onMutation(mutation);
    }
};

const onYtRootMutations = async (mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);

        if (!addedNodes.length) {
            continue;
        }

        for (const node of addedNodes) {
            if (node.nodeType !== Node.ELEMENT_NODE) {
                continue;
            }

            const unboundLocations = Object.entries(bound).filter(([_, bound]) => !bound);

            if (!unboundLocations.length) {
                ytRootObserver?.disconnect();

                return;
            }

            for (const [location] of unboundLocations) {
                const selector = getSelector(location);
                const containerToObserve = node.matches(selector) || node.querySelector(selector);

                if (containerToObserve) {
                    await observeLocation(location, containerToObserve);
                }
            }
        }
    }
};

// todo: eventually will need to key this off of the enabled locations, not all...
//  either that, or rely on a full-page reload for changes to the enabled locations...
const bound = Object.fromEntries(
    Object.values(LOCATIONS).map(k => [k, false])
);

const areAllLocationsBound = () => Object.values(bound).every(b => b === true);

const observeLocation = async (location, container) => {
    if (!container) {
        console.warn(`No container found for location "${location}"`);

        return;
    }

    const observerOptions = {
        childList: true,
        subtree: true,
    };

    bound[location] = true;

    if (areAllLocationsBound()) {
        ytRootObserver?.disconnect();
    }

    await clearInitialVideos(container);
    tileContainerObserver.observe(container, observerOptions);
};

const observeLocations = async () => {
    // todo: rethink this one, I think it should be more explicit when something is unbound (location specific?)
    if (tileContainerObserver) {
        tileContainerObserver.disconnect();
    } else {
        tileContainerObserver = new MutationObserver(onMutations);
    }

    const enabledLocations = await getEnabledLocations();

    if (!enabledLocations.length) {
        console.warn('No locations to hide are enabled.');

        return;
    }

    for (const location of enabledLocations) {
        const selector = getSelector(location);
        const container = document.querySelector(selector);
        await observeLocation(location, container);
    }
};

const initYtRootObserver = async () => {
    if (areAllLocationsBound()) {
        return;
    }

    ytRootObserver = new MutationObserver(onYtRootMutations);
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
