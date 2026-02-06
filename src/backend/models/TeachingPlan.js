const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TeachingPlan = sequelize.define('TeachingPlan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  courseName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
  htmlContent: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  teacherId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft',
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
}, {
  tableName: 'teaching_plans',
  timestamps: true,
});

module.exports = TeachingPlan;
