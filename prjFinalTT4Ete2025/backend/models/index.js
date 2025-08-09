const sequelize = require('../database');
const User = require('./User');
const Post = require('./Post');
const Comment = require('./Comment');
const Like = require('./Like');

// Définir les associations
User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'userId', as: 'author' });

User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });

Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

User.hasMany(Like, { foreignKey: 'userId', as: 'likes' });
Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Post.hasMany(Like, { foreignKey: 'postId', as: 'likes' });
Like.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

Comment.hasMany(Like, { foreignKey: 'commentId', as: 'likes' });
Like.belongsTo(Comment, { foreignKey: 'commentId', as: 'comment' });

module.exports = {
  sequelize,
  User,
  Post,
  Comment,
  Like
};
