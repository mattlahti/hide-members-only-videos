const LOCATIONS = {
    HOME: 'home',
    PLAYLIST: 'playlist',
    PLAYER: 'player',
    CHANNEL_INDEX: 'channel-index',
};

const LOCATION_PATH_MAP = {
    [LOCATIONS.PLAYER]: '/watch',
    [LOCATIONS.PLAYLIST]: '/playlist',
    [LOCATIONS.CHANNEL_INDEX]: '/@',
    [LOCATIONS.HOME]: '/',
};

function getLocation() {
    for (const [locationKey, path] of Object.entries(LOCATION_PATH_MAP)) {
        if (window.location.pathname.startsWith(path)) {
            return locationKey;
        }
    }

    return null;
}

export {
    LOCATIONS,
    getLocation,
};
