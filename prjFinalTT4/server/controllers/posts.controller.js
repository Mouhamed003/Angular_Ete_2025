const db = require('../db');

// Créer une nouvelle publication
exports.createPost = async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.userId;

        // Insérer la publication
        const result = await new Promise((resolve) => {
            db.run(
                'INSERT INTO posts (user_id, content) VALUES (?, ?)',
                [userId, content],
                function(err) {
                    if (err) return resolve({ error: err });
                    resolve({ id: this.lastID });
                }
            );
        });

        if (result.error) {
            return res.status(500).json({ message: 'Erreur lors de la création de la publication' });
        }

        res.status(201).json({
            message: 'Publication créée avec succès',
            postId: result.id
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la création de la publication', error: error.message });
    }
};

// Obtenir toutes les publications
exports.getAllPosts = async (req, res) => {
    try {
        // Obtenir les publications avec les informations de l'utilisateur
        const posts = await new Promise((resolve) => {
            db.all(
                `SELECT p.*, u.username 
                 FROM posts p 
                 JOIN users u ON p.user_id = u.id 
                 ORDER BY p.created_at DESC`,
                [],
                (err, rows) => {
                    resolve(rows);
                }
            );
        });

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des publications', error: error.message });
    }
};

// Obtenir une publication spécifique
exports.getPost = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await new Promise((resolve) => {
            db.get(
                `SELECT p.*, u.username 
                 FROM posts p 
                 JOIN users u ON p.user_id = u.id 
                 WHERE p.id = ?`,
                [id],
                (err, row) => {
                    resolve(row);
                }
            );
        });

        if (!post) {
            return res.status(404).json({ message: 'Publication non trouvée' });
        }

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération de la publication', error: error.message });
    }
};

// Modifier une publication
exports.updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.userId;

        // Vérifier que l'utilisateur est le propriétaire de la publication
        const post = await new Promise((resolve) => {
            db.get('SELECT * FROM posts WHERE id = ?', [id], (err, row) => {
                resolve(row);
            });
        });

        if (!post) {
            return res.status(404).json({ message: 'Publication non trouvée' });
        }

        if (post.user_id !== parseInt(userId)) {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        // Mettre à jour la publication
        await new Promise((resolve) => {
            db.run(
                'UPDATE posts SET content = ? WHERE id = ?',
                [content, id],
                (err) => {
                    resolve(err);
                }
            );
        });

        res.json({ message: 'Publication mise à jour avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour de la publication', error: error.message });
    }
};

// Supprimer une publication
exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        // Vérifier que l'utilisateur est le propriétaire de la publication
        const post = await new Promise((resolve) => {
            db.get('SELECT * FROM posts WHERE id = ?', [id], (err, row) => {
                resolve(row);
            });
        });

        if (!post) {
            return res.status(404).json({ message: 'Publication non trouvée' });
        }

        if (post.user_id !== parseInt(userId)) {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        // Supprimer la publication
        await new Promise((resolve) => {
            db.run(
                'DELETE FROM posts WHERE id = ?',
                [id],
                (err) => {
                    resolve(err);
                }
            );
        });

        res.json({ message: 'Publication supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression de la publication', error: error.message });
    }
};
