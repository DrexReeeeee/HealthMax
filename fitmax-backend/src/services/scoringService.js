function calculateScore(nutrients, modifiers = { sugar_modifier: 1, salt_modifier: 1, fat_modifier: 1 }) {
    let { sugar = 0, salt = 0, saturated_fat = 0, fiber = 0 } = nutrients;

    sugar *= modifiers.sugar_modifier;
    salt *= modifiers.salt_modifier;
    saturated_fat *= modifiers.fat_modifier;

    let score = 5;
    let warnings = [];

    if (sugar > 15) { score -= 2; warnings.push("High sugar"); }
    else if (sugar > 5) score -= 1;

    if (salt > 1) { score -= 2; warnings.push("High salt"); }
    else if (salt > 0.5) score -= 1;

    if (saturated_fat > 10) { score -= 2; warnings.push("High saturated fat"); }
    else if (saturated_fat > 3) score -= 1;

    if (fiber >= 3) score += 1;
    else if (fiber < 1) score -= 1;

    score = Math.max(1, Math.min(score, 5));

    let color = score >= 4 ? "green" : score === 3 ? "yellow" : "red";

    return { score, color, warnings };
}

module.exports = { calculateScore };
