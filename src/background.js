const sendMessageToTabs = async (tabs, message) => {
    for (const tab of tabs) {
        await browser.tabs.sendMessage(tab.id, message);
    }
};

browser.storage.local.onChanged.addListener(async changes => {
    const changedItems = Object.keys(changes);
    // todo: export these or just move this whole thing into the settings-storage
    const settingsKey = 'settings';
    const enabledLocationsKey = 'enabledLocations';

    if (changedItems.includes(settingsKey)) {
        const oldEnabledLocations = changes[settingsKey].oldValue[enabledLocationsKey];
        const newEnabledLocations = changes[settingsKey].newValue[enabledLocationsKey];
        const addedLocations = newEnabledLocations.filter(l => !oldEnabledLocations.includes(l));
        const removedLocations = oldEnabledLocations.filter(l => !newEnabledLocations.includes(l));

        const message = {
            enabledLocations: addedLocations,
            disabledLocations: removedLocations,
        };
        const tabs = await browser.tabs.query({currentWindow: true, active: true});
        await sendMessageToTabs(tabs, message);
    }
});

