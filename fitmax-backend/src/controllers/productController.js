const axios = require('axios');
const pool = require('../config/db');
const { calculateScore } = require('../services/scoringService');
const { getUserModifiers } = require('../services/personalizationService');
const { getAlternatives } = require('../services/alternativeService');

const OPENFOOD_API = process.env.OPENFOODFACTS_API;

async function getProduct(req, res) {
    const barcode = req.params.barcode;
    const userId = req.userId || null; // Guest if null

    try {
        // Step 1 – Check DB cache
        const [rows] = await pool.query(
            "SELECT * FROM products WHERE barcode = ?",
            [barcode]
        );

        let product = rows[0];

        let nutrients;
        let baseScoreData;

        // =====================================
        // IF PRODUCT NOT IN DB → FETCH API
        // =====================================
        if (!product) {
            const response = await axios.get(`${OPENFOOD_API}/${barcode}.json`);

            if (!response.data || !response.data.product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            const p = response.data.product;

            nutrients = {
                sugar: parseFloat(p.nutriments?.sugars_100g) || 0,
                salt: parseFloat(p.nutriments?.salt_100g) || 0,
                saturated_fat: parseFloat(p.nutriments?.saturated-fat_100g) || 0,
                fiber: parseFloat(p.nutriments?.fiber_100g) || 0,
                calories: parseFloat(p.nutriments?.energy-kcal_100g) || 0
            };

            baseScoreData = calculateScore(nutrients);

            // Save base score in DB (non-personalized)
            await pool.query(
                `INSERT INTO products 
                (barcode,name,brand,category,sugar,salt,saturated_fat,fiber,calories,score)
                VALUES (?,?,?,?,?,?,?,?,?,?)`,
                [
                    barcode,
                    p.product_name || "",
                    p.brands || "",
                    p.categories || "",
                    nutrients.sugar,
                    nutrients.salt,
                    nutrients.saturated_fat,
                    nutrients.fiber,
                    nutrients.calories,
                    baseScoreData.score
                ]
            );

            product = {
                barcode,
                name: p.product_name,
                brand: p.brands,
                category: p.categories,
                ...nutrients,
                score: baseScoreData.score,
                ...baseScoreData
            };

        } else {
            // Product found in DB
            nutrients = {
                sugar: product.sugar,
                salt: product.salt,
                saturated_fat: product.saturated_fat,
                fiber: product.fiber,
                calories: product.calories
            };

            baseScoreData = calculateScore(nutrients);

            product.color = baseScoreData.color;
            product.warnings = baseScoreData.warnings;
        }

        // =====================================
        // APPLY PERSONALIZATION IF LOGGED IN
        // =====================================
        let mode = "guest";

        if (userId) {
            const modifiers = await getUserModifiers(userId);
            const personalized = calculateScore(nutrients, modifiers);

            product.score = personalized.score;
            product.color = personalized.color;
            product.warnings = personalized.warnings;

            mode = "personalized";
        }

        // =====================================
        // ALTERNATIVES
        // =====================================
        const alternatives = await getAlternatives(
            product.category,
            product.score
        );

        res.json({
            success: true,
            mode, // 🔥 tells frontend if guest or personalized
            product,
            alternatives
        });

    } catch (err) {
        console.error("PRODUCT ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

module.exports = { getProduct };
