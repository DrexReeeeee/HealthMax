const pool = require('../config/db');

async function getGamification(req, res) {
    const userId = req.userId;
    try {
        const [rows] = await pool.query("SELECT * FROM gamification WHERE user_id = ?", [userId]);
        res.json({ success: true, gamification: rows[0] || {} });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

module.exports = { getGamification };
