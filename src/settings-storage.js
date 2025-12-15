import { LOCATIONS } from './site-location.js';

const SETTINGS_KEY = 'settings';

const ENABLED_LOCATIONS_KEY = 'enabledLocations';

const STATS_ENABLED_KEY = 'statsEnabled';

const getDefaultSettings = () => {
    return {
        [ENABLED_LOCATIONS_KEY]: [
            LOCATIONS.PLAYER,
            LOCATIONS.PLAYLIST,
            LOCATIONS.CHANNEL_INDEX,
            LOCATIONS.HOME,
        ],
        [STATS_ENABLED_KEY]: true,
    }
};

const getSettings = async () => (await browser.storage.local.get(SETTINGS_KEY))[SETTINGS_KEY] || null;

const areLocationsValid = locations => {
    if (!Array.isArray(locations)) {
        return false;
    }

    for (const location of locations) {
        if (!Object.values(LOCATIONS).includes(location)) {
            return false;
        }
    }

    return true;
};

const isStatsEnabledValid = statsEnabled => statsEnabled === true || statsEnabled === false;

const areSettingsValid = settings => settings && areLocationsValid(settings[ENABLED_LOCATIONS_KEY]) && isStatsEnabledValid(settings[STATS_ENABLED_KEY]);

const writeDefaultSettings = async () => {
    const defaultSettings = {
        [SETTINGS_KEY]: getDefaultSettings(),
    };

    await browser.storage?.local?.set(defaultSettings);

    return defaultSettings;
};

const getEnabledLocations = async () => (await getSettings())[ENABLED_LOCATIONS_KEY];

const areStatsEnabled = async () => (await getSettings())[STATS_ENABLED_KEY] === true;

const initSettings = async () => {
    const settings = await getSettings();

    if (areSettingsValid(settings)) {
        return settings;
    }

    await writeDefaultSettings();

    return await getSettings();
};

const updateSettings = async settings => {
    if (!areSettingsValid(settings)) {
        console.error('Settings are not valid and will not be saved.', settings);

        return;
    }

    await browser.storage.local.set({[SETTINGS_KEY]: settings});
}

const updateEnabledLocations = async enabledLocations => {
    const existingSettings = await getSettings();
    const updatedSettings = {
        ...existingSettings,
        [ENABLED_LOCATIONS_KEY]: enabledLocations,
    };

    await updateSettings(updatedSettings);
};

const updateStatsEnabled = async statsEnabled => {
    const existingSettings = await getSettings();
    const updatedSettings = {
        ...existingSettings,
        [STATS_ENABLED_KEY]: statsEnabled,
    };

    await updateSettings(updatedSettings);
}

const clearSettings = async () => await browser.storage.local.remove(SETTINGS_KEY);

export {
    getEnabledLocations,
    areStatsEnabled,
    initSettings,
    getSettings,
    writeDefaultSettings,
    updateEnabledLocations,
    updateStatsEnabled,
};
