const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, checkResourceOwnership } = require('../middleware/auth');

const router = express.Router();

// Validation pour les commentaires
const validateComment = [
  body('contenu').notEmpty().withMessage('Le contenu du commentaire est requis'),
  body('post_id').isInt({ min: 1 }).withMessage('ID de publication invalide')
];

// Créer un nouveau commentaire
router.post('/', authenticateToken, validateComment, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Données invalides', 
      details: errors.array() 
    });
  }

  const { contenu, post_id } = req.body;
  const userId = req.user.id;

  // Vérifier que la publication existe
  db.get('SELECT id FROM posts WHERE id = ?', [post_id], (err, post) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur de base de données' });
    }

    if (!post) {
      return res.status(404).json({ 
        error: 'Publication non trouvée',
        message: 'Impossible de commenter une publication qui n\'existe pas'
      });
    }

    // Créer le commentaire
    db.run(
      'INSERT INTO comments (contenu, post_id, user_id) VALUES (?, ?, ?)',
      [contenu, post_id, userId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Erreur lors de la création du commentaire' });
        }

        // Récupérer le commentaire créé avec les infos de l'utilisateur
        db.get(`
          SELECT c.*, u.nom, u.prenom, u.photo_profil,
                 (SELECT COUNT(*) FROM likes WHERE comment_id = c.id) as nombre_likes,
                 (SELECT COUNT(*) FROM likes WHERE comment_id = c.id AND user_id = ?) as user_a_like
          FROM comments c
          JOIN users u ON c.user_id = u.id
          WHERE c.id = ?
        `, [userId, this.lastID], (err, comment) => {
          if (err) {
            return res.status(500).json({ error: 'Erreur de base de données' });
          }

          res.status(201).json({
            message: 'Commentaire créé avec succès',
            comment: {
              ...comment,
              user_a_like: comment.user_a_like > 0
            }
          });
        });
      }
    );
  });
});

// Obtenir tous les commentaires d'une publication
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
      SELECT c.*, u.nom, u.prenom, u.photo_profil,
             (SELECT COUNT(*) FROM likes WHERE comment_id = c.id) as nombre_likes,
             (SELECT COUNT(*) FROM likes WHERE comment_id = c.id AND user_id = ?) as user_a_like
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.date_creation ASC
      LIMIT ? OFFSET ?
    `, [req.user.id, postId, limit, offset], (err, comments) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur de base de données' });
      }

      // Compter le nombre total de commentaires pour cette publication
      db.get('SELECT COUNT(*) as total FROM comments WHERE post_id = ?', [postId], (err, count) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur de base de données' });
        }

        res.json({
          message: 'Commentaires récupérés avec succès',
          comments: comments.map(comment => ({
            ...comment,
            user_a_like: comment.user_a_like > 0
          })),
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

// Obtenir un commentaire spécifique
router.get('/:id', authenticateToken, (req, res) => {
  const commentId = req.params.id;

  db.get(`
    SELECT c.*, u.nom, u.prenom, u.photo_profil,
           (SELECT COUNT(*) FROM likes WHERE comment_id = c.id) as nombre_likes,
           (SELECT COUNT(*) FROM likes WHERE comment_id = c.id AND user_id = ?) as user_a_like
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `, [req.user.id, commentId], (err, comment) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur de base de données' });
    }

    if (!comment) {
      return res.status(404).json({ 
        error: 'Commentaire non trouvé',
        message: 'Ce commentaire n\'existe pas'
      });
    }

    res.json({
      message: 'Commentaire récupéré avec succès',
      comment: {
        ...comment,
        user_a_like: comment.user_a_like > 0
      }
    });
  });
});

// Obtenir les commentaires d'un utilisateur spécifique
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
      SELECT c.*, u.nom, u.prenom, u.photo_profil, p.contenu as post_contenu,
             (SELECT COUNT(*) FROM likes WHERE comment_id = c.id) as nombre_likes,
             (SELECT COUNT(*) FROM likes WHERE comment_id = c.id AND user_id = ?) as user_a_like
      FROM comments c
      JOIN users u ON c.user_id = u.id
      JOIN posts p ON c.post_id = p.id
      WHERE c.user_id = ?
      ORDER BY c.date_creation DESC
      LIMIT ? OFFSET ?
    `, [req.user.id, userId, limit, offset], (err, comments) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur de base de données' });
      }

      // Compter le nombre total de commentaires de cet utilisateur
      db.get('SELECT COUNT(*) as total FROM comments WHERE user_id = ?', [userId], (err, count) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur de base de données' });
        }

        res.json({
          message: 'Commentaires de l\'utilisateur récupérés avec succès',
          comments: comments.map(comment => ({
            ...comment,
            user_a_like: comment.user_a_like > 0
          })),
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

// Modifier un commentaire (seulement par son auteur)
router.put('/:id', authenticateToken, checkResourceOwnership('comments'), [
  body('contenu').notEmpty().withMessage('Le contenu du commentaire est requis')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Données invalides', 
      details: errors.array() 
    });
  }

  const commentId = req.params.id;
  const { contenu } = req.body;

  db.run(
    'UPDATE comments SET contenu = ?, date_modification = CURRENT_TIMESTAMP WHERE id = ?',
    [contenu, commentId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la modification du commentaire' });
      }

      // Récupérer le commentaire modifié
      db.get(`
        SELECT c.*, u.nom, u.prenom, u.photo_profil,
               (SELECT COUNT(*) FROM likes WHERE comment_id = c.id) as nombre_likes,
               (SELECT COUNT(*) FROM likes WHERE comment_id = c.id AND user_id = ?) as user_a_like
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
      `, [req.user.id, commentId], (err, comment) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur de base de données' });
        }

        res.json({
          message: 'Commentaire modifié avec succès',
          comment: {
            ...comment,
            user_a_like: comment.user_a_like > 0
          }
        });
      });
    }
  );
});

// Supprimer un commentaire (seulement par son auteur)
router.delete('/:id', authenticateToken, checkResourceOwnership('comments'), (req, res) => {
  const commentId = req.params.id;

  db.run('DELETE FROM comments WHERE id = ?', [commentId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la suppression du commentaire' });
    }

    res.json({ 
      message: 'Commentaire supprimé avec succès',
      note: 'Tous les likes associés à ce commentaire ont également été supprimés'
    });
  });
});

module.exports = router;
