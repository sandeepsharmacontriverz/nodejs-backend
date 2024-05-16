'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mandi_processes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      mandi_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'mandis', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      season_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      date: {
        allowNull: false,
        type: Sequelize.DATE
      },
      program_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      total_qty: {
        type: Sequelize.DOUBLE
      },
      no_of_bags: {
        type: Sequelize.INTEGER
      },
      mandi_out_turn: {
        type: Sequelize.DOUBLE
      },
      lot_no: {
        allowNull: false,
        type: Sequelize.STRING
      },
      reel_lot_no: {
        type: Sequelize.STRING
      },
      press_no: {
        type: Sequelize.STRING
      },
      qr: {
        type: Sequelize.STRING
      },
      heap_number: {
        type: Sequelize.STRING
      },
      heap_register: {
        type: Sequelize.STRING
      },
      weigh_bridge: {
        type: Sequelize.STRING
      },
      delivery_challan: {
        type: Sequelize.STRING
      },
      bag_process: {
        type: Sequelize.STRING
      },
      rice_quality: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('mandi_processes');
  }
};