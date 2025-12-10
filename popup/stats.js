import {
    getAllTotalHideCounts,
    getAllSessionHideCounts,
} from '../src/storage.js';

(async () => {
    const allTotal = await getAllTotalHideCounts();
    const allSession = await getAllSessionHideCounts();
    const countEntries = Object.entries(allTotal);

    countEntries.sort((a, b) => b[1] - a[1]);

    const statsList = document.getElementById('stats-list');
    countEntries.forEach(([channel, count]) => {
        const li = document.createElement('li');
        li.textContent = `${channel}: ${count}`;

        const sessionCount = allSession[channel] || 0;
        if (sessionCount > 0) {
            li.textContent += ` (${sessionCount} this session)`;
        }

        statsList.appendChild(li);
    });
})();
