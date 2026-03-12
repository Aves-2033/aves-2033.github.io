import fs from 'fs';
import path from 'path';

const filesToHide = [
    'src/pages/admin.astro',
    'src/pages/api/admin/products.js'
];

filesToHide.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`Hiding ${file} for production build...`);
        fs.renameSync(file, file + '.hidden');
    }
});
