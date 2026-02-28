const express = require('express');
const router = express.Router();
const { saveProfile, getProfile } = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, saveProfile);
router.get('/', authMiddleware, getProfile);

module.exports = router;
