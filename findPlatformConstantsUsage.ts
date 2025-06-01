import fs from 'fs';
import path from 'path';

const projectRoot = __dirname; 

const targetPattern = /TurboModuleRegistry\.getEnforcing\s*\(\s*['"`]PlatformConstants['"`]\s*\)/;

function searchDirectory(directory: string) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      searchDirectory(fullPath);
    } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (targetPattern.test(content)) {
        console.log(`Potential issue found in: ${fullPath}`);
      }
    }
  }
}

searchDirectory(projectRoot);
