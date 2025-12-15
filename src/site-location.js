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

const LOCATION_SELECTOR_MAP = {
    [LOCATIONS.PLAYER]: '#related',
    [LOCATIONS.HOME]: '.ytd-browse[page-subtype="home"] #contents',
    [LOCATIONS.CHANNEL_INDEX]: '.ytd-browse[page-subtype="channels"] #contents',
    [LOCATIONS.PLAYLIST]: '.ytd-browse[page-subtype="playlist"] #contents',
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
