const https = require('https');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const url = 'https://wikiwiki.jp/poke_sleep/%E6%96%99%E7%90%86/%E3%83%AC%E3%82%B7%E3%83%94%E3%81%AE%E4%B8%80%E8%A6%A7';

const ingredientMap = {
  'とくせんリンゴ': 'apple', 'モーモーミルク': 'milk', 'ワカクサ大豆': 'soybean', 'あまいミツ': 'honey',
  'マメミート': 'sausage', 'あったかジンジャー': 'ginger', 'あんみんトマト': 'tomato', 'とくせんエッグ': 'egg',
  'ピュアなオイル': 'oil', 'ほっこりポテト': 'potato', 'げきからハーブ': 'herb', 'リラックスカカオ': 'cacao',
  'あじわいキノコ': 'mushroom', 'ふといながねぎ': 'leek', 'おいしいシッポ': 'tail', 'ワカクサコーン': 'corn',
  'めざましコーヒー': 'coffee', 'ずっしりカボチャ': 'pumpkin', 'つやつやアボカド': 'avocado'
};

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', (err) => reject(err));
    });
}

function normalizeName(name) {
    return name.replace(/\r?\n/g, '').replace(/\s+/g, ' ').replace(/・/g, '').trim();
}

async function scrape() {
    console.log('Fetching URL...');
    const html = await fetchUrl(url);
    console.log(`Fetched HTML of length ${html.length}`);
    const $ = cheerio.load(html);
    
    const recipes = [];
    let currentCategory = 'unknown';

    // Iterate over H3 headers and Tables in document order
    const elements = $('h3, table');
    console.log(`Found ${elements.length} elements (headers + tables)`);

    elements.each((i, el) => {
        const $el = $(el);
        // Check if header
        if ($el.is('h3')) {
            const text = $el.text();
            if (text.includes('カレー')) currentCategory = 'curry';
            else if (text.includes('サラダ')) currentCategory = 'salad';
            else if (text.includes('デザート')) currentCategory = 'dessert';
            console.log(`Found header: "${text}" -> Category: ${currentCategory}`);
            return;
        }

        // Process Table
        if ($el.is('table')) {
            if (currentCategory === 'unknown') return; // Skip tables before meaningful headers

            const rows = $el.find('tr');
            rows.each((j, row) => {
                const cells = $(row).find('td');
                if (cells.length < 5) return;

                // Adjust indices based on debug output
                // Cell 2: Name
                // Cell 3: Ingredients
                // Cell 5: Energy (can be index 5 or 4 depending on colspans)
                
                // Let's dynamically find the ingredients column
                // Check if Cell 3 matches ingredient pattern
                let ingColIndex = 3;
                let nameColIndex = 2;
                let energyColIndex = 5;

                let ingredientsText = $(cells[ingColIndex]).text().trim();
                
                // If cell 3 doesn't look like ingredients, try shifting?
                // Mixed curry row: Name at 2, Ing at 3 ("他のレシピに該当しない組み合わせ")
                // Standard row: should be same.
                
                // Filter out headers/spacers
                // If ingredients text is just "-" or empty, skip
                if (ingredientsText === '-' || ingredientsText === '') return;

                // Check for "x" or known ingredient name
                const hasDigit = /\d/.test(ingredientsText);
                const hasX = /[x×]/.test(ingredientsText);
                
                // If it's a real recipe, it must have ingredients with counts.
                // Exception: "Mixed Curry" (no counts). We skip Mixed Curry usually? 
                // Using "unknown" logic for ingredients if not matching.
                if (!hasDigit && !hasX && !ingredientsText.includes('他のレシピ')) {
                   // Try finding col with ingredients
                   // ...
                   return; 
                }
                
                // Skip the "Mixed" recipes if they don't have ingredients count
                if (!hasX && !hasDigit) return;

                let recipeName = $(cells[nameColIndex]).text().trim();
                recipeName = recipeName.replace(/[\r\n]+/g, '').replace(/\s+/g, ' ');
                
                // Energy
                let energyText = $(cells[energyColIndex]).text().replace(/,/g, '');
                let energy = parseInt(energyText, 10);
                if (isNaN(energy)) {
                    // Try adjacent cell?
                    energyText = $(cells[4]).text().replace(/,/g, '');
                     energy = parseInt(energyText, 10);
                }

                // Parse ingredients
                const ingredients = [];
                let totalIngredients = 0;
                
                const regex = /([^\sx×\d]+)\s*[x×]\s*(\d+)/g;
                let match;
                // Normalize text for regex
                const textToSearch = ingredientsText.replace(/,/g, ''); 
                
                while ((match = regex.exec(textToSearch)) !== null) {
                    let ingNameRaw = match[1].replace(/・/g, '').trim(); 
                    const count = parseInt(match[2], 10);
                    
                    let ingId = null;
                    for (const [key, val] of Object.entries(ingredientMap)) {
                        if (ingNameRaw.includes(key)) {
                            ingId = val;
                            break;
                        }
                    }
                    
                    if (ingId) {
                        const existing = ingredients.find(i => i.id === ingId);
                        if (existing) {
                            existing.count += count;
                        } else {
                            ingredients.push({ id: ingId, count });
                        }
                        totalIngredients += count;
                    }
                }

                if (ingredients.length > 0) {
                    recipes.push({
                        id: recipeName, 
                        name: recipeName,
                        category: currentCategory,
                        ingredients,
                        energy: isNaN(energy) ? 0 : energy,
                        totalIngredients
                    });
                }
            });
        }
    });

    recipes.sort((a, b) => b.energy - a.energy);
    
    // Safety check
    if (recipes.length === 0) {
        console.error("No recipes found! Please inspect logic.");
    }

    const jsonPath = path.resolve('src/data/recipes_scraped.json');
    fs.writeFileSync(jsonPath, JSON.stringify(recipes, null, 2));
    console.log(`Saved JSON to ${jsonPath} (Count: ${recipes.length})`);
    
    const tsPath = path.resolve('src/data/recipes.ts');
    const tsContent = `import { Recipe } from "@/types";

export const recipes: Recipe[] = ${JSON.stringify(recipes, null, 2)};
`;
    fs.writeFileSync(tsPath, tsContent);
    console.log(`Updated ${tsPath}`);
}

scrape().catch(err => console.error(err));
