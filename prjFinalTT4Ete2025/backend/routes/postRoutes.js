const express = require('express');
const router = express.Router();
const PostsController = require('../controllers/PostsController');
const { authenticateToken } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes pour les publications
router.post('/', PostsController.createPost);
router.get('/', PostsController.getAllPosts);
router.get('/:id', PostsController.getPostById);
router.put('/:id', PostsController.updatePost);
router.delete('/:id', PostsController.deletePost);
router.get('/user/:userId', PostsController.getUserPosts);

module.exports = router;
