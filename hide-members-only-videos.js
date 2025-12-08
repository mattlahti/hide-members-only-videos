const membersOnlyText = 'Members only';
const membersOnlyBadgeClass = 'yt-badge-shape__text';

const PARENT_TAGS = [
    'yt-lockup-view-model',
    'ytd-rich-item-renderer',
];

const CONTAINER_IDS = [
    'related',
    'content',
];

const isMembersOnly = v => {
    return Array.from(v.querySelectorAll('.' + membersOnlyBadgeClass))
        .some(badge => badge.textContent.toLowerCase().includes(membersOnlyText.toLowerCase()));
};

const removeIfMembersOnly = v => {
    if (isMembersOnly(v)) {
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
    PARENT_TAGS.forEach(parentTag => element.querySelectorAll(parentTag).forEach(removeIfMembersOnly));
};

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

