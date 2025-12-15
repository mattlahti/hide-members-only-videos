import {
    getAllTotalHideCounts,
    getAllSessionHideCounts,
    clearAllHideCounts,
} from '../src/count-storage.js';

const statsList = document.getElementById('stats-list');
const clearButton = document.getElementById('stats-clear-button');

const EMPTY_STATS_TEXT = 'No videos hidden yet.';

let hasStats = false;

const renderStats = (totalCounts, sessionCounts) => {
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

const updateClearButtonVisibility = () => {
    clearButton.style.display = hasStats ? 'block' : 'none';
};

const clearStats = async () => {
    await clearAllHideCounts();
    await fetchAndRenderStats();
    updateClearButtonVisibility();
};

const initClearButton = () => {
    clearButton.addEventListener('click', clearStats);
    updateClearButtonVisibility();
};

(async () => {
    await fetchAndRenderStats();
    initClearButton();
})();
