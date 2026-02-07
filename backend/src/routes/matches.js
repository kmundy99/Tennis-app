const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');

router.get('/', matchController.getAll);
router.post('/', matchController.create);
router.get('/:id', matchController.getById);
router.delete('/:id', matchController.cancel);
router.post('/:id/join', matchController.join);
router.delete('/:id/leave', matchController.leave);

module.exports = router;
