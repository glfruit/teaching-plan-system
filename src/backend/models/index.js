const sequelize = require('../config/database');
const TeachingPlan = require('./TeachingPlan');
const User = require('./User');

// Associations
TeachingPlan.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });
User.hasMany(TeachingPlan, { foreignKey: 'teacherId', as: 'teachingPlans' });

module.exports = {
  sequelize,
  TeachingPlan,
  User,
};
