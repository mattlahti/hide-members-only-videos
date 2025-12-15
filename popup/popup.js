import {
    getAllTotalHideCounts,
    getAllSessionHideCounts,
    clearAllHideCounts,
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

const statsList = document.getElementById('stats-list');
const clearButton = document.getElementById('stats-clear-button');
const locations = document.getElementById('settings-locations');
const statsEnabledElement = document.getElementById('settings-stats-enabled');

const EMPTY_STATS_TEXT = 'No videos hidden yet.';
const STATS_DISABLED_TEXT = 'Statistics are disabled - to track and view, enable them in the settings tab.';

const TAB_STATISTICS = 'stats-tab';
const TAB_SETTINGS = 'settings-tab';
const TAB_BUTTONS = {
    [TAB_STATISTICS]: document.getElementById('stats-tab'),
    [TAB_SETTINGS]: document.getElementById('settings-tab'),
}
const TAB_SECTIONS = {
    [TAB_STATISTICS]: document.getElementById('stats-section'),
    [TAB_SETTINGS]: document.getElementById('settings-section'),
};

let activeTab = TAB_STATISTICS;
let hasStats = false;

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

const renderStats = (totalCounts, sessionCounts) => {
    statsList.textContent = '';
    const entries = Object.entries(totalCounts);

    if (entries.length === 0) {
        hasStats = false;
        statsList.textContent = EMPTY_STATS_TEXT;

        return;
    }

    hasStats = true;
    const sortedEntries = entries.sort((a, b) => b[1] - a[1]);

    for (const [channel, count] of sortedEntries) {
        const li = document.createElement('li');
        let text = `${channel}: ${count}`;

        const sessionCount = sessionCounts[channel];
        if (sessionCount > 0) {
            text += ` (${sessionCount} this session)`;
        }

        li.textContent = text;
        statsList.appendChild(li);
    }
};

const fetchAndRenderStats = async () => {
    const statsEnabled = await areStatsEnabled();

    if (!statsEnabled) {
        statsList.textContent = STATS_DISABLED_TEXT;

        return;
    }

    try {
        const [totalCounts, sessionCounts] = await Promise.all([
            getAllTotalHideCounts(),
            getAllSessionHideCounts()
        ]);

        renderStats(totalCounts, sessionCounts);
    } catch (err) {
        console.error('Failed to load hide‑count stats:', err);
        statsList.textContent = 'Failed to load statistics.';
    }
};

const checkStatsEnabled = async () => {
    statsEnabledElement.querySelector('input[type="checkbox"]').checked = await areStatsEnabled();
};

const updateClearButtonVisibility = async () => {
    const statsEnabled = await areStatsEnabled();
    clearButton.style.display = hasStats && statsEnabled ? 'block' : 'none';
};

const clearStats = async () => {
    await clearAllHideCounts();
    await fetchAndRenderStats();
    await updateClearButtonVisibility();
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
    await updateClearButtonVisibility();
    await fetchAndRenderStats();
};

const bindEventListeners = () => {
    locations.addEventListener('change', onEnabledLocationsChange);
    statsEnabledElement.addEventListener('change', onStatsEnabledChange);
    clearButton.addEventListener('click', clearStats);
    Object.values(TAB_BUTTONS).forEach(tabButton => tabButton.addEventListener('click', onTabClick));
};

const populateLocations = async () => {
    const enabledLocations = await getEnabledLocations();
    const settingsLocations = document.getElementById('settings-locations');

    for (let location of Object.values(LOCATIONS)) {
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
    await updateClearButtonVisibility();
    bindEventListeners();
    updateTabDom();
};

(async () => init())();
