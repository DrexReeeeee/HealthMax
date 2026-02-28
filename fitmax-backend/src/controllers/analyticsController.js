const pool = require('../config/db');

async function getAnalytics(req, res) {
    const userId = req.userId;

    try {
        const [[{ total_scans }]] = await pool.query("SELECT COUNT(*) AS total_scans FROM scans WHERE user_id = ?", [userId]);
        const [[{ healthy_count }]] = await pool.query("SELECT COUNT(*) AS healthy_count FROM scans WHERE user_id = ? AND score >= 4", [userId]);
        const [gamification] = await pool.query("SELECT * FROM gamification WHERE user_id = ?", [userId]);

        const healthy_percentage = total_scans ? (healthy_count / total_scans) * 100 : 0;

        res.json({
            success: true,
            total_scans,
            healthy_count,
            healthy_percentage,
            gamification: gamification[0] || {}
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

module.exports = { getAnalytics };
