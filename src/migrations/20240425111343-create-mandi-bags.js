'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mandi-bags', {
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
      bag_no: {
        type: Sequelize.STRING
      },
      weight: {
        type: Sequelize.STRING
      },
      Q1: {
        type: Sequelize.STRING
      },
      Q2: {
        type: Sequelize.STRING
      },
      Q3: {
        type: Sequelize.STRING
      },
      Q4: {
        type: Sequelize.STRING
      },
      Q5: {
        type: Sequelize.STRING
      },
      Q6: {
        type: Sequelize.STRING
      },
      Q7: {
        type: Sequelize.STRING
      },
      qr: {
        type: Sequelize.STRING
      },
      old_weight: {
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
    await queryInterface.dropTable('mandi-bags');
  }
};