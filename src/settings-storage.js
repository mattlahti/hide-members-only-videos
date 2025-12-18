import { LOCATIONS } from './site-location.js';

const SETTINGS_KEY = 'settings';

const ENABLED_LOCATIONS_KEY = 'enabledLocations';

const STATS_ENABLED_KEY = 'statsEnabled';

const DEBUG_LOGS_ENABLED_KEY = 'debugLogsEnabled';

const getStorageStrategy = () => browser.storage.local;

const getDefaultSettings = () => {
    return {
        [ENABLED_LOCATIONS_KEY]: [
            LOCATIONS.PLAYER,
            LOCATIONS.PLAYLIST,
            LOCATIONS.CHANNEL_INDEX,
            LOCATIONS.HOME,
        ],
        [STATS_ENABLED_KEY]: true,
        [DEBUG_LOGS_ENABLED_KEY]: false,
    }
};

const getSettings = async () => (await getStorageStrategy().get(SETTINGS_KEY))[SETTINGS_KEY] || null;

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

const isBoolStrict = v => v === true || v === false;

const isStatsEnabledValid = statsEnabled => isBoolStrict(statsEnabled);

const isDebugLogsEnabledValid = debugLogsEnabled => isBoolStrict(debugLogsEnabled);

const areSettingsValid = settings => settings && areLocationsValid(settings[ENABLED_LOCATIONS_KEY]) && isStatsEnabledValid(settings[STATS_ENABLED_KEY]) && isDebugLogsEnabledValid(settings[DEBUG_LOGS_ENABLED_KEY]);

const writeDefaultSettings = async () => {
    const defaultSettings = {
        [SETTINGS_KEY]: getDefaultSettings(),
    };

    await getStorageStrategy().set(defaultSettings);

    return defaultSettings;
};

const getEnabledLocations = async () => (await getSettings())[ENABLED_LOCATIONS_KEY];

const areStatsEnabled = async () => (await getSettings())[STATS_ENABLED_KEY] === true;

const areDebugLogsEnabled = async () => (await getSettings())[DEBUG_LOGS_ENABLED_KEY] === true;

const initSettings = async () => {
    const settings = await getSettings();

    if (areSettingsValid(settings)) {
        return settings;
    }

    await writeDefaultSettings();

    return await getSettings();
};

const updateSettings = async (key, value) => {
    const existingSettings = await getSettings();
    const updatedSettings = {
        ...existingSettings,
        [key]: value,
    };

    if (!areSettingsValid(updatedSettings)) {
        console.error('Settings are not valid and will not be saved.', updatedSettings);

        return;
    }

    await getStorageStrategy().set({[SETTINGS_KEY]: updatedSettings});
};

const updateEnabledLocations = async enabledLocations => await updateSettings(ENABLED_LOCATIONS_KEY, enabledLocations);

const updateStatsEnabled = async statsEnabled => await updateSettings(STATS_ENABLED_KEY, statsEnabled);

const updateDebugLogsEnabled = async debugLogsEnabled => await updateSettings(DEBUG_LOGS_ENABLED_KEY, debugLogsEnabled);

const clearSettings = async () => await getStorageStrategy().remove(SETTINGS_KEY);

export {
    getEnabledLocations,
    areStatsEnabled,
    areDebugLogsEnabled,
    initSettings,
    getSettings,
    writeDefaultSettings,
    updateEnabledLocations,
    updateStatsEnabled,
    updateDebugLogsEnabled,
    SETTINGS_KEY,
    ENABLED_LOCATIONS_KEY,
};
