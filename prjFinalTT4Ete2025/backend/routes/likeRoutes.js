const express = require('express');
const router = express.Router();
const LikesController = require('../controllers/LikesController');
const { authenticateToken } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes pour les likes
router.post('/post/:postId', LikesController.togglePostLike);
router.post('/comment/:commentId', LikesController.toggleCommentLike);
router.get('/post/:postId', LikesController.getPostLikes);
router.get('/comment/:commentId', LikesController.getCommentLikes);
router.get('/user/:userId', LikesController.getUserLikes);
router.get('/post/:postId/check', LikesController.checkPostLike);
router.get('/comment/:commentId/check', LikesController.checkCommentLike);

module.exports = router;
