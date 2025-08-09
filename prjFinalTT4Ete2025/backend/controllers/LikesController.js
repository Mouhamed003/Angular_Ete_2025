const { Like, User, Post, Comment } = require('../models');

class LikesController {
  // Ajouter/Retirer un like sur une publication
  static async togglePostLike(req, res) {
    try {
      const { postId } = req.params;
      const userId = req.user.id;

      // Vérifier que le post existe
      const post = await Post.findByPk(postId);
      if (!post) {
        return res.status(404).json({ error: 'Publication non trouvée' });
      }

      // Vérifier si l'utilisateur a déjà liké cette publication
      const existingLike = await Like.findOne({
        where: { userId, postId }
      });

      if (existingLike) {
        // Retirer le like
        await existingLike.destroy();
        res.json({ message: 'Like retiré avec succès', liked: false });
      } else {
        // Ajouter le like
        await Like.create({ userId, postId });
        res.json({ message: 'Like ajouté avec succès', liked: true });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Ajouter/Retirer un like sur un commentaire
  static async toggleCommentLike(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.user.id;

      // Vérifier que le commentaire existe
      const comment = await Comment.findByPk(commentId);
      if (!comment) {
        return res.status(404).json({ error: 'Commentaire non trouvé' });
      }

      // Vérifier si l'utilisateur a déjà liké ce commentaire
      const existingLike = await Like.findOne({
        where: { userId, commentId }
      });

      if (existingLike) {
        // Retirer le like
        await existingLike.destroy();
        res.json({ message: 'Like retiré avec succès', liked: false });
      } else {
        // Ajouter le like
        await Like.create({ userId, commentId });
        res.json({ message: 'Like ajouté avec succès', liked: true });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Obtenir les likes d'une publication
  static async getPostLikes(req, res) {
    try {
      const { postId } = req.params;

      // Vérifier que le post existe
      const post = await Post.findByPk(postId);
      if (!post) {
        return res.status(404).json({ error: 'Publication non trouvée' });
      }

      const likes = await Like.findAll({
        where: { postId },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
        }],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        count: likes.length,
        likes: likes
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Obtenir les likes d'un commentaire
  static async getCommentLikes(req, res) {
    try {
      const { commentId } = req.params;

      // Vérifier que le commentaire existe
      const comment = await Comment.findByPk(commentId);
      if (!comment) {
        return res.status(404).json({ error: 'Commentaire non trouvé' });
      }

      const likes = await Like.findAll({
        where: { commentId },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
        }],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        count: likes.length,
        likes: likes
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Obtenir tous les likes d'un utilisateur
  static async getUserLikes(req, res) {
    try {
      const { userId } = req.params;

      const likes = await Like.findAll({
        where: { userId },
        include: [
          {
            model: Post,
            as: 'post',
            attributes: ['id', 'title', 'content'],
            include: [{
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'firstName', 'lastName']
            }]
          },
          {
            model: Comment,
            as: 'comment',
            attributes: ['id', 'content'],
            include: [{
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'firstName', 'lastName']
            }]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json(likes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Vérifier si un utilisateur a liké une publication
  static async checkPostLike(req, res) {
    try {
      const { postId } = req.params;
      const userId = req.user.id;

      const like = await Like.findOne({
        where: { userId, postId }
      });

      res.json({ liked: !!like });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Vérifier si un utilisateur a liké un commentaire
  static async checkCommentLike(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.user.id;

      const like = await Like.findOne({
        where: { userId, commentId }
      });

      res.json({ liked: !!like });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = LikesController;
