import fs from 'fs';
import path from 'path';

const SHARED_JS = 'src/scripts/shared.js';
const SRC_JSON = 'src/data/products.json';
const PUBLIC_JSON = 'public/data/products.json';

// --- Synchronize products.json safely between src/data and public/data ---
try {
    const publicDir = path.dirname(PUBLIC_JSON);
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    if (fs.existsSync(SRC_JSON) && fs.existsSync(PUBLIC_JSON)) {
        const srcStat = fs.statSync(SRC_JSON);
        const publicStat = fs.statSync(PUBLIC_JSON);

        if (srcStat.mtimeMs > publicStat.mtimeMs) {
            fs.copyFileSync(SRC_JSON, PUBLIC_JSON);
            console.log('Synced products.json: src/data -> public/data');
        } else if (publicStat.mtimeMs > srcStat.mtimeMs) {
            fs.copyFileSync(PUBLIC_JSON, SRC_JSON);
            console.log('Synced products.json: public/data -> src/data');
        }
    } else if (fs.existsSync(SRC_JSON) && !fs.existsSync(PUBLIC_JSON)) {
        fs.copyFileSync(SRC_JSON, PUBLIC_JSON);
        console.log('Copied products.json: src/data -> public/data');
    } else if (!fs.existsSync(SRC_JSON) && fs.existsSync(PUBLIC_JSON)) {
        fs.copyFileSync(PUBLIC_JSON, SRC_JSON);
        console.log('Copied products.json: public/data -> src/data');
    }
} catch (err) {
    console.error(`Error syncing products.json: ${err.message}`);
}

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

