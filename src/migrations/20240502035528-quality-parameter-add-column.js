'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const Table = await queryInterface.describeTable('quality-parameters');
    if (!Table.hasOwnProperty('sales_id')) {
      await queryInterface.addColumn('quality-parameters', 'sales_id', {
        type: Sequelize.INTEGER,
      });
    }
    if (!Table.hasOwnProperty('lot_no')) {
      await queryInterface.addColumn('quality-parameters', 'lot_no', {
        type: Sequelize.STRING,
      });
      
    }
    if (!Table.hasOwnProperty('reel_lot_no')) {
      await queryInterface.addColumn('quality-parameters', 'reel_lot_no', {
        type: Sequelize.STRING,
      });
      
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('quality-parameters', 'sales_id',);
    await queryInterface.removeColumn('quality-parameters', 'lot_no',);
    await queryInterface.removeColumn('quality-parameters', 'reel_lot_no',);
  }
};
