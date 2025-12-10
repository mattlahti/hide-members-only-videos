import {
    getAllTotalHideCounts,
    getAllSessionHideCounts,
} from '../src/storage.js';

const statsList = document.getElementById('stats-list');

const renderStats = (totalCounts, sessionCounts) => {
    const entries = Object.entries(totalCounts);

    if (entries.length === 0) {
        statsList.textContent = 'No videos hidden yet.';
        return;
    }

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
}

(async () => {
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
})();
