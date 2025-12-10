const STORAGE_KEY = 'hideCounts';

const getAllHideCounts = async (storageStrategy) => (await storageStrategy.get(STORAGE_KEY))[STORAGE_KEY] || {};

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

const incrementCounts = async channel => {
    if (browser.storage.local) {
        await incrementTotalHideCount(channel);
    }

    if (browser.storage.session) {
        await incrementSessionHideCount(channel);
    }
};

export {
    getAllSessionHideCounts,
    getAllTotalHideCounts,
    getSessionHideCountByChannel,
    getTotalHideCountByChannel,
    incrementCounts,
};
