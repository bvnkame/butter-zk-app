"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const o1js_1 = require("o1js");
const promises_1 = tslib_1.__importDefault(require("fs/promises"));
// @ts-expect-error - These imports will resolve in the generated project after the contract is built. Remove these comments in your project.
const { Add } = await import('../build/src/Add.js');
// @ts-expect-error - These imports will resolve in the generated project after the ZkProgram is built. Remove these comments in your project.
const { AddZkProgram } = await import('../contracts/build/src/AddZkProgram.js');
const cache_directory = 'cache';
// Create a file system cache instance pointing to our cache directory
// This allows o1js to store and retrieve compiled circuit artifacts
const cache = o1js_1.Cache.FileSystem(cache_directory);
// ZkProgram cache in the browser is currently not fully supported.
await AddZkProgram.compile();
// Compile the smart contract with the cache enabled
await Add.compile({ cache });
const cacheObj = {
    files: [],
};
const files = await promises_1.default.readdir(cache_directory);
for (const fileName of files) {
    if (!fileName.endsWith('.header')) {
        cacheObj['files'].push(fileName);
    }
}
const jsonCacheFile = `cache.json`;
try {
    await promises_1.default.writeFile(jsonCacheFile, JSON.stringify(cacheObj, null, 2));
    console.log('JSON cached object successfully saved ');
}
catch (error) {
    console.error('Error writing JSON file:', error);
}
//# sourceMappingURL=generate-cache.js.map