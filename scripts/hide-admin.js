import fs from 'fs';
import path from 'path';

const SRC_PAGES = 'src/pages';
const ADMIN_PAGE = path.join(SRC_PAGES, 'admin.astro');
const API_DIR = path.join(SRC_PAGES, 'api');

// Move to root during build
if (fs.existsSync(ADMIN_PAGE)) {
    fs.renameSync(ADMIN_PAGE, 'admin.astro.bak');
}

if (fs.existsSync(API_DIR)) {
    fs.renameSync(API_DIR, 'api_dir.bak');
}

console.log('Admin & API hidden for build.');
