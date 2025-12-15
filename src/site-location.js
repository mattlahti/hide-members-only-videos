const LOCATIONS = {
    HOME: 'home',
    PLAYLIST: 'playlist',
    PLAYER: 'player',
    CHANNEL_INDEX: 'channel-index',
};

const LOCATION_PRETTY_NAMES = {
    [LOCATIONS.PLAYER]: 'Player',
    [LOCATIONS.PLAYLIST]: 'Playlist',
    [LOCATIONS.CHANNEL_INDEX]: 'Channel',
    [LOCATIONS.HOME]: 'Home',
};

const LOCATION_PATH_MAP = {
    [LOCATIONS.PLAYER]: '/watch',
    [LOCATIONS.PLAYLIST]: '/playlist',
    [LOCATIONS.CHANNEL_INDEX]: '/@',
    [LOCATIONS.HOME]: '/',
};

//todo: need more specific selectors, depends on the page, so will need to key off of location...
const LOCATION_SELECTOR_MAP = {
    [LOCATIONS.PLAYER]: '#related',
    [LOCATIONS.HOME]: '#content',
    [LOCATIONS.CHANNEL_INDEX]: '#content',
    [LOCATIONS.PLAYLIST]: '#content',
};

const getCurrentLocation = () => {
    for (const [locationKey, path] of Object.entries(LOCATION_PATH_MAP)) {
        if (window.location.pathname.startsWith(path)) {
            return locationKey;
        }
    }

    return null;
};

const getSelector = location => LOCATION_SELECTOR_MAP[location];

const getLocationPrettyName = location => LOCATION_PRETTY_NAMES[location];

export {
    LOCATIONS,
    getCurrentLocation,
    getSelector,
    getLocationPrettyName,
};
