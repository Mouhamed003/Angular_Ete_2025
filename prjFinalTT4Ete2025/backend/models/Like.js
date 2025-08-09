const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Like = sequelize.define('Like', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Posts',
      key: 'id'
    }
  },
  commentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Comments',
      key: 'id'
    }
  }
}, {
  validate: {
    eitherPostOrComment() {
      if ((this.postId && this.commentId) || (!this.postId && !this.commentId)) {
        throw new Error('Un like doit être associé soit à un post soit à un commentaire, pas les deux ou aucun.');
      }
    }
  }
});

module.exports = Like;
