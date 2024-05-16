'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mill_containers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sales_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      container_name: {
        type: Sequelize.STRING
      },
      container_no: {
        type: Sequelize.STRING
      },
      container_weight: {
        type: Sequelize.DOUBLE
      },
      qr: {
        type: Sequelize.STRING
      },
      cms_status: {
        type: Sequelize.BOOLEAN,
        defaultValue: null
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
    await queryInterface.dropTable('mill_containers');
  }
};