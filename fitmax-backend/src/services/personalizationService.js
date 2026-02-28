const pool = require('../config/db');

async function getUserModifiers(userId) {
    const [rows] = await pool.query("SELECT sugar_modifier, salt_modifier, fat_modifier FROM user_profiles WHERE user_id = ?", [userId]);
    if (rows.length === 0) return { sugar_modifier: 1, salt_modifier: 1, fat_modifier: 1 };
    return rows[0];
}

module.exports = { getUserModifiers };
