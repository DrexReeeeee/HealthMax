const pool = require('../config/db');
const { updateGamification } = require('../services/gamificationService');

async function saveScan(req, res) {
    const { barcode, score } = req.body;
    const userId = req.userId;

    try {
        await pool.query("INSERT INTO scans (user_id, barcode, score) VALUES (?,?,?)", [userId, barcode, score]);
        await updateGamification(userId, score);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

async function getHistory(req, res) {
    const userId = req.userId;
    try {
        const [rows] = await pool.query("SELECT * FROM scans WHERE user_id = ? ORDER BY scanned_at DESC", [userId]);
        res.json({ success: true, scans: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

module.exports = { saveScan, getHistory };
