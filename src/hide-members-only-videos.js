import { incrementCounts } from './storage';

const MEMBERS_ONLY_TEXT = 'Members only';
const MEMBERS_ONLY_BADGE_CLASS = 'yt-badge-shape__text';
const PARENT_TAGS = [
    'ytd-rich-item-renderer',
    'yt-lockup-view-model',
];
const CONTAINER_IDS = [
    'related',
    'content',
];

const incrementHideCounts = async channel => {
    try {
        await incrementCounts(channel);
    } catch (e) {
    }
};

const getChannelName = v => {
    const name = v.querySelector(
        'yt-content-metadata-view-model span.yt-content-metadata-view-model__metadata-text'
    );

    return name?.textContent.trim();
}

const isMembersOnly = v => {
    return Array.from(v.querySelectorAll('.' + MEMBERS_ONLY_BADGE_CLASS))
        .some(badge => badge.textContent.toLowerCase().includes(MEMBERS_ONLY_TEXT.toLowerCase()));
};

const removeIfMembersOnly = v => {
    if (isMembersOnly(v)) {
        incrementHideCounts(getChannelName(v) || 'Unknown');
        v.remove();
    }
};

const filterMembersOnlyVideos = node => {
    PARENT_TAGS.forEach(parentTag => {
        const videos = node.matches(parentTag)
            ? [node]
            : node.querySelectorAll && node.querySelectorAll(parentTag);

        videos.forEach(removeIfMembersOnly);
    });
};

const onMutation = mutation => {
    Array.from(mutation.addedNodes)
        .filter(node => node.nodeType === Node.ELEMENT_NODE)
        .forEach(filterMembersOnlyVideos);
};

const clearInitialVideos = element => {
    if (!element) {
        return;
    }

    PARENT_TAGS.forEach(parentTag => element.querySelectorAll(parentTag).forEach(removeIfMembersOnly));
};

const init = () => {
    const observer = new MutationObserver(mutations => mutations.forEach(onMutation));
    const observerOptions = {
        childList: true,
        subtree: true,
    };

    CONTAINER_IDS.forEach(id => {
        const container = document.getElementById(id);
        clearInitialVideos(container);
        observer.observe(container, observerOptions);
    });
};

init();
