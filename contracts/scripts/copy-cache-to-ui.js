"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const promises_1 = tslib_1.__importDefault(require("fs/promises"));
const path_1 = tslib_1.__importDefault(require("path"));
async function copyCacheToUI() {
    try {
        // Define paths
        const cacheDir = path_1.default.join('.', 'cache');
        const uiPublicCacheDir = path_1.default.join('..', 'ui', 'public', 'cache');
        const cacheJsonSource = path_1.default.join('cache.json');
        const cacheJsonDest = path_1.default.join('..', 'ui', 'app', 'cache.json');
        // Create UI cache directory if it doesn't exist
        try {
            await promises_1.default.mkdir(uiPublicCacheDir, { recursive: true });
        }
        catch (err) {
            if (err.code !== 'EEXIST') {
                throw err;
            }
        }
        // Read files from cache directory
        const files = await promises_1.default.readdir(cacheDir);
        // Copy each file except README.md
        for (const file of files) {
            if (file !== 'README.md') {
                const sourceFile = path_1.default.join(cacheDir, file);
                const destFile = path_1.default.join(uiPublicCacheDir, file);
                const data = await promises_1.default.readFile(sourceFile);
                await promises_1.default.writeFile(destFile, data);
            }
        }
        // Copy cache.json to UI app directory
        try {
            const cacheJsonData = await promises_1.default.readFile(cacheJsonSource);
            await promises_1.default.writeFile(cacheJsonDest, cacheJsonData);
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                console.log('cache.json not found, skipping');
            }
            else {
                throw err;
            }
        }
        console.log('Cache files copied to UI successfully');
    }
    catch (error) {
        console.error('Error copying cache files:', error);
        process.exit(1);
    }
}
await copyCacheToUI();
//# sourceMappingURL=copy-cache-to-ui.js.map