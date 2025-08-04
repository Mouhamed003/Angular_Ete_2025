const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');

// Controllers
const usersController = require('./controllers/users.controller');
const postsController = require('./controllers/posts.controller');
const commentsController = require('./controllers/comments.controller');
const likesController = require('./controllers/likes.controller');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes d'authentification (publiques)
app.post('/api/auth/register', usersController.register);
app.post('/api/auth/login', usersController.login);

// Routes protégées avec JWT
app.use('/api', usersController.authenticate);

// Routes des posts
app.post('/api/posts', postsController.createPost);
app.get('/api/posts', postsController.getAllPosts);
app.get('/api/posts/:id', postsController.getPost);
app.put('/api/posts/:id', postsController.updatePost);
app.delete('/api/posts/:id', postsController.deletePost);

// Routes des commentaires
app.post('/api/posts/:post_id/comments', commentsController.createComment);
app.get('/api/posts/:post_id/comments', commentsController.getComments);
app.get('/api/comments/:id', commentsController.getComment);
app.put('/api/comments/:id', commentsController.updateComment);
app.delete('/api/comments/:id', commentsController.deleteComment);

// Routes des likes
app.post('/api/posts/:post_id/likes', likesController.createLike);
app.get('/api/posts/:post_id/likes/count', likesController.getPostLikes);
app.get('/api/posts/:post_id/likes/users', likesController.getPostLikers);
app.delete('/api/posts/:post_id/likes', likesController.deleteLike);

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
