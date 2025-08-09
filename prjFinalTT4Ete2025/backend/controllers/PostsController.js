const { Post, User, Comment, Like } = require('../models');

class PostsController {
  // Créer une publication
  static async createPost(req, res) {
    try {
      const { title, content, image } = req.body;
      const userId = req.user.id;

      const post = await Post.create({
        title,
        content,
        image,
        userId
      });

      // Récupérer le post avec les informations de l'auteur
      const postWithAuthor = await Post.findByPk(post.id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }]
      });

      res.status(201).json({
        message: 'Publication créée avec succès',
        post: postWithAuthor
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Obtenir toutes les publications
  static async getAllPosts(req, res) {
    try {
      const posts = await Post.findAll({
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
          },
          {
            model: Comment,
            as: 'comments',
            include: [{
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'firstName', 'lastName']
            }]
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
        order: [['createdAt', 'DESC']]
      });

      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Obtenir une publication par ID
  static async getPostById(req, res) {
    try {
      const { id } = req.params;

      const post = await Post.findByPk(id, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
          },
          {
            model: Comment,
            as: 'comments',
            include: [{
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'firstName', 'lastName']
            }]
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

      if (!post) {
        return res.status(404).json({ error: 'Publication non trouvée' });
      }

      res.json(post);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Mettre à jour une publication
  static async updatePost(req, res) {
    try {
      const { id } = req.params;
      const { title, content, image } = req.body;
      const userId = req.user.id;

      const post = await Post.findByPk(id);

      if (!post) {
        return res.status(404).json({ error: 'Publication non trouvée' });
      }

      // Vérifier que l'utilisateur est le propriétaire de la publication
      if (post.userId !== userId) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }

      await post.update({
        title: title || post.title,
        content: content || post.content,
        image: image || post.image
      });

      // Récupérer le post mis à jour avec les informations de l'auteur
      const updatedPost = await Post.findByPk(id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }]
      });

      res.json({
        message: 'Publication mise à jour avec succès',
        post: updatedPost
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Supprimer une publication
  static async deletePost(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const post = await Post.findByPk(id);

      if (!post) {
        return res.status(404).json({ error: 'Publication non trouvée' });
      }

      // Vérifier que l'utilisateur est le propriétaire de la publication
      if (post.userId !== userId) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }

      await post.destroy();

      res.json({ message: 'Publication supprimée avec succès' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Obtenir les publications d'un utilisateur
  static async getUserPosts(req, res) {
    try {
      const { userId } = req.params;

      const posts = await Post.findAll({
        where: { userId },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
          },
          {
            model: Comment,
            as: 'comments',
            include: [{
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'firstName', 'lastName']
            }]
          },
          {
            model: Like,
            as: 'likes'
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = PostsController;
