const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation pour l'inscription
const validateRegister = [
  body('email').isEmail().withMessage('Email invalide'),
  body('mot_de_passe').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('nom').notEmpty().withMessage('Le nom est requis'),
  body('prenom').notEmpty().withMessage('Le prénom est requis')
];

// Validation pour la connexion
const validateLogin = [
  body('email').isEmail().withMessage('Email invalide'),
  body('mot_de_passe').notEmpty().withMessage('Mot de passe requis')
];

// Inscription
router.post('/inscription', validateRegister, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: errors.array() 
      });
    }

    const { email, mot_de_passe, nom, prenom, bio } = req.body;

    // Vérifier si l'utilisateur existe déjà
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur de base de données' });
      }

      if (user) {
        return res.status(409).json({ 
          error: 'Utilisateur existant',
          message: 'Un compte avec cet email existe déjà'
        });
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(mot_de_passe, 12);

      // Créer l'utilisateur
      db.run(
        'INSERT INTO users (email, mot_de_passe, nom, prenom, bio) VALUES (?, ?, ?, ?, ?)',
        [email, hashedPassword, nom, prenom, bio || ''],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Erreur lors de la création du compte' });
          }

          // Générer le token JWT
          const token = jwt.sign(
            { id: this.lastID, email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
          );

          res.status(201).json({
            message: 'Compte créé avec succès',
            token,
            user: {
              id: this.lastID,
              email,
              nom,
              prenom,
              bio: bio || ''
            }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Connexion
router.post('/connexion', validateLogin, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: errors.array() 
      });
    }

    const { email, mot_de_passe } = req.body;

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur de base de données' });
      }

      if (!user) {
        return res.status(401).json({ 
          error: 'Identifiants invalides',
          message: 'Email ou mot de passe incorrect'
        });
      }

      // Vérifier le mot de passe
      const isValidPassword = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
      
      if (!isValidPassword) {
        return res.status(401).json({ 
          error: 'Identifiants invalides',
          message: 'Email ou mot de passe incorrect'
        });
      }

      // Générer le token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        message: 'Connexion réussie',
        token,
        user: {
          id: user.id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          bio: user.bio,
          photo_profil: user.photo_profil
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Vérification du token (route protégée)
router.get('/verifier', authenticateToken, (req, res) => {
  res.json({
    message: 'Token valide',
    user: req.user
  });
});

// Déconnexion (côté client principalement)
router.post('/deconnexion', authenticateToken, (req, res) => {
  res.json({ message: 'Déconnexion réussie' });
});

module.exports = router;
