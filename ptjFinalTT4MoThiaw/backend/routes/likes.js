const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation pour les likes
const validateLike = [
  body('post_id').optional().isInt({ min: 1 }).withMessage('ID de publication invalide'),
  body('comment_id').optional().isInt({ min: 1 }).withMessage('ID de commentaire invalide')
];

// Ajouter ou retirer un like sur une publication
router.post('/publication/:postId', authenticateToken, (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.id;

  // Vérifier que la publication existe
  db.get('SELECT id FROM posts WHERE id = ?', [postId], (err, post) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur de base de données' });
    }

    if (!post) {
      return res.status(404).json({ 
        error: 'Publication non trouvée',
        message: 'Cette publication n\'existe pas'
      });
    }

    // Vérifier si l'utilisateur a déjà liké cette publication
    db.get('SELECT id FROM likes WHERE post_id = ? AND user_id = ?', [postId, userId], (err, existingLike) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur de base de données' });
      }

      if (existingLike) {
        // Retirer le like
        db.run('DELETE FROM likes WHERE id = ?', [existingLike.id], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Erreur lors de la suppression du like' });
          }

          // Compter les likes restants
          db.get('SELECT COUNT(*) as total FROM likes WHERE post_id = ?', [postId], (err, count) => {
            if (err) {
              return res.status(500).json({ error: 'Erreur de base de données' });
            }

            res.json({
              message: 'Like retiré avec succès',
              action: 'unlike',
              total_likes: count.total
            });
          });
        });
      } else {
        // Ajouter le like
        db.run('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [postId, userId], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Erreur lors de l\'ajout du like' });
          }

          // Compter les likes totaux
          db.get('SELECT COUNT(*) as total FROM likes WHERE post_id = ?', [postId], (err, count) => {
            if (err) {
              return res.status(500).json({ error: 'Erreur de base de données' });
            }

            res.status(201).json({
              message: 'Like ajouté avec succès',
              action: 'like',
              total_likes: count.total
            });
          });
        });
      }
    });
  });
});

// Ajouter ou retirer un like sur un commentaire
router.post('/commentaire/:commentId', authenticateToken, (req, res) => {
  const commentId = req.params.commentId;
  const userId = req.user.id;

  // Vérifier que le commentaire existe
  db.get('SELECT id FROM comments WHERE id = ?', [commentId], (err, comment) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur de base de données' });
    }

    if (!comment) {
      return res.status(404).json({ 
        error: 'Commentaire non trouvé',
        message: 'Ce commentaire n\'existe pas'
      });
    }

    // Vérifier si l'utilisateur a déjà liké ce commentaire
    db.get('SELECT id FROM likes WHERE comment_id = ? AND user_id = ?', [commentId, userId], (err, existingLike) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur de base de données' });
      }

      if (existingLike) {
        // Retirer le like
        db.run('DELETE FROM likes WHERE id = ?', [existingLike.id], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Erreur lors de la suppression du like' });
          }

          // Compter les likes restants
          db.get('SELECT COUNT(*) as total FROM likes WHERE comment_id = ?', [commentId], (err, count) => {
            if (err) {
              return res.status(500).json({ error: 'Erreur de base de données' });
            }

            res.json({
              message: 'Like retiré avec succès',
              action: 'unlike',
              total_likes: count.total
            });
          });
        });
      } else {
        // Ajouter le like
        db.run('INSERT INTO likes (comment_id, user_id) VALUES (?, ?)', [commentId, userId], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Erreur lors de l\'ajout du like' });
          }

          // Compter les likes totaux
          db.get('SELECT COUNT(*) as total FROM likes WHERE comment_id = ?', [commentId], (err, count) => {
            if (err) {
              return res.status(500).json({ error: 'Erreur de base de données' });
            }

            res.status(201).json({
              message: 'Like ajouté avec succès',
              action: 'like',
              total_likes: count.total
            });
          });
        });
      }
    });
  });
});

// Obtenir les likes d'une publication
router.get('/publication/:postId', authenticateToken, (req, res) => {
  const postId = req.params.postId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  // Vérifier que la publication existe
  db.get('SELECT id FROM posts WHERE id = ?', [postId], (err, post) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur de base de données' });
    }

    if (!post) {
      return res.status(404).json({ 
        error: 'Publication non trouvée',
        message: 'Cette publication n\'existe pas'
      });
    }

    db.all(`
      SELECT l.*, u.nom, u.prenom, u.photo_profil
      FROM likes l
      JOIN users u ON l.user_id = u.id
      WHERE l.post_id = ?
      ORDER BY l.date_creation DESC
      LIMIT ? OFFSET ?
    `, [postId, limit, offset], (err, likes) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur de base de données' });
      }

      // Compter le nombre total de likes
      db.get('SELECT COUNT(*) as total FROM likes WHERE post_id = ?', [postId], (err, count) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur de base de données' });
        }

        res.json({
          message: 'Likes de la publication récupérés avec succès',
          likes,
          pagination: {
            page,
            limit,
            total: count.total,
            totalPages: Math.ceil(count.total / limit)
          }
        });
      });
    });
  });
});

// Obtenir les likes d'un commentaire
router.get('/commentaire/:commentId', authenticateToken, (req, res) => {
  const commentId = req.params.commentId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  // Vérifier que le commentaire existe
  db.get('SELECT id FROM comments WHERE id = ?', [commentId], (err, comment) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur de base de données' });
    }

    if (!comment) {
      return res.status(404).json({ 
        error: 'Commentaire non trouvé',
        message: 'Ce commentaire n\'existe pas'
      });
    }

    db.all(`
      SELECT l.*, u.nom, u.prenom, u.photo_profil
      FROM likes l
      JOIN users u ON l.user_id = u.id
      WHERE l.comment_id = ?
      ORDER BY l.date_creation DESC
      LIMIT ? OFFSET ?
    `, [commentId, limit, offset], (err, likes) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur de base de données' });
      }

      // Compter le nombre total de likes
      db.get('SELECT COUNT(*) as total FROM likes WHERE comment_id = ?', [commentId], (err, count) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur de base de données' });
        }

        res.json({
          message: 'Likes du commentaire récupérés avec succès',
          likes,
          pagination: {
            page,
            limit,
            total: count.total,
            totalPages: Math.ceil(count.total / limit)
          }
        });
      });
    });
  });
});

// Obtenir les likes d'un utilisateur (ses activités de like)
router.get('/utilisateur/:userId', authenticateToken, (req, res) => {
  const userId = req.params.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Vérifier que l'utilisateur existe
  db.get('SELECT id FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur de base de données' });
    }

    if (!user) {
      return res.status(404).json({ 
        error: 'Utilisateur non trouvé',
        message: 'Cet utilisateur n\'existe pas'
      });
    }

    db.all(`
      SELECT l.*, 
             CASE 
               WHEN l.post_id IS NOT NULL THEN 'post'
               WHEN l.comment_id IS NOT NULL THEN 'comment'
             END as type_like,
             p.contenu as post_contenu,
             c.contenu as comment_contenu,
             pu.nom as post_author_nom, pu.prenom as post_author_prenom,
             cu.nom as comment_author_nom, cu.prenom as comment_author_prenom
      FROM likes l
      LEFT JOIN posts p ON l.post_id = p.id
      LEFT JOIN comments c ON l.comment_id = c.id
      LEFT JOIN users pu ON p.user_id = pu.id
      LEFT JOIN users cu ON c.user_id = cu.id
      WHERE l.user_id = ?
      ORDER BY l.date_creation DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset], (err, likes) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur de base de données' });
      }

      // Compter le nombre total de likes de cet utilisateur
      db.get('SELECT COUNT(*) as total FROM likes WHERE user_id = ?', [userId], (err, count) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur de base de données' });
        }

        res.json({
          message: 'Activités de like de l\'utilisateur récupérées avec succès',
          likes,
          pagination: {
            page,
            limit,
            total: count.total,
            totalPages: Math.ceil(count.total / limit)
          }
        });
      });
    });
  });
});

module.exports = router;
