export const prerender = false;
import { writeFileSync, readFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET,
  secure: true
});

const CLOUDINARY_FOLDER = 'aves-web';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper to get project root
const projectRoot = join(__dirname, '../../../../');
const SRC_JSON = join(projectRoot, 'src/data/products.json');
const PUBLIC_JSON = join(projectRoot, 'public/data/products.json');


function syncJson(data) {
    const formatted = JSON.stringify(data, null, 4);
    writeFileSync(SRC_JSON, formatted, 'utf-8');
    writeFileSync(PUBLIC_JSON, formatted, 'utf-8');
}

const cyrillicToLatinMap = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
    'я': 'ya'
};

function transliterate(text) {
    return text.toLowerCase().split('').map(char => {
        return cyrillicToLatinMap[char] !== undefined ? cyrillicToLatinMap[char] : char;
    }).join('');
}

function createSlug(title) {
    let slug = transliterate(title);
    // Replace non-alphanumeric characters with spaces, trim, and replace spaces with hyphens
    slug = slug.replace(/[^a-z0-9]+/g, ' ')
               .trim()
               .replace(/\s+/g, '-');
    return slug;
}

export async function POST({ request }) {
    if (import.meta.env.PROD) {
        return new Response(JSON.stringify({ error: 'Not allowed in production' }), { status: 403 });
    }

    try {
        const rawText = await request.text();
        const payload = JSON.parse(rawText || '{}');
        const action = payload.action;

        const products = JSON.parse(readFileSync(SRC_JSON, 'utf-8').replace(/^\uFEFF/, ''));

        if (action === 'createProduct') {
            const title = payload.title || 'Новый товар';
            const category = payload.category || 'ball';
            const price = parseInt(payload.price) || 0;
            const description = payload.description || '';
            const details = payload.details || {};

            const maxId = products.reduce((max, p) => p.id > max ? p.id : max, 0);
            const newId = maxId + 1;

            let baseSlug = createSlug(title);
            let finalSlug = baseSlug;
            if (products.some(p => p.slug === finalSlug)) {
                finalSlug = `${baseSlug}-${newId}`;
            }

            const newProduct = {
                id: newId,
                title,
                price,
                category,
                images: [],
                description,
                details,
                slug: finalSlug
            };

            products.push(newProduct);
            syncJson(products);
            return new Response(JSON.stringify({ success: true, product: newProduct }));
        }

        const productId = parseInt(payload.productId);
        if (!productId) throw new Error('Product ID is required');

        const productIndex = products.findIndex(p => p.id === productId);
        if (productIndex === -1) throw new Error('Product not found');

        if (action === 'addImage') {
            const source = payload.source; // 'url' or 'base64'
            let cloudinaryUrl = '';

            if (source === 'url') {
                const url = payload.url;
                const result = await cloudinary.uploader.upload(url, {
                    folder: CLOUDINARY_FOLDER,
                    public_id: `product_${productId}_${Date.now()}`,
                    timeout: 120000
                });
                cloudinaryUrl = result.secure_url;
            } else if (source === 'base64') {
                const fileBase64 = payload.file; // data:image/jpeg;base64,...
                const result = await cloudinary.uploader.upload(fileBase64, {
                    folder: CLOUDINARY_FOLDER,
                    public_id: `product_${productId}_${Date.now()}`,
                    timeout: 120000
                });
                cloudinaryUrl = result.secure_url;
            }

            if (!products[productIndex].images) products[productIndex].images = [];
            products[productIndex].images.push(cloudinaryUrl);
            
            syncJson(products);
            return new Response(JSON.stringify({ success: true, url: cloudinaryUrl }));
        }

        if (action === 'updateInfo') {
            const metadata = payload.metadata;
            products[productIndex] = { ...products[productIndex], ...metadata };
            syncJson(products);
            return new Response(JSON.stringify({ success: true }));
        }

        return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 });

    } catch (e) {
        console.error("API POST Error:", e);
        const errMsg = e.message || (e.error && e.error.message) || (typeof e === 'object' ? JSON.stringify(e) : String(e));
        return new Response(JSON.stringify({ error: errMsg }), { status: 500 });
    }
}


export async function DELETE({ request }) {
    if (import.meta.env.PROD) {
        return new Response(JSON.stringify({ error: 'Not allowed in production' }), { status: 403 });
    }

    try {
        const { productId, imagePath, action } = await request.json();

        const products = JSON.parse(readFileSync(SRC_JSON, 'utf-8').replace(/^\uFEFF/, ''));
        const productIndex = products.findIndex(p => p.id === productId);
        if (productIndex === -1) throw new Error('Product not found');

        if (action === 'deleteImage') {
            products[productIndex].images = products[productIndex].images.filter(img => img !== imagePath);
            
            if (imagePath.includes('cloudinary.com')) {
                try {
                    const publicId = `${CLOUDINARY_FOLDER}/` + imagePath.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                } catch (err) {
                    console.error('Error deleting from Cloudinary:', err);
                }
            } else if (imagePath.startsWith('/img/products/')) {
                const fullPath = join(projectRoot, 'public', imagePath);
                // Защита от path traversal: путь должен быть строго внутри public/img/products/
                const allowedBase = join(projectRoot, 'public', 'img', 'products');
                if (!fullPath.startsWith(allowedBase + '/') && fullPath !== allowedBase) {
                    console.error('Path traversal attempt blocked:', imagePath);
                } else if (existsSync(fullPath)) {
                    try { unlinkSync(fullPath); } catch (err) { console.error(`Error deleting ${fullPath}:`, err); }
                }
            }
            
            syncJson(products);
            return new Response(JSON.stringify({ success: true }));
        }

        if (action === 'deleteProduct') {
            const product = products[productIndex];
            
            if (product.images && Array.isArray(product.images)) {
                for (const path of product.images) {
                    if (path.includes('cloudinary.com')) {
                        try {
                            const publicId = `${CLOUDINARY_FOLDER}/` + path.split('/').pop().split('.')[0];
                            await cloudinary.uploader.destroy(publicId);
                        } catch (err) {}
                    } else if (path.startsWith('/img/products/')) {
                        const fullPath = join(projectRoot, 'public', path);
                        if (existsSync(fullPath)) {
                            try { unlinkSync(fullPath); } catch (err) {}
                        }
                    }
                }
            }

            products.splice(productIndex, 1);
            syncJson(products);
            return new Response(JSON.stringify({ success: true }));
        }

        return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 });
    } catch (e) {
        console.error("API DELETE Error:", e);
        const errMsg = e.message || (e.error && e.error.message) || (typeof e === 'object' ? JSON.stringify(e) : String(e));
        return new Response(JSON.stringify({ error: errMsg }), { status: 500 });
    }
}
