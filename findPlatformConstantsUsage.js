"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
var projectRoot = __dirname;
var targetPattern = /TurboModuleRegistry\.getEnforcing\s*\(\s*['"`]PlatformConstants['"`]\s*\)/;
function searchDirectory(directory) {
    var entries = fs_1.default.readdirSync(directory, { withFileTypes: true });
    for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
        var entry = entries_1[_i];
        var fullPath = path_1.default.join(directory, entry.name);
        if (entry.isDirectory()) {
            searchDirectory(fullPath);
        }
        else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
            var content = fs_1.default.readFileSync(fullPath, 'utf-8');
            if (targetPattern.test(content)) {
                console.log("Potential issue found in: ".concat(fullPath));
            }
        }
    }
}
searchDirectory(projectRoot);
