import {
    getAllChannelHideCounts,
    getAllLocationHideCounts,
    clearAllHideCounts,
    clearChannelHideCount,
    clearLocationHideCount,
} from '../src/count-storage.js';
import {
    getEnabledLocations,
    areStatsEnabled,
    updateEnabledLocations,
    updateStatsEnabled,
} from '../src/settings-storage.js';
import {
    getLocationPrettyName,
    LOCATIONS,
} from '../src/site-location.js';

const channelStatsList = document.getElementById('channel-stats-list');
const locationStatsList = document.getElementById('location-stats-list');
const channelStatsClearButton = document.getElementById('channel-stats-clear-button');
const locationStatsClearButton = document.getElementById('location-stats-clear-button');
const allStatsClearButton = document.getElementById('all-stats-clear-button');
const locations = document.getElementById('settings-locations');
const statsEnabledElement = document.getElementById('settings-stats-enabled');

const TEXT_STATS_ERROR = 'Failed to load statistics.';
const EMPTY_STATS_TEXT = 'No data to display.';
const STATS_DISABLED_TEXT = 'Statistics are disabled. To track and view them, enable statistics in the settings tab.';

const TAB_STATISTICS = 'stats-tab';
const TAB_SETTINGS = 'settings-tab';
const TAB_ABOUT = 'about-tab';
const TAB_BUTTONS = {
    [TAB_STATISTICS]: document.getElementById('stats-tab'),
    [TAB_SETTINGS]: document.getElementById('settings-tab'),
    [TAB_ABOUT]: document.getElementById('about-tab'),
}
const TAB_SECTIONS = {
    [TAB_STATISTICS]: document.getElementById('stats-section'),
    [TAB_SETTINGS]: document.getElementById('settings-section'),
    [TAB_ABOUT]: document.getElementById('about-section'),
};

let activeTab = TAB_STATISTICS;
let hasChannelStats = false;
let hasLocationStats = false;

const updateTabDom = () => {
    Object.values(TAB_BUTTONS).forEach(button => button.classList.remove('tab-active'));
    Object.values(TAB_SECTIONS).forEach(section => section.style.display = 'none');
    TAB_BUTTONS[activeTab].classList.add('tab-active');
    TAB_SECTIONS[activeTab].style.display = 'block';
};

const onTabClick = e => {
    activeTab = e.target.id;
    updateTabDom();
};

const renderStats = (statsListElement, statsEntries) => {
    statsListElement.textContent = '';

    if (!statsEntries.length) {
        statsListElement.textContent = EMPTY_STATS_TEXT;

        return;
    }

    for (const [key, count] of statsEntries) {
        const li = document.createElement('li');
        const keySpan = document.createElement('span');
        const countSpan = document.createElement('span');
        keySpan.style.fontWeight = 'bold';
        keySpan.textContent = key;
        countSpan.textContent = `: ${count}`;
        li.appendChild(keySpan);
        li.appendChild(countSpan);
        statsListElement.appendChild(li);
    }
};

const getSortedStats = statsObject => Object.entries(statsObject).sort((a, b) => b[1] - a[1]);

const renderChannelStats = channelStats => {
    const sorted = getSortedStats(channelStats);
    renderStats(channelStatsList, sorted);
};

const renderLocationStats = locationStats => {
    const sorted = getSortedStats(locationStats)
        .map(([location, count]) => [getLocationPrettyName(location), count]);
    renderStats(locationStatsList, sorted);
};

const fetchAndRenderStats = async () => {
    const statsEnabled = await areStatsEnabled();

    if (!statsEnabled) {
        channelStatsList.textContent = STATS_DISABLED_TEXT;

        return;
    }

    try {
        const [
            channelHideCounts,
            locationHideCounts,
        ] = await Promise.all([
            getAllChannelHideCounts(),
            getAllLocationHideCounts(),
        ]);

        hasChannelStats = !!Object.keys(channelHideCounts).length;
        hasLocationStats = !!Object.keys(locationHideCounts).length;
        updateClearButtonVisibilities();
        renderChannelStats(channelHideCounts);
        renderLocationStats(locationHideCounts);
    } catch (err) {
        console.error('Failed to load hide‑count stats:', err);
        channelStatsList.textContent = TEXT_STATS_ERROR;
        locationStatsList.textContent = TEXT_STATS_ERROR;
    }
};

const checkStatsEnabled = async () => {
    statsEnabledElement.querySelector('input[type="checkbox"]').checked = await areStatsEnabled();
};

const getEnabledLocationsFromCheckboxes = () =>
     Array.from(locations.querySelectorAll('input[type="checkbox"]'))
        .filter(cb => cb.checked)
        .map(cb => cb.value);

const updateSettings = async () => {
    const enabledLocations = getEnabledLocationsFromCheckboxes();
    await updateEnabledLocations(enabledLocations);
};

const onEnabledLocationsChange = async e => {
    if (!e.target.matches('input[type="checkbox"]')) {
        return;
    }

    await updateSettings();
};

const onStatsEnabledChange = async e => {
    await updateStatsEnabled(e.target.checked);
    await fetchAndRenderStats();
};

const enableOrDisableButton = (button, enabled) => {
    const enabledColor = '#ff7878';
    const disabledColor = '#999999';

    if (enabled) {
        button.style.color = enabledColor;
        button.style.cursor = 'pointer';
        button.removeAttribute('disabled');
    } else {
        button.style.color = disabledColor;
        button.style.cursor = 'not-allowed';
        button.setAttribute('disabled', '');
    }
}

const updateClearButtonVisibilities = () => {
    enableOrDisableButton(channelStatsClearButton, hasChannelStats);
    enableOrDisableButton(locationStatsClearButton, hasLocationStats);
    enableOrDisableButton(allStatsClearButton, hasChannelStats || hasLocationStats);
};

const clearChannelStats = async () => {
    await clearChannelHideCount();
    await fetchAndRenderStats();
};

const clearLocationStats = async () => {
    await clearLocationHideCount();
    await fetchAndRenderStats();
};

const clearAllStats = async () => {
    await clearAllHideCounts();
    await fetchAndRenderStats();
};

const bindEventListeners = () => {
    locations.addEventListener('change', onEnabledLocationsChange);
    statsEnabledElement.addEventListener('change', onStatsEnabledChange);
    channelStatsClearButton.addEventListener('click', clearChannelStats);
    locationStatsClearButton.addEventListener('click', clearLocationStats);
    allStatsClearButton.addEventListener('click', clearAllStats);
    Object.values(TAB_BUTTONS).forEach(tabButton => tabButton.addEventListener('click', onTabClick));
};

const populateLocations = async () => {
    const enabledLocations = await getEnabledLocations();
    const settingsLocations = document.getElementById('settings-locations');

    for (const location of Object.values(LOCATIONS)) {
        const row = document.createElement('div');
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = location;
        input.checked = enabledLocations.includes(location);
        label.appendChild(input);
        label.append(getLocationPrettyName(location));
        row.classList.add('checkbox-row');
        row.appendChild(label);
        settingsLocations.appendChild(row);
    }
};

const init = async () => {
    await populateLocations();
    await checkStatsEnabled();
    await fetchAndRenderStats();
    bindEventListeners();
    updateTabDom();
};

(async () => init())();
