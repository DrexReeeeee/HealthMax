# Services

This folder contains business logic modules that handle specific functionality like scoring, personalization, alternatives, and gamification. Services are used by controllers to keep the code modular and reusable.

## Files Overview

### scoringService.js
Calculates health scores for products based on nutritional content.

**Function:**
```
javascript
calculateScore(nutrients, modifiers)
```

**Parameters:**
- `nutrients` (Object): Nutritional values per 100g
  - `sugar`: Sugar content in grams
  - `salt`: Salt content in grams
  - `saturated_fat`: Saturated fat content in grams
  - `fiber`: Fiber content in grams
- `modifiers` (Object): User-specific diet modifiers (optional, defaults to 1)
  - `sugar_modifier`: Multiplier for sugar impact
  - `salt_modifier`: Multiplier for salt impact
  - `fat_modifier`: Multiplier for fat impact

**Returns:**
```
javascript
{
    score: Number,      // 1-5 health score
    color: String,      // "green", "yellow", or "red"
    warnings: String[] // Array of warning messages
}
```

**Scoring Logic:**
- **Base Score:** 5
- **Sugar:**
  - > 15g: -2 points + "High sugar" warning
  - > 5g: -1 point
- **Salt:**
  - > 1g: -2 points + "High salt" warning
  - > 0.5g: -1 point
- **Saturated Fat:**
  - > 10g: -2 points + "High saturated fat" warning
  - > 3g: -1 point
- **Fiber:**
  - ≥ 3g: +1 point
  - < 1g: -1 point

**Score Ranges:**
- 4-5: Green (Healthy)
- 3: Yellow (Moderate)
- 1-2: Red (Unhealthy)

**Sample Test Payloads:**

```
javascript
// Example 1: Healthy product
const nutrients1 = {
    sugar: 2,
    salt: 0.2,
    saturated_fat: 1,
    fiber: 4
};
calculateScore(nutrients1);
// Returns: { score: 5, color: "green", warnings: [] }

// Example 2: Unhealthy product
const nutrients2 = {
    sugar: 20,
    salt: 1.5,
    saturated_fat: 12,
    fiber: 0.5
};
calculateScore(nutrients2);
// Returns: { score: 1, color: "red", warnings: ["High sugar", "High salt", "High saturated fat"] }

// Example 3: Personalized score (diabetic user)
const nutrients3 = {
    sugar: 10,
    salt: 0.5,
    saturated_fat: 2,
    fiber: 2
};
const modifiers = {
    sugar_modifier: 2.0,  // Diabetic - more sensitive to sugar
    salt_modifier: 1,
    fat_modifier: 1
};
calculateScore(nutrients3, modifiers);
// Sugar becomes 20g after modifier, returns: { score: 1, color: "red", warnings: ["High sugar"] }
```

---

### personalizationService.js
Retrieves user-specific modifiers based on their diet plan.

**Function:**
```
javascript
getUserModifiers(userId)
```

**Parameters:**
- `userId` (Number): The user's ID

**Returns:**
```
javascript
{
    sugar_modifier: Number,  // Default: 1
    salt_modifier: Number,   // Default: 1
    fat_modifier: Number     // Default: 1
}
```

**Modifier Values by Diet Plan:**
- **Standard:** All modifiers = 1.0
- **Low Sugar:** sugar_modifier = 1.5
- **Diabetic:** sugar_modifier = 2.0
- **Low Salt:** salt_modifier = 1.5

**Sample Test Payloads:**

```
javascript
// Get modifiers for user with standard diet
await getUserModifiers(1);
// Returns: { sugar_modifier: 1, salt_modifier: 1, fat_modifier: 1 }

// Get modifiers for user with diabetic diet
await getUserModifiers(2);
// Returns: { sugar_modifier: 2.0, salt_modifier: 1, fat_modifier: 1 }

// Get modifiers for non-existent user
await getUserModifiers(999);
// Returns: { sugar_modifier: 1, salt_modifier: 1, fat_modifier: 1 }
```

---

### alternativeService.js
Finds healthier product alternatives from the database.

**Function:**
```
javascript
getAlternatives(category, minScore)
```

**Parameters:**
- `category` (String): Product category to search in
- `minScore` (Number): Minimum health score required

**Returns:**
```
javascript
Array<{
    name: String,
    score: Number,
    barcode: String
}>
```

**Sample Test Payloads:**

```
javascript
// Get alternatives for chips with score 3
await getAlternatives("Chips", 3);
// Returns: [
//   { name: "Baked Potato Chips", score: 4, barcode: "5000159484696" },
//   { name: "Veggie Chips", score: 5, barcode: "5000159484697" },
//   { name: "Rice Crackers", score: 4, barcode: "5000159484698" }
// ]

// Get alternatives for beverages
await getAlternatives("Beverages", 2);
```

---

### gamificationService.js
Handles user gamification logic including points, streaks, and healthy percentage tracking.

**Function:**
```
javascript
updateGamification(userId, score)
```

**Parameters:**
- `userId` (Number): The user's ID
- `score` (Number): Health score of the scanned product (1-5)

**Returns:** Updates the gamification table in the database

**Points System:**
| Score | Points Awarded |
|-------|---------------|
| 4-5 (Green) | 10 points |
| 3 (Yellow) | 5 points |
| 1-2 (Red) | 0 points |

**Streak Logic:**
- Scans on consecutive days increase the streak
- Scanning breaks the streak if more than 1 day gap
- Tracks both current streak and longest streak

**Healthy Percentage:**
- Calculated as: `(healthy_scans / total_scans) * 100`
- Healthy = score >= 4

**Sample Test Payloads:**

```
javascript
// User scans a healthy product (score 4)
await updateGamification(1, 4);
// Updates:
// - total_points: +10
// - current_streak: incremented if consecutive day
// - longest_streak: updated if current exceeds longest
// - healthy_percentage: recalculated

// User scans a unhealthy product (score 2)
await updateGamification(1, 2);
// Updates:
// - total_points: +0
// - current_streak: might reset
// - healthy_percentage: recalculated
```

---

## Service Interactions

### Product Lookup Flow
```
productController.getProduct()
    │
    ├─► scoringService.calculateScore()     // Calculate base score
    │
    ├─► personalizationService.getModifiers() // Get user modifiers (if authenticated)
    │
    ├─► scoringService.calculateScore()     // Recalculate with modifiers
    │
    └─► alternativeService.getAlternatives() // Find healthier options
```

### Scan History Flow
```
historyController.saveScan()
    │
    ├─► INSERT into scans table
    │
    └─► gamificationService.updateGamification()
            │
            ├─► Calculate points
            │
            ├─► Update streak
            │
            └─► Recalculate healthy percentage
```

---

## Integration with Controllers

### Scoring with Personalization (productController)
```
javascript
// Get base score
const baseScoreData = calculateScore(nutrients);

// Apply personalization if user is logged in
if (userId) {
    const modifiers = await getUserModifiers(userId);
    const personalizedScore = calculateScore(nutrients, modifiers);
    // Use personalizedScore for response
}
```

### Gamification Updates (historyController)
```javascript
// Save scan
await pool.query("INSERT INTO scans (user_id, barcode, score) VALUES (?,?,?)", 
    [userId, barcode, score]);

// Update gamification
await updateGamification(userId, score);
```

---

## Error Handling

All services include basic error handling:
- **personalizationService:** Returns default modifiers if user not found
- **alternativeService:** Returns empty array if no alternatives found
- **gamificationService:** Uses database transactions to ensure data integrity
- **scoringService:** Always returns valid score object (handles undefined nutrients)
