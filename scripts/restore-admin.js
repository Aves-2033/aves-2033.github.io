import fs from 'fs';
import path from 'path';

const filesToRestore = [
    'src/pages/admin.astro.hidden',
    'src/pages/api/admin/products.js.hidden'
];

filesToRestore.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`Restoring ${file.replace('.hidden', '')}...`);
        fs.renameSync(file, file.replace('.hidden', ''));
    }
});
