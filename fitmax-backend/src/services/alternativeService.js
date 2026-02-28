const pool = require('../config/db');

async function getAlternatives(category, minScore) {
    const [rows] = await pool.query(
        "SELECT name, score, barcode FROM products WHERE category = ? AND score > ? ORDER BY score DESC LIMIT 3",
        [category, minScore]
    );
    return rows;
}

module.exports = { getAlternatives };
