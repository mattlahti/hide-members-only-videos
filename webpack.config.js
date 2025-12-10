const path = require('path');

module.exports = (env, argv) => {
    const isDevelopment = argv.mode === 'development';

    return {
        mode: isDevelopment ? 'development' : 'production',
        entry: './src/hide-members-only-videos.js',
        output: {
            filename: 'contentScript.bundle.js',
            path: path.resolve(__dirname, 'dist'),
        },
    };
};
