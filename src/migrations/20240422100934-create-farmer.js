'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('farmers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      program_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'programs', key: 'id' },
        onDelete: 'CASCADE',
      },
      brand_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'brands', key: 'id' },
        onDelete: 'CASCADE',
      },
      firstName: {
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.STRING
      },
      code: {
        type: Sequelize.STRING
      },
      country_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: "countries", key: "id" },
        onDelete: "CASCADE",
        allowNull: false,
      },
      state_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: "states", key: "id" },
        onDelete: "CASCADE",
        allowNull: false,
      },
      district_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: "districts", key: "id" },
        onDelete: "CASCADE",
        allowNull: false,
      },
      block_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: "blocks", key: "id" },
        onDelete: "CASCADE",
        allowNull: false,
      },
      village_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: "villages", key: "id" },
        onDelete: "CASCADE",
        allowNull: false,
      },
      joining_date: {
        type: Sequelize.DATE,
      },
      ics_id: {
        type: Sequelize.INTEGER,
      },
      tracenet_id: {
        type: Sequelize.STRING,
      },
      cert_status: {
        type: Sequelize.STRING,
      },
      qrUrl: {
        type: Sequelize.STRING,
        defaultValue: "",
        allowNull: true
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
    await queryInterface.dropTable('farmers');
  }
};