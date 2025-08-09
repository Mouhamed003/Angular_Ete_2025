const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:4200', // URL du frontend Angular
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const likeRoutes = require('./routes/likeRoutes');

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);

// Route de base
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Plateforme de Réseau Social - Backend fonctionnel',
    endpoints: {
      users: '/api/users',
      posts: '/api/posts',
      comments: '/api/comments',
      likes: '/api/likes'
    }
  });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Gestion globale des erreurs
app.use((error, req, res, next) => {
  console.error('Erreur serveur:', error);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Initialisation de la base de données et démarrage du serveur
async function startServer() {
  try {
    // Synchroniser la base de données (créer les tables si elles n'existent pas)
    await sequelize.sync({ force: false });
    console.log('✅ Base de données synchronisée avec succès');
    
    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📱 API accessible sur: http://localhost:${PORT}`);
      console.log(`🌐 Frontend Angular attendu sur: http://localhost:4200`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

startServer();
