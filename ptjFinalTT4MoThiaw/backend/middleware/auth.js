const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Middleware d'authentification JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Token d\'accès requis',
      message: 'Vous devez être connecté pour accéder à cette ressource'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Token invalide',
        message: 'Votre session a expiré, veuillez vous reconnecter'
      });
    }

    // Vérifier que l'utilisateur existe toujours en base
    db.get('SELECT id, email, nom, prenom FROM users WHERE id = ?', [user.id], (err, dbUser) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur de base de données' });
      }
      
      if (!dbUser) {
        return res.status(404).json({ 
          error: 'Utilisateur non trouvé',
          message: 'Votre compte n\'existe plus'
        });
      }

      req.user = dbUser;
      next();
    });
  });
};

// Middleware pour vérifier la propriété d'une ressource
const checkResourceOwnership = (tableName, resourceIdParam = 'id') => {
  return (req, res, next) => {
    const resourceId = req.params[resourceIdParam];
    const userId = req.user.id;

    db.get(`SELECT user_id FROM ${tableName} WHERE id = ?`, [resourceId], (err, resource) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur de base de données' });
      }

      if (!resource) {
        return res.status(404).json({ 
          error: 'Ressource non trouvée',
          message: `La ressource demandée n'existe pas`
        });
      }

      if (resource.user_id !== userId) {
        return res.status(403).json({ 
          error: 'Accès refusé',
          message: 'Vous ne pouvez modifier que vos propres ressources'
        });
      }

      next();
    });
  };
};

module.exports = {
  authenticateToken,
  checkResourceOwnership
};
