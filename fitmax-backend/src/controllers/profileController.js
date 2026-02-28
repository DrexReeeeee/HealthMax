const pool = require('../config/db');

/**
 * Save or update user profile
 * @route POST /api/profile
 * @access Authenticated
 */
async function saveProfile(req, res = null) {
    const userId = req.userId;
    const { username, age, weight, diet_plan_id } = req.body;

    // Default modifiers
    let sugar_modifier = 1, salt_modifier = 1, fat_modifier = 1;

    // Determine modifiers based on diet plan name
    if (diet_plan_id) {
        const [dietRows] = await pool.query(
            `SELECT name
             FROM diet_plans
             WHERE id = ?`,
            [diet_plan_id]
        );

        if (dietRows.length > 0) {
            const planName = dietRows[0].name.toLowerCase();
            if (planName.includes("low-sugar")) sugar_modifier = 1.5;
            if (planName.includes("diabetic")) sugar_modifier = 2.0;
            if (planName.includes("low-salt")) salt_modifier = 1.5;
        }
    }

    try {
        // Check if username is taken (only if updating)
        if (username) {
            const [existingUsername] = await pool.query(
                "SELECT * FROM user_profiles WHERE username = ? AND user_id != ?",
                [username, userId]
            );
            if (existingUsername.length > 0) {
                if (res) return res.status(400).json({ success: false, message: "Username already taken" });
                throw new Error("Username already taken");
            }
        }

        // Update profile
        await pool.query(
            `UPDATE user_profiles
             SET username = ?, age = ?, weight = ?, diet_plan_id = ?,
                 sugar_modifier = ?, salt_modifier = ?, fat_modifier = ?
             WHERE user_id = ?`,
            [username, age, weight, diet_plan_id,
             sugar_modifier, salt_modifier, fat_modifier, userId]
        );

        // Fetch updated profile with diet plan info
        const [rows] = await pool.query(
            `SELECT up.*, dp.name AS diet_plan_name, dp.description AS diet_plan_description
             FROM user_profiles up
             LEFT JOIN diet_plans dp ON up.diet_plan_id = dp.id
             WHERE up.user_id = ?`,
            [userId]
        );

        const updatedProfile = rows[0];

        if (res) {
            return res.json({ success: true, profile: updatedProfile });
        } else {
            return updatedProfile; // for internal calls (e.g., registration)
        }

    } catch (err) {
        console.error("SAVE PROFILE ERROR:", err);
        if (res) res.status(500).json({ success: false, message: "Server error" });
        else throw err;
    }
}

/**
 * Get user profile
 * @route GET /api/profile
 * @access Authenticated
 */
async function getProfile(req, res) {
    const userId = req.userId;
    try {
        const [rows] = await pool.query(
            `SELECT up.*, dp.name AS diet_plan_name, dp.description AS diet_plan_description
             FROM user_profiles up
             LEFT JOIN diet_plans dp ON up.diet_plan_id = dp.id
             WHERE up.user_id = ?`,
            [userId]
        );

        res.json({ success: true, profile: rows[0] || {} });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

module.exports = { saveProfile, getProfile };
