const membersOnlyText = 'Members only';
const membersOnlyBadgeClass = 'yt-badge-shape__text';

//todo: these should be linked, currently only one container can contain one type of parent tag.

// root level tags that would be removed if they contain a members only badge
const possibleParentTags = [
    'yt-lockup-view-model', // horizontally long tile in the right-hand feed
    'ytd-rich-item-renderer', // squarish tile in the homescreen
];

// container IDs where different video elements can be contained
const containerIds = [
    'related', // right-hand side feed when a video is playing
    'content', // the main feed on the homescreen
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

const filterMemberOnlyVideos = node => {
    possibleParentTags.forEach(parentTag => {
        const videos = node.matches(parentTag)
            ? [node]
            : node.querySelectorAll && node.querySelectorAll(parentTag);

        videos.forEach(removeIfMembersOnly);
    });
};

const onMutation = mutation => {
    if (!mutation.addedNodes.length) {
        return;
    }

    Array.from(mutation.addedNodes)
        .filter(node => node.nodeType === Node.ELEMENT_NODE)
        .forEach(filterMemberOnlyVideos);
};

const clearInitialVideos = element => {
    possibleParentTags.forEach(parentTag => element.querySelectorAll(parentTag).forEach(removeIfMembersOnly));
};

const observer = new MutationObserver(mutations => mutations.forEach(onMutation));
const observerOptions = {
    childList: true,
    subtree: true,
};

containerIds.forEach(id => {
    const container = document.getElementById(id);
    clearInitialVideos(container);
    observer.observe(container, observerOptions);
});

