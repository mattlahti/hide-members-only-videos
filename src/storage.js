const STORAGE_KEY = 'hideCounts';

const getAllHideCounts = async (storageStrategy) => (await storageStrategy.get(STORAGE_KEY))[STORAGE_KEY] || {};

const getAllSessionHideCounts = async () => await getAllHideCounts(browser.storage.session);

const getAllTotalHideCounts = async () => await getAllHideCounts(browser.storage.local);

const getHideCount = async (storageStrategy, channel) => (await getAllHideCounts(storageStrategy))[channel] || 0;

const getSessionHideCountByChannel = async channel => await getHideCount(browser.storage.session, channel);

const getTotalHideCountByChannel = async channel => await getHideCount(browser.storage.local, channel);

const incrementCount = async (storageStrategy, channel) => {
    const allCounts = await getAllHideCounts(storageStrategy);
    const currentCount = allCounts[channel] || 0;
    const value = {
        [STORAGE_KEY]: {
            ...allCounts,
            [channel]: currentCount + 1,
        },
    };

    await storageStrategy.set(value);
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
