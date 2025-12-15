import {
    getCurrentLocation,
    LOCATIONS,
} from './site-location.js';

const MEMBERS_ONLY_TEXT = 'Members only';

const getTextFromElement = el => el?.textContent?.trim();

const getChannelName = v => {
    switch (getCurrentLocation()) {
        case LOCATIONS.PLAYER:
        case LOCATIONS.HOME: {
            const span = v.querySelector('yt-content-metadata-view-model span.yt-content-metadata-view-model__metadata-text');

            return getTextFromElement(span);
        }
        case LOCATIONS.CHANNEL_INDEX: {
            const header = document.getElementById('page-header');
            const span = header?.querySelector('.dynamicTextViewModelH1 span.yt-core-attributed-string');

            return getTextFromElement(span);
        }
        case LOCATIONS.PLAYLIST: {
            const span = v.querySelector('.ytd-channel-name a');

            return getTextFromElement(span);
        }
        default:
            return null;
    }
};

const hasMembersOnlyBadge = v => {
    return Array.from(v.querySelectorAll('.yt-badge-shape__text'))
        .some(b => b.textContent.toLowerCase().includes(MEMBERS_ONLY_TEXT.toLowerCase())
    );
};

export {
    getChannelName,
    hasMembersOnlyBadge,
};
