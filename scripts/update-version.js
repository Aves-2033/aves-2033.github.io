import fs from 'fs';
import path from 'path';

const SHARED_JS = 'src/scripts/shared.js';

if (fs.existsSync(SHARED_JS)) {
    let content = fs.readFileSync(SHARED_JS, 'utf8');
    
    // Generate version: YYYY.MM.DD.HHMM
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const newVersion = `${year}.${month}.${day}.${hours}${minutes}`;
    
    // Replace: const APP_VERSION = '...';
    const updatedContent = content.replace(
        /const APP_VERSION = '.*?';/,
        `const APP_VERSION = '${newVersion}';`
    );
    
    fs.writeFileSync(SHARED_JS, updatedContent, 'utf8');
    console.log(`Updated APP_VERSION to ${newVersion} in ${SHARED_JS}`);
} else {
    console.error(`File ${SHARED_JS} not found!`);
}
