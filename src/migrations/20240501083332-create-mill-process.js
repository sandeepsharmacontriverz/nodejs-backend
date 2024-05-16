'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mill_processes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      mill_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'mills', key: 'id' },
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
      order_reference: {
        type: Sequelize.STRING
      },
      godown_no: {
        type: Sequelize.STRING
      },
      stack_no: {
        type: Sequelize.STRING
      },
      program_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      riceVariety_type: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      total_qty: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      rice_type: {
        allowNull: false,
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      rice_qty_produced: {
        allowNull: false,
        type: Sequelize.ARRAY(Sequelize.DOUBLE)
      },
      rice_realisation: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      net_rice_qty: {
        type: Sequelize.DOUBLE
      },
      husks: {
        type: Sequelize.DOUBLE
      },
      no_of_bags: {
        type: Sequelize.INTEGER
      },
      batch_lot_no: {
        allowNull: false,
        type: Sequelize.STRING
      },
      reel_lot_no: {
        type: Sequelize.STRING
      },
      bag_id: {
        type: Sequelize.STRING
      },
      process_complete: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      other_required: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      qty_stock: {
        type: Sequelize.DOUBLE
      },
      status: {
        type: Sequelize.STRING
      },
      accept_date: {
        type: Sequelize.DATE,
      },
      qr: {
        type: Sequelize.STRING
      },
      other_information: {
        type: Sequelize.STRING
      },
      rice_quality_document: {
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
    await queryInterface.dropTable('mill_processes');
  }
};