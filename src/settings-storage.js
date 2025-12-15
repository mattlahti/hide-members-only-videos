import { LOCATIONS } from './site-location';

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

const areSettingsValid = settings => {
    if (!settings) {
        return false;
    }

    if (!Array.isArray(settings[ENABLED_LOCATIONS_KEY])) {
        return false;
    }

    return (settings[STATS_ENABLED_KEY] === false || settings[STATS_ENABLED_KEY] === true);
};

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

const clearSettings = async () => await browser.storage.local.remove(SETTINGS_KEY);

export {
    getEnabledLocations,
    areStatsEnabled,
    initSettings,
    getSettings,
    writeDefaultSettings,
};
