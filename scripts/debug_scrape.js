const https = require('https');
const cheerio = require('cheerio');

const url = 'https://wikiwiki.jp/poke_sleep/%E6%96%99%E7%90%86/%E3%83%AC%E3%82%B7%E3%83%94%E3%81%AE%E4%B8%80%E8%A6%A7';

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', (err) => reject(err));
    });
}

async function diagnose() {
    console.log('Fetching...');
    const html = await fetchUrl(url);
    const $ = cheerio.load(html);
    
    $('table').each((i, el) => {
        const rows = $(el).find('tr');
        if (rows.length > 3) { // Only look at tables with data
            console.log(`Table ${i} (${rows.length} rows)`);
            const cells = $(rows[1]).find('td'); // Check first data row (assuming row 0 is header)
            
            if (cells.length > 0) {
                 cells.each((j, cell) => {
                     console.log(`    Cell ${j}: "${$(cell).text().trim()}"`);
                 });
            } else {
                console.log('    No cells in row 1');
            }
        }
    });
}
diagnose();
