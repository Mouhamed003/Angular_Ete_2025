const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, checkResourceOwnership } = require('../middleware/auth');

const router = express.Router();

// Validation pour les publications
const validatePost = [
  body('contenu').notEmpty().withMessage('Le contenu de la publication est requis')
];

// Créer une nouvelle publication
router.post('/', authenticateToken, validatePost, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Données invalides', 
      details: errors.array() 
    });
  }

  const { contenu, image } = req.body;
  const userId = req.user.id;

  db.run(
    'INSERT INTO posts (contenu, image, user_id) VALUES (?, ?, ?)',
    [contenu, image || null, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la création de la publication' });
      }

      // Récupérer la publication créée avec les infos de l'utilisateur
      db.get(`
        SELECT p.*, u.nom, u.prenom, u.photo_profil,
               (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as nombre_likes,
               (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as nombre_commentaires
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
      `, [this.lastID], (err, post) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur de base de données' });
        }

        res.status(201).json({
          message: 'Publication créée avec succès',
          post
        });
      });
    }
  );
});

// Obtenir toutes les publications (fil d'actualité)
router.get('/', authenticateToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  db.all(`
    SELECT p.*, u.nom, u.prenom, u.photo_profil,
           (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as nombre_likes,
           (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as nombre_commentaires,
           (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as user_a_like
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.date_creation DESC
    LIMIT ? OFFSET ?
  `, [req.user.id, limit, offset], (err, posts) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur de base de données' });
    }

    // Compter le nombre total de publications
    db.get('SELECT COUNT(*) as total FROM posts', (err, count) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur de base de données' });
      }

      res.json({
        message: 'Publications récupérées avec succès',
        posts: posts.map(post => ({
          ...post,
          user_a_like: post.user_a_like > 0
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

// Obtenir une publication spécifique
router.get('/:id', authenticateToken, (req, res) => {
  const postId = req.params.id;

  db.get(`
    SELECT p.*, u.nom, u.prenom, u.photo_profil,
           (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as nombre_likes,
           (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as nombre_commentaires,
           (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as user_a_like
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `, [req.user.id, postId], (err, post) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur de base de données' });
    }

    if (!post) {
      return res.status(404).json({ 
        error: 'Publication non trouvée',
        message: 'Cette publication n\'existe pas'
      });
    }

    res.json({
      message: 'Publication récupérée avec succès',
      post: {
        ...post,
        user_a_like: post.user_a_like > 0
      }
    });
  });
});

// Obtenir les publications d'un utilisateur spécifique
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
      SELECT p.*, u.nom, u.prenom, u.photo_profil,
             (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as nombre_likes,
             (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as nombre_commentaires,
             (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as user_a_like
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
      ORDER BY p.date_creation DESC
      LIMIT ? OFFSET ?
    `, [req.user.id, userId, limit, offset], (err, posts) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur de base de données' });
      }

      // Compter le nombre total de publications de cet utilisateur
      db.get('SELECT COUNT(*) as total FROM posts WHERE user_id = ?', [userId], (err, count) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur de base de données' });
        }

        res.json({
          message: 'Publications de l\'utilisateur récupérées avec succès',
          posts: posts.map(post => ({
            ...post,
            user_a_like: post.user_a_like > 0
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

// Modifier une publication (seulement par son auteur)
router.put('/:id', authenticateToken, checkResourceOwnership('posts'), validatePost, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Données invalides', 
      details: errors.array() 
    });
  }

  const postId = req.params.id;
  const { contenu, image } = req.body;

  db.run(
    'UPDATE posts SET contenu = ?, image = ?, date_modification = CURRENT_TIMESTAMP WHERE id = ?',
    [contenu, image || null, postId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la modification de la publication' });
      }

      // Récupérer la publication modifiée
      db.get(`
        SELECT p.*, u.nom, u.prenom, u.photo_profil,
               (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as nombre_likes,
               (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as nombre_commentaires,
               (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as user_a_like
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
      `, [req.user.id, postId], (err, post) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur de base de données' });
        }

        res.json({
          message: 'Publication modifiée avec succès',
          post: {
            ...post,
            user_a_like: post.user_a_like > 0
          }
        });
      });
    }
  );
});

// Supprimer une publication (seulement par son auteur)
router.delete('/:id', authenticateToken, checkResourceOwnership('posts'), (req, res) => {
  const postId = req.params.id;

  db.run('DELETE FROM posts WHERE id = ?', [postId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la suppression de la publication' });
    }

    res.json({ 
      message: 'Publication supprimée avec succès',
      note: 'Tous les commentaires et likes associés ont également été supprimés'
    });
  });
});

module.exports = router;
