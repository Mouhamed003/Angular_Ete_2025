const db = require('../db');

// Créer un nouveau like
exports.createLike = async (req, res) => {
    try {
        const { post_id } = req.body;
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

        // Vérifier si l'utilisateur a déjà liké le post
        const existingLike = await new Promise((resolve) => {
            db.get(
                'SELECT id FROM likes WHERE post_id = ? AND user_id = ?',
                [post_id, userId],
                (err, row) => {
                    resolve(row);
                }
            );
        });

        if (existingLike) {
            return res.status(400).json({ message: 'Vous avez déjà liké ce post' });
        }

        // Créer le like
        const result = await new Promise((resolve) => {
            db.run(
                'INSERT INTO likes (post_id, user_id) VALUES (?, ?)',
                [post_id, userId],
                function(err) {
                    if (err) return resolve({ error: err });
                    resolve({ id: this.lastID });
                }
            );
        });

        if (result.error) {
            return res.status(500).json({ message: 'Erreur lors de la création du like' });
        }

        res.status(201).json({
            message: 'Like ajouté avec succès',
            likeId: result.id
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la création du like', error: error.message });
    }
};

// Obtenir le nombre de likes d'un post
exports.getPostLikes = async (req, res) => {
    try {
        const { post_id } = req.params;

        const likes = await new Promise((resolve) => {
            db.get(
                'SELECT COUNT(*) as count FROM likes WHERE post_id = ?',
                [post_id],
                (err, row) => {
                    resolve(row);
                }
            );
        });

        res.json({ likes: likes.count });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des likes', error: error.message });
    }
};

// Obtenir les utilisateurs qui ont liké un post
exports.getPostLikers = async (req, res) => {
    try {
        const { post_id } = req.params;

        const likers = await new Promise((resolve) => {
            db.all(
                `SELECT u.* 
                 FROM likes l 
                 JOIN users u ON l.user_id = u.id 
                 WHERE l.post_id = ?`,
                [post_id],
                (err, rows) => {
                    resolve(rows);
                }
            );
        });

        res.json(likers);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs qui ont liké', error: error.message });
    }
};

// Supprimer un like
exports.deleteLike = async (req, res) => {
    try {
        const { post_id } = req.params;
        const userId = req.userId;

        // Vérifier si le like existe
        const like = await new Promise((resolve) => {
            db.get(
                'SELECT id FROM likes WHERE post_id = ? AND user_id = ?',
                [post_id, userId],
                (err, row) => {
                    resolve(row);
                }
            );
        });

        if (!like) {
            return res.status(404).json({ message: 'Like non trouvé' });
        }

        // Supprimer le like
        await new Promise((resolve) => {
            db.run(
                'DELETE FROM likes WHERE post_id = ? AND user_id = ?',
                [post_id, userId],
                (err) => {
                    resolve(err);
                }
            );
        });

        res.json({ message: 'Like supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression du like', error: error.message });
    }
};
