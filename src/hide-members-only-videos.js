import { getSelector } from './site-location';
import {
    getEnabledLocations,
    incrementHideCounts,
} from './storage';
import {
    getChannelName,
    hasMembersOnlyBadge,
} from './video-data-extractor';

const PARENT_TAGS = [
    'ytd-rich-item-renderer',
    'yt-lockup-view-model',
    'ytd-playlist-video-renderer',
];

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

const onMutation = async mutation => {
    const addedElements = Array.from(mutation.addedNodes).filter(node => node.nodeType === Node.ELEMENT_NODE);

    for (const element of addedElements) {
        await filterMembersOnlyVideos(element);
    }
};

const clearInitialVideos = async element => {
    for (const parentTag of PARENT_TAGS) {
        for (const v of element.querySelectorAll(parentTag)) {
            await removeIfMembersOnly(v);
        }
    }
};

const init = async () => {
    const enabledLocations = getEnabledLocations();

    if (!enabledLocations.length) {
        return;
    }

    const observer = new MutationObserver(async mutations => {
        for (const mutation of mutations) {
            await onMutation(mutation);
        }
    });
    const observerOptions = {
        childList: true,
        subtree: true,
    };

    for (const location of enabledLocations) {
        const selector = getSelector(location);
        const container = document.querySelector(selector);

        // todo: remove these logs after debugging...
        if (!container) {
            console.warn(`No container found for location "${location}"`);
            continue;
        }

        console.log(`Starting to watch location "${location}" for selector "${selector}"`);

        await clearInitialVideos(container);
        observer.observe(container, observerOptions);
    }
};

(async () => await init())();
