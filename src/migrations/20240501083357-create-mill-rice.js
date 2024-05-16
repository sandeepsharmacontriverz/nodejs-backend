'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mill_rices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      process_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      rice_tyoe: {
        type: Sequelize.INTEGER
      },
      rice_produced: {
        type: Sequelize.DOUBLE
      },
      rice_qty_stock: {
        type: Sequelize.DOUBLE
      },
      qr: {
        type: Sequelize.STRING
      },
      sold_status: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
    await queryInterface.dropTable('mill_rices');
  }
};