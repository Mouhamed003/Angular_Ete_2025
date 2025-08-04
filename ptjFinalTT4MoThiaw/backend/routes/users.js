const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation pour la mise à jour du profil
const validateProfileUpdate = [
  body('email').optional().isEmail().withMessage('Email invalide'),
  body('nom').optional().notEmpty().withMessage('Le nom ne peut pas être vide'),
  body('prenom').optional().notEmpty().withMessage('Le prénom ne peut pas être vide')
];

// Obtenir le profil de l'utilisateur connecté
router.get('/profil', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.get(
    'SELECT id, email, nom, prenom, bio, photo_profil, date_creation FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur de base de données' });
      }

      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      res.json({
        message: 'Profil récupéré avec succès',
        user
      });
    }
  );
});

// Obtenir le profil d'un utilisateur par ID
router.get('/:id', authenticateToken, (req, res) => {
  const userId = req.params.id;

  db.get(
    'SELECT id, email, nom, prenom, bio, photo_profil, date_creation FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur de base de données' });
      }

      if (!user) {
        return res.status(404).json({ 
          error: 'Utilisateur non trouvé',
          message: 'Cet utilisateur n\'existe pas'
        });
      }

      res.json({
        message: 'Profil récupéré avec succès',
        user
      });
    }
  );
});

// Mettre à jour le profil de l'utilisateur connecté
router.put('/profil', authenticateToken, validateProfileUpdate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: errors.array() 
      });
    }

    const userId = req.user.id;
    const { email, nom, prenom, bio, photo_profil } = req.body;

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email) {
      db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId], (err, existingUser) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur de base de données' });
        }

        if (existingUser) {
          return res.status(409).json({ 
            error: 'Email déjà utilisé',
            message: 'Cet email est déjà associé à un autre compte'
          });
        }

        // Mettre à jour le profil
        updateProfile();
      });
    } else {
      updateProfile();
    }

    function updateProfile() {
      const updates = [];
      const values = [];

      if (email) {
        updates.push('email = ?');
        values.push(email);
      }
      if (nom) {
        updates.push('nom = ?');
        values.push(nom);
      }
      if (prenom) {
        updates.push('prenom = ?');
        values.push(prenom);
      }
      if (bio !== undefined) {
        updates.push('bio = ?');
        values.push(bio);
      }
      if (photo_profil !== undefined) {
        updates.push('photo_profil = ?');
        values.push(photo_profil);
      }

      if (updates.length === 0) {
        return res.status(400).json({ 
          error: 'Aucune donnée à mettre à jour',
          message: 'Veuillez fournir au moins un champ à modifier'
        });
      }

      updates.push('date_modification = CURRENT_TIMESTAMP');
      values.push(userId);

      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

      db.run(query, values, function(err) {
        if (err) {
          return res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
        }

        // Récupérer le profil mis à jour
        db.get(
          'SELECT id, email, nom, prenom, bio, photo_profil, date_creation, date_modification FROM users WHERE id = ?',
          [userId],
          (err, updatedUser) => {
            if (err) {
              return res.status(500).json({ error: 'Erreur de base de données' });
            }

            res.json({
              message: 'Profil mis à jour avec succès',
              user: updatedUser
            });
          }
        );
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Changer le mot de passe
router.put('/mot-de-passe', authenticateToken, [
  body('ancien_mot_de_passe').notEmpty().withMessage('L\'ancien mot de passe est requis'),
  body('nouveau_mot_de_passe').isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: errors.array() 
      });
    }

    const userId = req.user.id;
    const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;

    // Récupérer l'utilisateur avec son mot de passe
    db.get('SELECT mot_de_passe FROM users WHERE id = ?', [userId], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur de base de données' });
      }

      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      // Vérifier l'ancien mot de passe
      const isValidPassword = await bcrypt.compare(ancien_mot_de_passe, user.mot_de_passe);
      
      if (!isValidPassword) {
        return res.status(401).json({ 
          error: 'Mot de passe incorrect',
          message: 'L\'ancien mot de passe est incorrect'
        });
      }

      // Hasher le nouveau mot de passe
      const hashedNewPassword = await bcrypt.hash(nouveau_mot_de_passe, 12);

      // Mettre à jour le mot de passe
      db.run(
        'UPDATE users SET mot_de_passe = ?, date_modification = CURRENT_TIMESTAMP WHERE id = ?',
        [hashedNewPassword, userId],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Erreur lors de la mise à jour du mot de passe' });
          }

          res.json({ message: 'Mot de passe mis à jour avec succès' });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Supprimer le compte de l'utilisateur connecté
router.delete('/profil', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la suppression du compte' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ 
      message: 'Compte supprimé avec succès',
      note: 'Toutes vos données (posts, commentaires, likes) ont été supprimées'
    });
  });
});

// Lister tous les utilisateurs (pour découvrir d'autres profils)
router.get('/', authenticateToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  db.all(
    'SELECT id, nom, prenom, bio, photo_profil, date_creation FROM users ORDER BY date_creation DESC LIMIT ? OFFSET ?',
    [limit, offset],
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur de base de données' });
      }

      // Compter le nombre total d'utilisateurs
      db.get('SELECT COUNT(*) as total FROM users', (err, count) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur de base de données' });
        }

        res.json({
          message: 'Utilisateurs récupérés avec succès',
          users,
          pagination: {
            page,
            limit,
            total: count.total,
            totalPages: Math.ceil(count.total / limit)
          }
        });
      });
    }
  );
});

module.exports = router;
