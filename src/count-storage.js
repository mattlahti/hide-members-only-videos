import {areStatsEnabled, getExcludedChannelNames} from './settings-storage.js';
import {debugLog} from './logger';

const KEY_CHANNEL_HIDE_COUNTS = 'hideCounts';

const KEY_LOCATION_COUNTS = 'locationHideCounts';

const getStorageStrategy = () => browser.storage.local;

const getAllHideCounts = async key => (await getStorageStrategy().get(key))[key] || {};

const getAllChannelHideCounts = async () => await getAllHideCounts(KEY_CHANNEL_HIDE_COUNTS);

const getAllLocationHideCounts = async () => await getAllHideCounts(KEY_LOCATION_COUNTS);

const incrementCount = async (storageKey, countIdentifierKey) => {
    const allCounts = await getAllHideCounts(storageKey);
    const currentCount = allCounts[countIdentifierKey] || 0;
    const value = {
        [storageKey]: {
            ...allCounts,
            [countIdentifierKey]: currentCount + 1,
        },
    };

    getStorageStrategy().set(value);
};

const incrementLocationHideCount = async location => incrementCount(KEY_LOCATION_COUNTS, location);

const incrementChannelHideCount = async channel => incrementCount(KEY_CHANNEL_HIDE_COUNTS, channel);

const incrementHideCounts = async (channel, location) => {
    if (!getStorageStrategy()) {
        return;
    }

    if (!(await areStatsEnabled())) {
        console.warn('Statistics are disabled, not incrementing hide counts.');

        return;
    }

    await Promise.all([
        incrementChannelHideCount(channel),
        incrementLocationHideCount(location),
    ]);
};

const clearHideCount = async key => await getStorageStrategy().set({[key]: {}});

const clearChannelHideCount = async () => await clearHideCount(KEY_CHANNEL_HIDE_COUNTS);

const clearLocationHideCount = async () => await clearHideCount(KEY_LOCATION_COUNTS);

const clearAllHideCounts = async () => {
    await Promise.all([
        clearChannelHideCount(),
        clearLocationHideCount(),
    ]);
};

export {
    getAllChannelHideCounts,
    getAllLocationHideCounts,
    incrementHideCounts,
    clearAllHideCounts,
    clearChannelHideCount,
    clearLocationHideCount,
};
