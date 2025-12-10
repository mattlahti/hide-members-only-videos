import {
    getAllTotalHideCounts,
    getAllSessionHideCounts,
} from '../storage.js';

(async () => {
    const allTotal = await getAllTotalHideCounts();
    const allSession = await getAllSessionHideCounts();
    const countEntries = Object.entries(allTotal);

    // todo: remove this, just for testing what it looks like with hella channels
    for (let i = 0; i < 100 - countEntries.length; i++) {
        countEntries.push(...countEntries);
    }

    // todo: sort by count desc

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
