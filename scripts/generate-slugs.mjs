import fs from 'fs/promises';
import path from 'path';

const SRC_DATA_PATH = path.resolve('src/data/products.json');
const PUBLIC_DATA_PATH = path.resolve('public/data/products.json');

// Table for cyrillic to latin transliteration
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

async function processProducts() {
    try {
        console.log('Reading products.json from src/data...');
        const rawData = await fs.readFile(SRC_DATA_PATH, 'utf-8');
        const products = JSON.parse(rawData);
        
        const slugCounts = new Map();
        let updatedCount = 0;

        for (const product of products) {
            if (!product.title) continue;
            
            let baseSlug = createSlug(product.title);
            let finalSlug = baseSlug;
            
            // Check for collisions
            if (slugCounts.has(baseSlug)) {
                // Collision! Append ID
                finalSlug = `${baseSlug}-${product.id}`;
            } else {
                slugCounts.set(baseSlug, true);
            }
            
            // Allow re-running the script safely; only update if changed
            if (product.slug !== finalSlug) {
                product.slug = finalSlug;
                updatedCount++;
            }
        }
        
        console.log(`Generated/updated slugs for ${updatedCount} products.`);
        
        const formattedJson = JSON.stringify(products, null, 4) + '\n'; // Keep original formatting
        
        console.log('Writing back to src/data/products.json...');
        await fs.writeFile(SRC_DATA_PATH, formattedJson, 'utf-8');
        
        console.log('Writing to public/data/products.json...');
        await fs.writeFile(PUBLIC_DATA_PATH, formattedJson, 'utf-8');
        
        console.log('Done! Slug generation complete.');
        
    } catch (e) {
        console.error('Error processing products:', e);
        process.exit(1);
    }
}

processProducts();
