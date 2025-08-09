const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_ici';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token d\'accès requis' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token invalide' });
  }
};

module.exports = { authenticateToken, JWT_SECRET };
