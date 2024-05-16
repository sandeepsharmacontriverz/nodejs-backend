'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('farms', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      farmer_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'farmers', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      season_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        foreignKey: true,
        references: { model: 'seasons', key: 'id' },
        onDelete: 'CASCADE'
      },
      program_id: {
        allowNull: false,
        foreignKey: true,
        references: { model: 'programs', key: 'id' },
        onDelete: 'CASCADE',
        type: Sequelize.INTEGER
      },
      agri_total_area: {
        type: Sequelize.DECIMAL
      },
      agri_estimated_yeld: {
        type: Sequelize.DECIMAL
      },
      agri_estimated_prod: {
        type: Sequelize.DECIMAL
      },
      cotton_total_area: {
        type: Sequelize.DECIMAL
      },
      total_estimated_cotton: {
        type: Sequelize.DECIMAL
      },
      cotton_transacted: {
        type: Sequelize.DECIMAL,
        defaultValue: 0
      },
      cluster: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      seed_packet_quantity: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      variety: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      lot_no: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      distribution_date: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      },
      source_of_seed:{
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('farms');
  }
};