import { areDebugLogsEnabled } from './settings-storage.js';

const LOG_TYPE_DEBUG = 1;
const LOG_TYPE_WARNING = 2;
const LOG_TYPE_ERROR = 4;

const LOG_TYPE_METHOD_MAP = {
    [LOG_TYPE_DEBUG]: console.log,
    [LOG_TYPE_WARNING]: console.warn,
    [LOG_TYPE_ERROR]: console.error,
};

const log = async (type, ...args) => {
    if (!await areDebugLogsEnabled()) {
        return;
    }

    return LOG_TYPE_METHOD_MAP[type]('[Hide Members Only Videos]', ...args);
};

const debugLog = async (...args) => await log(LOG_TYPE_DEBUG, ...args);

const debugWarningLog = async (...args) => await log(LOG_TYPE_WARNING, ...args);

const debugErrorLog = async (...args) => await log(LOG_TYPE_ERROR, ...args);

export {
    debugLog,
    debugWarningLog,
    debugErrorLog,
};
