# Plateforme de Réseau Social - Backend

## Description
Backend Node.js avec Express et Sequelize pour une plateforme de réseau social académique simple.

## Fonctionnalités
- **Authentification JWT** : Inscription, connexion sécurisée
- **Gestion des utilisateurs** : Profils, mise à jour
- **Publications** : Création, édition, suppression, consultation
- **Commentaires** : Système de commentaires sur les publications
- **Likes** : Système de likes sur publications et commentaires

## Technologies
- Node.js + Express
- Sequelize ORM
- SQLite (base de données)
- JWT (authentification)
- bcryptjs (hashage des mots de passe)
- CORS (sécurité)

## Installation

1. Installer les dépendances :
```bash
cd backend
npm install
```

2. Démarrer le serveur :
```bash
npm start
# ou en mode développement
npm run dev
```

## API Endpoints

### Authentification
- `POST /api/users/register` - Inscription
- `POST /api/users/login` - Connexion

### Utilisateurs (authentification requise)
- `GET /api/users/profile` - Profil utilisateur
- `PUT /api/users/profile` - Mettre à jour le profil
- `GET /api/users/all` - Tous les utilisateurs

### Publications (authentification requise)
- `POST /api/posts` - Créer une publication
- `GET /api/posts` - Toutes les publications
- `GET /api/posts/:id` - Publication par ID
- `PUT /api/posts/:id` - Mettre à jour une publication
- `DELETE /api/posts/:id` - Supprimer une publication
- `GET /api/posts/user/:userId` - Publications d'un utilisateur

### Commentaires (authentification requise)
- `POST /api/comments` - Créer un commentaire
- `GET /api/comments/post/:postId` - Commentaires d'une publication
- `GET /api/comments/:id` - Commentaire par ID
- `PUT /api/comments/:id` - Mettre à jour un commentaire
- `DELETE /api/comments/:id` - Supprimer un commentaire
- `GET /api/comments/user/:userId` - Commentaires d'un utilisateur

### Likes (authentification requise)
- `POST /api/likes/post/:postId` - Toggle like sur publication
- `POST /api/likes/comment/:commentId` - Toggle like sur commentaire
- `GET /api/likes/post/:postId` - Likes d'une publication
- `GET /api/likes/comment/:commentId` - Likes d'un commentaire
- `GET /api/likes/user/:userId` - Likes d'un utilisateur
- `GET /api/likes/post/:postId/check` - Vérifier like sur publication
- `GET /api/likes/comment/:commentId/check` - Vérifier like sur commentaire

## Structure du projet
```
backend/
├── controllers/          # Contrôleurs (UserController, PostsController, etc.)
├── models/              # Modèles Sequelize (User, Post, Comment, Like)
├── routes/              # Routes Express
├── middleware/          # Middleware d'authentification
├── database.js          # Configuration Sequelize
├── server.js            # Serveur principal
└── package.json         # Dépendances
```

## Base de données
La base de données SQLite sera créée automatiquement dans `/data/database.sqlite` au premier démarrage.

## Sécurité
- Mots de passe hashés avec bcrypt
- Authentification JWT sur tous les endpoints protégés
- Vérification de propriété des ressources
- CORS configuré pour le frontend Angular
