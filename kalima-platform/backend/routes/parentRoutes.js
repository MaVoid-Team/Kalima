const express = require('express');
const parentController = require('../controllers/parentController');

const router = express.Router();

router.post('/', parentController.createParent);

router.get('/', parentController.getAllParents);

router.get('/:id', parentController.getParentById);

router.patch('/:id', parentController.updateParent);

router.delete('/:id', parentController.deleteParent);

module.exports = router;
