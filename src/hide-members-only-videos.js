import { incrementCounts } from './storage';
import {
    getChannelName,
    hasMembersOnlyBadge,
} from './video-data-extractor';

const PARENT_TAGS = [
    'ytd-rich-item-renderer',
    'yt-lockup-view-model',
    'ytd-playlist-video-renderer',
];
const CONTAINER_IDS = [
    'related',
    //todo: need more specific selector, depends on the page, so will need to key off of location...
    'content',
];

const incrementHideCounts = async channel => {
    try {
        await incrementCounts(channel);
    } catch (e) {
    }
};

const removeIfMembersOnly = async v => {
    if (hasMembersOnlyBadge(v)) {
        await incrementHideCounts(getChannelName(v) || 'Unknown');
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
    const observer = new MutationObserver(async mutations => {
        for (const mutation of mutations) {
            await onMutation(mutation);
        }
    });
    const observerOptions = {
        childList: true,
        subtree: true,
    };

    for (const id of CONTAINER_IDS) {
        const container = document.getElementById(id);

        if (!container) {
            continue;
        }

        await clearInitialVideos(container);
        observer.observe(container, observerOptions);
    }
};

(async () => await init())();
