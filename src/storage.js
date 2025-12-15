import {LOCATIONS} from './site-location.js';

const HIDE_COUNTS_KEY = 'hideCounts';

const SETTINGS_KEY = 'settings';

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
    if (browser.storage.local) {
        await incrementTotalHideCount(channel);
    }

    if (browser.storage.session) {
        await incrementSessionHideCount(channel);
    }
};

// todo: pull from storage, add storage in settings panel in popup
//  also, should I split this out into a separate file like settings-storage or something...?
const getEnabledLocations = () => {
    return [
        LOCATIONS.PLAYER,
        LOCATIONS.PLAYLIST,
        LOCATIONS.CHANNEL_INDEX,
        LOCATIONS.HOME,
    ];
};

export {
    getAllSessionHideCounts,
    getAllTotalHideCounts,
    getSessionHideCountByChannel,
    getTotalHideCountByChannel,
    incrementHideCounts,
    getEnabledLocations,
};
