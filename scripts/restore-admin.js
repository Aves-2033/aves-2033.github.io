import fs from 'fs';
import path from 'path';

const SRC_PAGES = 'src/pages';
const ADMIN_PAGE_BAK = 'admin.astro.bak';
const API_DIR_BAK = 'api_dir.bak';

if (fs.existsSync(ADMIN_PAGE_BAK)) {
    fs.renameSync(ADMIN_PAGE_BAK, path.join(SRC_PAGES, 'admin.astro'));
}

if (fs.existsSync(API_DIR_BAK)) {
    fs.renameSync(API_DIR_BAK, path.join(SRC_PAGES, 'api'));
}

console.log('Admin & API restored after build.');
