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
    updateStatsEnabled, updateDebugLogsEnabled, areDebugLogsEnabled, getExcludedChannelNames, addExcludedChannelName, removeExcludedChannelName,
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
const debugLogsEnabledElement = document.getElementById('settings-debug-logs-enabled');
const excludedChannelNamesList = document.getElementById('excluded-channel-names-list');
const addExcludedChannelNameInput = document.getElementById('add-excluded-channel-name-input');
const addExcludedChannelNameButton = document.getElementById('add-excluded-channel-name-button');

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
};
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
        keySpan.textContent = key;
        countSpan.textContent = `: ${count}`;
        li.appendChild(keySpan);
        li.appendChild(countSpan);
        statsListElement.appendChild(li);
    }
};

const getSortedStats = statsObject => Object.entries(statsObject).sort((a, b) => b[1] - a[1]);

const renderChannelStats = channelStats => {
    const channelStatEntries = getSortedStats(channelStats);

    renderStats(channelStatsList, channelStatEntries);
};

const renderLocationStats = locationStats => {
    const locationStatEntries = getSortedStats(locationStats)
        .map(([location, count]) => [getLocationPrettyName(location), count]);

    renderStats(locationStatsList, locationStatEntries);
};

const disableStatsSections = () => {
    hasChannelStats = false;
    hasLocationStats = false;
    channelStatsList.textContent = STATS_DISABLED_TEXT;
    locationStatsList.textContent = STATS_DISABLED_TEXT;
    updateClearButtonVisibilities();
};

const fetchAndRenderStats = async () => {
    const statsEnabled = await areStatsEnabled();

    if (!statsEnabled) {
        disableStatsSections();

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

const onChannelNameRemoveClick = async channelName => {
    await removeExcludedChannelName(channelName);
    await populateExcludedChannels(await getExcludedChannelNames());
};

const populateExcludedChannels = excludedChannelNames => {
    excludedChannelNamesList.textContent = '';

    excludedChannelNames.forEach(channelName => {
        const li = document.createElement('li');
        const removeButton = document.createElement('div');
        const channelNameSpan = document.createElement('span');
        removeButton.classList.add('excluded-channel-remove-button');
        removeButton.textContent = '❌';
        removeButton.addEventListener('click', async () => onChannelNameRemoveClick(channelName));
        channelNameSpan.textContent = channelName;
        li.classList.add('excluded-channel-name-li');
        li.appendChild(removeButton);
        li.appendChild(channelNameSpan);
        excludedChannelNamesList.appendChild(li);
    });
};

const populateSettings = async () => {
    const [
        statsEnabled,
        debugLogsEnabled,
        enabledLocations,
        excludedChannelNames,
    ] = await Promise.all([
        areStatsEnabled(),
        areDebugLogsEnabled(),
        getEnabledLocations(),
        getExcludedChannelNames(),
    ]);

    statsEnabledElement.querySelector('input[type="checkbox"]').checked = statsEnabled;
    debugLogsEnabledElement.querySelector('input[type="checkbox"]').checked = debugLogsEnabled;
    populateLocations(enabledLocations);
    populateExcludedChannels(excludedChannelNames);
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

const onDebugLogsEnabledChange = async e => {
    await updateDebugLogsEnabled(e.target.checked);
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

const saveExcludedChannelName = async excludedChannelName => {
    addExcludedChannelNameInput.value = '';
    await addExcludedChannelName(excludedChannelName);
    await populateExcludedChannels(await getExcludedChannelNames());
};

const onAddExcludedChannelNameInputKeypress = async e => {
    if (e.key !== 'Enter') {
        return;
    }

    const excludedChannelName = addExcludedChannelNameInput.value.trim();

    if (!excludedChannelName) {
        return;
    }

    await saveExcludedChannelName(excludedChannelName);
};

const onAddExcludedChannelNameButtonClick = async () => {
    const excludedChannelName = addExcludedChannelNameInput.value.trim();

    if (!excludedChannelName) {
        return;
    }

    await saveExcludedChannelName(excludedChannelName);
};

const bindEventListeners = () => {
    locations.addEventListener('change', onEnabledLocationsChange);
    statsEnabledElement.addEventListener('change', onStatsEnabledChange);
    debugLogsEnabledElement.addEventListener('change', onDebugLogsEnabledChange);
    channelStatsClearButton.addEventListener('click', clearChannelStats);
    locationStatsClearButton.addEventListener('click', clearLocationStats);
    allStatsClearButton.addEventListener('click', clearAllStats);
    addExcludedChannelNameInput.addEventListener('keypress', onAddExcludedChannelNameInputKeypress);
    addExcludedChannelNameButton.addEventListener('click', onAddExcludedChannelNameButtonClick);
    Object.values(TAB_BUTTONS).forEach(tabButton => tabButton.addEventListener('click', onTabClick));
};

const populateLocations = enabledLocations => {
    const settingsLocations = document.getElementById('settings-locations');

    for (const location of Object.values(LOCATIONS)) {
        const row = document.createElement('div');
        const label = document.createElement('label');
        const input = document.createElement('input');
        const span = document.createElement('span');
        input.type = 'checkbox';
        input.value = location;
        input.checked = enabledLocations.includes(location);
        label.appendChild(input);
        span.textContent = getLocationPrettyName(location);
        label.append(span);
        row.classList.add('checkbox-row');
        row.appendChild(label);
        settingsLocations.appendChild(row);
    }
};

const init = async () => {
    await populateSettings();
    await fetchAndRenderStats();
    bindEventListeners();
    updateTabDom();
};

(async () => init())();
