const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

router.get('/', playerController.getAll);
router.get('/:id', playerController.getProfile);
router.put('/:id', playerController.updateProfile);
router.get('/:id/matches', playerController.getPlayerMatches);

module.exports = router;
