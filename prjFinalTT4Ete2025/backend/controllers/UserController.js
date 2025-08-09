const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { JWT_SECRET } = require('../middleware/auth');

class UserController {
  // Inscription
  static async register(req, res) {
    try {
      const { username, email, password, firstName, lastName, bio } = req.body;

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({
        where: {
          $or: [{ email }, { username }]
        }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Utilisateur déjà existant' });
      }

      // Créer l'utilisateur
      const user = await User.create({
        username,
        email,
        password,
        firstName,
        lastName,
        bio
      });

      // Générer le token JWT
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

      res.status(201).json({
        message: 'Utilisateur créé avec succès',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          bio: user.bio
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Connexion
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Trouver l'utilisateur
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Identifiants invalides' });
      }

      // Vérifier le mot de passe
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Identifiants invalides' });
      }

      // Générer le token JWT
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

      res.json({
        message: 'Connexion réussie',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          bio: user.bio
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Obtenir le profil de l'utilisateur connecté
  static async getProfile(req, res) {
    try {
      const user = req.user;
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        profilePicture: user.profilePicture
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Mettre à jour le profil
  static async updateProfile(req, res) {
    try {
      const { firstName, lastName, bio, profilePicture } = req.body;
      const user = req.user;

      await user.update({
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        bio: bio || user.bio,
        profilePicture: profilePicture || user.profilePicture
      });

      res.json({
        message: 'Profil mis à jour avec succès',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          bio: user.bio,
          profilePicture: user.profilePicture
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Obtenir tous les utilisateurs
  static async getAllUsers(req, res) {
    try {
      const users = await User.findAll({
        attributes: ['id', 'username', 'firstName', 'lastName', 'bio', 'profilePicture']
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = UserController;
