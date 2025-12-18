import { areDebugLogsEnabled } from './settings-storage.js';

const debugLog = async (...args) => {
    if (!await areDebugLogsEnabled()) {
        return;
    }

    console.log('[Hide Members Only Videos]', ...args);
};

export {
    debugLog,
};
