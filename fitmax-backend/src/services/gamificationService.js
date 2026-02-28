const pool = require('../config/db');

async function updateGamification(userId, score) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const [rows] = await conn.query("SELECT * FROM gamification WHERE user_id = ?", [userId]);
        const today = new Date().toISOString().split('T')[0];

        let gamification = rows[0];
        if (!gamification) {
            await conn.query(
                "INSERT INTO gamification (user_id, total_points, current_streak, longest_streak, healthy_percentage, last_scan_date) VALUES (?,0,0,0,0,NULL)",
                [userId]
            );
            gamification = { total_points: 0, current_streak: 0, longest_streak: 0, last_scan_date: null };
        }

        // Points
        let points = score >= 4 ? 10 : score === 3 ? 5 : 0;
        let current_streak = gamification.current_streak;
        let longest_streak = gamification.longest_streak;

        // Streak
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (gamification.last_scan_date === yesterday) current_streak += 1;
        else current_streak = 1;

        if (current_streak > longest_streak) longest_streak = current_streak;

        // Healthy percentage
        const [[{ healthy_count }]] = await conn.query(
            "SELECT COUNT(*) AS healthy_count FROM scans WHERE user_id = ? AND score >= 4",
            [userId]
        );
        const [[{ total_scans }]] = await conn.query(
            "SELECT COUNT(*) AS total_scans FROM scans WHERE user_id = ?",
            [userId]
        );
        const healthy_percentage = total_scans ? (healthy_count / total_scans) * 100 : 0;

        await conn.query(
            "UPDATE gamification SET total_points = total_points + ?, current_streak = ?, longest_streak = ?, healthy_percentage = ?, last_scan_date = ? WHERE user_id = ?",
            [points, current_streak, longest_streak, healthy_percentage, today, userId]
        );

        await conn.commit();
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

module.exports = { updateGamification };
