const express = require('express');
const router = express.Router();
const { getProduct } = require('../controllers/productController');
const optionalAuth = require('../middleware/optionalAuth');

router.get('/:barcode', optionalAuth, getProduct);

module.exports = router;
