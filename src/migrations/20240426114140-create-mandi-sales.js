'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mandi_sales', {
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
      chosen_bag: {
        type: Sequelize.STRING
      },
      lot_no: {
        type: Sequelize.STRING
      },
      buyer: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      shipping_address: {
        allowNull: false,
        type: Sequelize.STRING
      },
      transaction_via_trader: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      transaction_agent: {
        type: Sequelize.STRING
      },
      tc_file: {
        type: Sequelize.STRING
      },
      contract_file: {
        type: Sequelize.STRING
      },
      invoice_file: {
        type: Sequelize.ARRAY(Sequelize.TEXT)
      },
      delivery_notes: {
        type: Sequelize.STRING
      },
      candy_rate: {
        allowNull: false,
        type: Sequelize.STRING
      },
      rate: {
        allowNull: false,
        type: Sequelize.STRING
      },
      sale_value: {
        type: Sequelize.STRING
      },
      invoice_no: {
        type: Sequelize.STRING
      },
      despatch_from: {
        allowNull: false,
        type: Sequelize.STRING
      },
      despatch_to: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      qr: {
        type: Sequelize.STRING
      },
      weight_loss: {
        type: Sequelize.STRING
      },
      vehicle_no: {
        type: Sequelize.STRING
      },
      transporter_name: {
        type: Sequelize.STRING
      },
      lrbl_no: {
        type: Sequelize.STRING
      },
      place_of_supply: {
        type: Sequelize.STRING
      },
      gst_number: {
        type: Sequelize.STRING
      },
      gst_percentage: {
        type: Sequelize.STRING
      },
      gross_weight: {
        type: Sequelize.STRING
      },
      tare_weight: {
        type: Sequelize.STRING
      },
      less_weight: {
        type: Sequelize.STRING
      },
      sample: {
        type: Sequelize.STRING
      },
      accept_date: {
        type: Sequelize.DATE
      },
      bag_press_no: {
        type: Sequelize.STRING
      },
      reel_lot_no: {
        type: Sequelize.STRING
      },
      qty_stock: {
        type: Sequelize.DOUBLE
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
    await queryInterface.dropTable('mandi_sales');
  }
};