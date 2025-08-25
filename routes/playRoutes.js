const express = require('express');
const router = express.Router();
const { playGame } = require('../controllers/playController');

router.post('/', playGame);

module.exports = router;
