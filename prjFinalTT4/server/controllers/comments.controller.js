const db = require('../db');

// Créer un nouveau commentaire
exports.createComment = async (req, res) => {
    try {
        const { content, post_id } = req.body;
        const userId = req.userId;

        // Vérifier que le post existe
        const post = await new Promise((resolve) => {
            db.get('SELECT id FROM posts WHERE id = ?', [post_id], (err, row) => {
                resolve(row);
            });
        });

        if (!post) {
            return res.status(404).json({ message: 'Post non trouvé' });
        }

        // Insérer le commentaire
        const result = await new Promise((resolve) => {
            db.run(
                'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
                [post_id, userId, content],
                function(err) {
                    if (err) return resolve({ error: err });
                    resolve({ id: this.lastID });
                }
            );
        });

        if (result.error) {
            return res.status(500).json({ message: 'Erreur lors de la création du commentaire' });
        }

        res.status(201).json({
            message: 'Commentaire créé avec succès',
            commentId: result.id
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la création du commentaire', error: error.message });
    }
};

// Obtenir tous les commentaires d'un post
exports.getComments = async (req, res) => {
    try {
        const { post_id } = req.params;

        // Obtenir les commentaires avec les informations de l'utilisateur
        const comments = await new Promise((resolve) => {
            db.all(
                `SELECT c.*, u.username 
                 FROM comments c 
                 JOIN users u ON c.user_id = u.id 
                 WHERE c.post_id = ? 
                 ORDER BY c.created_at DESC`,
                [post_id],
                (err, rows) => {
                    resolve(rows);
                }
            );
        });

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des commentaires', error: error.message });
    }
};

// Obtenir un commentaire spécifique
exports.getComment = async (req, res) => {
    try {
        const { id } = req.params;

        const comment = await new Promise((resolve) => {
            db.get(
                `SELECT c.*, u.username 
                 FROM comments c 
                 JOIN users u ON c.user_id = u.id 
                 WHERE c.id = ?`,
                [id],
                (err, row) => {
                    resolve(row);
                }
            );
        });

        if (!comment) {
            return res.status(404).json({ message: 'Commentaire non trouvé' });
        }

        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du commentaire', error: error.message });
    }
};

// Modifier un commentaire
exports.updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.userId;

        // Vérifier que l'utilisateur est le propriétaire du commentaire
        const comment = await new Promise((resolve) => {
            db.get('SELECT * FROM comments WHERE id = ?', [id], (err, row) => {
                resolve(row);
            });
        });

        if (!comment) {
            return res.status(404).json({ message: 'Commentaire non trouvé' });
        }

        if (comment.user_id !== parseInt(userId)) {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        // Mettre à jour le commentaire
        await new Promise((resolve) => {
            db.run(
                'UPDATE comments SET content = ? WHERE id = ?',
                [content, id],
                (err) => {
                    resolve(err);
                }
            );
        });

        res.json({ message: 'Commentaire mis à jour avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour du commentaire', error: error.message });
    }
};

// Supprimer un commentaire
exports.deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        // Vérifier que l'utilisateur est le propriétaire du commentaire
        const comment = await new Promise((resolve) => {
            db.get('SELECT * FROM comments WHERE id = ?', [id], (err, row) => {
                resolve(row);
            });
        });

        if (!comment) {
            return res.status(404).json({ message: 'Commentaire non trouvé' });
        }

        if (comment.user_id !== parseInt(userId)) {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        // Supprimer le commentaire
        await new Promise((resolve) => {
            db.run(
                'DELETE FROM comments WHERE id = ?',
                [id],
                (err) => {
                    resolve(err);
                }
            );
        });

        res.json({ message: 'Commentaire supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression du commentaire', error: error.message });
    }
};
