import { debugLog } from './logger.js';
import {
    SETTINGS_KEY,
    ENABLED_LOCATIONS_KEY,
} from './settings-storage.js';

const sendMessageToTabs = async (tabs, message) => {
    for (const tab of tabs) {
        try {
            await debugLog('Sending message to tab', tab.id, message)
            await browser.tabs.sendMessage(tab.id, message);
        } catch (e) {
            console.error('Failed to send message to tab', tab.id, e);
        }
    }
};

const onEnabledLocationsChanged = async (oldValue, newValue) => {
    const addedLocations = newValue.filter(l => !oldValue.includes(l));
    const removedLocations = oldValue.filter(l => !newValue.includes(l));

    if (!addedLocations.length && !removedLocations.length) {
        return;
    }

    const message = {
        enabledLocations: addedLocations,
        disabledLocations: removedLocations,
    };
    const tabs = await browser.tabs.query({active: true});
    await sendMessageToTabs(tabs, message);
};

const onSettingsChanged = async (oldValue, newValue) => {
    await onEnabledLocationsChanged(oldValue[ENABLED_LOCATIONS_KEY], newValue[ENABLED_LOCATIONS_KEY]);
};

browser.storage.local.onChanged.addListener(async changes => {
    const changedItems = Object.keys(changes);

    if (changedItems.includes(SETTINGS_KEY)) {
        await onSettingsChanged(changes[SETTINGS_KEY].oldValue, changes[SETTINGS_KEY].newValue);
    }
});

