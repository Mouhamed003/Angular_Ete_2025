const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');

// Configuration JWT
const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-jwt';
const JWT_EXPIRES_IN = '24h';

// Inscription
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await new Promise((resolve) => {
            db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
                resolve(row);
            });
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer l'utilisateur
        const result = await new Promise((resolve) => {
            db.run(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                [username, email, hashedPassword],
                function(err) {
                    if (err) return resolve({ error: err });
                    resolve({ id: this.lastID });
                }
            );
        });

        if (result.error) {
            return res.status(500).json({ message: 'Erreur lors de l\'inscription' });
        }

        // Créer le token JWT
        const token = jwt.sign(
            { userId: result.id },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(201).json({
            message: 'Inscription réussie',
            token,
            userId: result.id
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'inscription', error: error.message });
    }
};

// Connexion
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Trouver l'utilisateur
        const user = await new Promise((resolve) => {
            db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                resolve(row);
            });
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Créer le token JWT
        const token = jwt.sign(
            { userId: user.id },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            message: 'Connexion réussie',
            token,
            userId: user.id
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la connexion', error: error.message });
    }
};

// Middleware d'authentification
exports.authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Token JWT manquant' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Token JWT invalide' });
        }

        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Token JWT invalide' });
            }
            req.userId = decoded.userId;
            next();
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur d\'authentification', error: error.message });
    }
};

// Middleware de vérification propriétaire
exports.isOwner = (req, res, next) => {
    try {
        const { userId } = req.params;
        if (userId !== req.userId.toString()) {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Erreur de vérification', error: error.message });
    }
};
