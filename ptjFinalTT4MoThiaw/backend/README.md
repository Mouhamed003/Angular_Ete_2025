# Backend - Plateforme de Réseau Social

## Description
Backend Node.js avec Express pour une plateforme de réseau social simple et académique.

## Stack Technique
- **Node.js** avec Express
- **SQLite** pour la base de données
- **JWT** pour l'authentification
- **bcryptjs** pour le hashage des mots de passe
- **CORS** pour autoriser les requêtes du frontend Angular

## Structure du Projet
```
backend/
├── config/
│   └── database.js          # Configuration SQLite
├── middleware/
│   └── auth.js              # Middleware d'authentification JWT
├── routes/
│   ├── auth.js              # Routes d'authentification
│   ├── users.js             # Routes des utilisateurs
│   ├── posts.js             # Routes des publications
│   ├── comments.js          # Routes des commentaires
│   └── likes.js             # Routes des likes
├── database/
│   └── reseau_social.db     # Base de données SQLite (créée automatiquement)
├── .env                     # Variables d'environnement
├── package.json             # Dépendances Node.js
└── server.js                # Point d'entrée du serveur
```

## Installation et Démarrage

### 1. Installation des dépendances
```bash
cd backend
npm install
```

### 2. Configuration
Modifiez le fichier `.env` avec vos paramètres :
```env
PORT=3000
JWT_SECRET=votre_secret_jwt_tres_securise_changez_moi
JWT_EXPIRES_IN=24h
DB_PATH=./database/reseau_social.db
FRONTEND_URL=http://localhost:4200
```

### 3. Démarrage du serveur
```bash
# Mode développement (avec nodemon)
npm run dev

# Mode production
npm start
```

Le serveur démarre sur `http://localhost:3000`

## API Endpoints

### Authentification (`/api/auth`)
- `POST /api/auth/inscription` - Créer un compte
- `POST /api/auth/connexion` - Se connecter
- `GET /api/auth/verifier` - Vérifier le token JWT
- `POST /api/auth/deconnexion` - Se déconnecter

### Utilisateurs (`/api/users`)
- `GET /api/users/profil` - Obtenir son profil
- `GET /api/users/:id` - Obtenir un profil par ID
- `PUT /api/users/profil` - Modifier son profil
- `PUT /api/users/mot-de-passe` - Changer son mot de passe
- `DELETE /api/users/profil` - Supprimer son compte
- `GET /api/users` - Lister tous les utilisateurs

### Publications (`/api/posts`)
- `POST /api/posts` - Créer une publication
- `GET /api/posts` - Obtenir toutes les publications (fil d'actualité)
- `GET /api/posts/:id` - Obtenir une publication spécifique
- `GET /api/posts/utilisateur/:userId` - Publications d'un utilisateur
- `PUT /api/posts/:id` - Modifier sa publication
- `DELETE /api/posts/:id` - Supprimer sa publication

### Commentaires (`/api/comments`)
- `POST /api/comments` - Créer un commentaire
- `GET /api/comments/publication/:postId` - Commentaires d'une publication
- `GET /api/comments/:id` - Obtenir un commentaire spécifique
- `GET /api/comments/utilisateur/:userId` - Commentaires d'un utilisateur
- `PUT /api/comments/:id` - Modifier son commentaire
- `DELETE /api/comments/:id` - Supprimer son commentaire

### Likes (`/api/likes`)
- `POST /api/likes/publication/:postId` - Liker/Unliker une publication
- `POST /api/likes/commentaire/:commentId` - Liker/Unliker un commentaire
- `GET /api/likes/publication/:postId` - Likes d'une publication
- `GET /api/likes/commentaire/:commentId` - Likes d'un commentaire
- `GET /api/likes/utilisateur/:userId` - Activités de like d'un utilisateur

## Sécurité

### Authentification JWT
- Tous les endpoints (sauf inscription/connexion) nécessitent un token JWT
- Le token doit être envoyé dans l'en-tête `Authorization: Bearer <token>`
- Durée de vie du token : 24h (configurable)

### Autorisation
- Chaque utilisateur ne peut modifier/supprimer que ses propres ressources
- Middleware `checkResourceOwnership` pour vérifier la propriété des ressources

### Validation des données
- Validation des entrées avec `express-validator`
- Hashage des mots de passe avec `bcryptjs`
- Protection CORS configurée

## Base de Données

### Tables
1. **users** - Informations des utilisateurs
2. **posts** - Publications
3. **comments** - Commentaires sur les publications
4. **likes** - Likes sur publications et commentaires

### Relations
- Un utilisateur peut avoir plusieurs publications, commentaires et likes
- Une publication peut avoir plusieurs commentaires et likes
- Un commentaire peut avoir plusieurs likes
- Suppression en cascade pour maintenir l'intégrité

## Test de l'API
Route de test disponible : `GET /api/test`

## Développement
- Utilisez `npm run dev` pour le développement avec rechargement automatique
- Les logs sont affichés dans la console
- La base de données SQLite est créée automatiquement au premier démarrage
