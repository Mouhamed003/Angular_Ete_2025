const { Comment, User, Post, Like } = require('../models');

class CommentController {
  // Créer un commentaire
  static async createComment(req, res) {
    try {
      const { content, postId } = req.body;
      const userId = req.user.id;

      // Vérifier que le post existe
      const post = await Post.findByPk(postId);
      if (!post) {
        return res.status(404).json({ error: 'Publication non trouvée' });
      }

      const comment = await Comment.create({
        content,
        userId,
        postId
      });

      // Récupérer le commentaire avec les informations de l'auteur
      const commentWithAuthor = await Comment.findByPk(comment.id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }]
      });

      res.status(201).json({
        message: 'Commentaire créé avec succès',
        comment: commentWithAuthor
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Obtenir tous les commentaires d'une publication
  static async getPostComments(req, res) {
    try {
      const { postId } = req.params;

      // Vérifier que le post existe
      const post = await Post.findByPk(postId);
      if (!post) {
        return res.status(404).json({ error: 'Publication non trouvée' });
      }

      const comments = await Comment.findAll({
        where: { postId },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
          },
          {
            model: Like,
            as: 'likes',
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'username']
            }]
          }
        ],
        order: [['createdAt', 'ASC']]
      });

      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Obtenir un commentaire par ID
  static async getCommentById(req, res) {
    try {
      const { id } = req.params;

      const comment = await Comment.findByPk(id, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
          },
          {
            model: Post,
            as: 'post',
            attributes: ['id', 'title']
          },
          {
            model: Like,
            as: 'likes',
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'username']
            }]
          }
        ]
      });

      if (!comment) {
        return res.status(404).json({ error: 'Commentaire non trouvé' });
      }

      res.json(comment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Mettre à jour un commentaire
  static async updateComment(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      const comment = await Comment.findByPk(id);

      if (!comment) {
        return res.status(404).json({ error: 'Commentaire non trouvé' });
      }

      // Vérifier que l'utilisateur est le propriétaire du commentaire
      if (comment.userId !== userId) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }

      await comment.update({ content });

      // Récupérer le commentaire mis à jour avec les informations de l'auteur
      const updatedComment = await Comment.findByPk(id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }]
      });

      res.json({
        message: 'Commentaire mis à jour avec succès',
        comment: updatedComment
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Supprimer un commentaire
  static async deleteComment(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const comment = await Comment.findByPk(id);

      if (!comment) {
        return res.status(404).json({ error: 'Commentaire non trouvé' });
      }

      // Vérifier que l'utilisateur est le propriétaire du commentaire
      if (comment.userId !== userId) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }

      await comment.destroy();

      res.json({ message: 'Commentaire supprimé avec succès' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Obtenir tous les commentaires d'un utilisateur
  static async getUserComments(req, res) {
    try {
      const { userId } = req.params;

      const comments = await Comment.findAll({
        where: { userId },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
          },
          {
            model: Post,
            as: 'post',
            attributes: ['id', 'title'],
            include: [{
              model: User,
              as: 'author',
              attributes: ['id', 'username']
            }]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = CommentController;
