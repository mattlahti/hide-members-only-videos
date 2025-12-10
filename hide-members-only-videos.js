const MEMBERS_ONLY_TEXT = 'Members only';
const MEMBERS_ONLY_BADGE_CLASS = 'yt-badge-shape__text';
const PARENT_TAGS = [
    'yt-lockup-view-model',
    'ytd-rich-item-renderer',
];
const CONTAINER_IDS = [
    'related',
    'content',
];

// todo: cannot load this file as a module, so the storage module isn't able to be imported here
//  could maybe use webpack to bundle this file though, for now just pastaing it in here... sad
const STORAGE_KEY = 'hideCounts';

const getAllHideCounts = async (storageStrategy) => await storageStrategy.get(STORAGE_KEY);

const getAllSessionHideCounts = async () => await getAllHideCounts(browser.storage.session);

const getAllTotalHideCounts = async () => await getAllHideCounts(browser.storage.local);

const getHideCount = async (storageStrategy, channel) => (await getAllHideCounts(storageStrategy))[channel] || 0;

const getSessionHideCountByChannel = async channel => await getHideCount(browser.storage.session, channel);

const getTotalHideCountByChannel = async channel => await getHideCount(browser.storage.local, channel);

const incrementCount = async (storageStrategy, channel) => {
    const currentCount = await getHideCount(storageStrategy, channel) || 0;
    const newValue = currentCount + 1;
    const value = {
        [STORAGE_KEY]: {
            [channel]: newValue,
        },
    };

    await storageStrategy.set(value);

    return newValue;
};

const incrementTotalHideCount = async channel => await incrementCount(browser.storage.local, channel);

const incrementSessionHideCount = async channel => await incrementCount(browser.storage.session, channel);

const incrementHideCounts = async channel => {
    try {
        if (browser.storage.session) {
            await incrementSessionHideCount(channel);
        }
    } catch (e) {
    }

    try {
        if (browser.storage.local) {
            await incrementTotalHideCount(channel);
        }
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
