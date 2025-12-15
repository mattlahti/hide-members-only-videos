import { areStatsEnabled } from './settings-storage.js';

const HIDE_COUNTS_KEY = 'hideCounts';

const getAllHideCounts = async (storageStrategy) => (await storageStrategy.get(HIDE_COUNTS_KEY))[HIDE_COUNTS_KEY] || {};

const getAllSessionHideCounts = async () => await getAllHideCounts(browser.storage.session);

const getAllTotalHideCounts = async () => await getAllHideCounts(browser.storage.local);

const getHideCount = async (storageStrategy, channel) => (await getAllHideCounts(storageStrategy))[channel] || 0;

const getSessionHideCountByChannel = async channel => await getHideCount(browser.storage.session, channel);

const getTotalHideCountByChannel = async channel => await getHideCount(browser.storage.local, channel);

const incrementHideCount = async (storageStrategy, channel) => {
    const allCounts = await getAllHideCounts(storageStrategy);
    const currentCount = allCounts[channel] || 0;
    const value = {
        [HIDE_COUNTS_KEY]: {
            ...allCounts,
            [channel]: currentCount + 1,
        },
    };

    await storageStrategy.set(value);
};

const incrementTotalHideCount = async channel => await incrementHideCount(browser.storage.local, channel);

const incrementSessionHideCount = async channel => await incrementHideCount(browser.storage.session, channel);

const incrementHideCounts = async channel => {
    if (!browser?.storage?.local) {
        return;
    }

    const statsEnabled = await areStatsEnabled();

    if (!statsEnabled) {
        console.warn('Statistics are disabled, not incrementing hide count.');

        return;
    }

    await incrementTotalHideCount(channel);

    if (browser?.storage?.session) {
        await incrementSessionHideCount(channel);
    }
};

const clearHideCount = async storageStrategy => {
    const cleared = {
        [HIDE_COUNTS_KEY]: {},
    };

    await storageStrategy.set(cleared);
};

const clearAllHideCounts = async () => {
    if (browser.storage.local) {
        await clearHideCount(browser.storage.local);
    }

    if (browser.storage.session) {
        await clearHideCount(browser.storage.session);
    }
};

export {
    getAllSessionHideCounts,
    getAllTotalHideCounts,
    getSessionHideCountByChannel,
    getTotalHideCountByChannel,
    incrementHideCounts,
    clearAllHideCounts,
};
