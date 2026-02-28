const pool = require('../config/db');

/**
 * Get all users (Admin only)
 * @route GET /api/users
 * @access Admin
 */
async function getAllUsers(req, res) {
    if (!req.isAdmin) {
        return res.status(403).json({ success: false, message: "Access denied. Admins only." });
    }

    try {
        const [rows] = await pool.query(
            `SELECT u.id AS user_id, u.email, u.is_admin, u.created_at,
                    up.age, up.weight, up.health_goal, up.diet_plan_id,
                    dp.name AS diet_plan_name, dp.description AS diet_plan_description
             FROM users u
             LEFT JOIN user_profiles up ON u.id = up.user_id
             LEFT JOIN diet_plans dp ON up.diet_plan_id = dp.id
             ORDER BY u.id ASC`
        );

        res.json({ success: true, users: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

/**
 * Update a user (Admin only)
 * @route PUT /api/users/:id
 * @access Admin
 */
async function updateUser(req, res) {
    if (!req.isAdmin) {
        return res.status(403).json({ success: false, message: "Access denied. Admins only." });
    }

    const userId = req.params.id;
    const { email, is_admin } = req.body;

    try {
        const [existing] = await pool.query("SELECT * FROM users WHERE id = ?", [userId]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        await pool.query(
            "UPDATE users SET email = ?, is_admin = ? WHERE id = ?",
            [email || existing[0].email, is_admin != null ? is_admin : existing[0].is_admin, userId]
        );

        res.json({ success: true, message: "User updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

/**
 * Delete a user (Admin only)
 * @route DELETE /api/users/:id
 * @access Admin
 */
async function deleteUser(req, res) {
    if (!req.isAdmin) {
        return res.status(403).json({ success: false, message: "Access denied. Admins only." });
    }

    const userId = req.params.id;

    try {
        const [existing] = await pool.query("SELECT * FROM users WHERE id = ?", [userId]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        await pool.query("DELETE FROM user_profiles WHERE user_id = ?", [userId]);
        await pool.query("DELETE FROM users WHERE id = ?", [userId]);

        res.json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

module.exports = { getAllUsers, updateUser, deleteUser };
