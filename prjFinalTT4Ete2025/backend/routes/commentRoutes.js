const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/CommentController');
const { authenticateToken } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes pour les commentaires
router.post('/', CommentController.createComment);
router.get('/post/:postId', CommentController.getPostComments);
router.get('/:id', CommentController.getCommentById);
router.put('/:id', CommentController.updateComment);
router.delete('/:id', CommentController.deleteComment);
router.get('/user/:userId', CommentController.getUserComments);

module.exports = router;
