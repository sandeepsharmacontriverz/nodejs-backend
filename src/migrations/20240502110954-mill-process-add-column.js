'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('mill_processes', 'riceVariety_type');

    const Table = await queryInterface.describeTable('mill_processes');
    if (!Table.hasOwnProperty('other_process')) {
      await queryInterface.addColumn('mill_processes', 'other_process', {
        type: Sequelize.STRING
      });
    }

    if (!Table.hasOwnProperty('riceVariety_type')) {
      await queryInterface.addColumn('mill_processes', 'riceVariety_type', {
        type: Sequelize.INTEGER // Assuming you intended to use INTEGER instead of NUMBER
      });
    } else {
      // No need to change column type if it already exists
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('mill_processes', 'other_process');
    await queryInterface.removeColumn('mill_processes', 'riceVariety_type');
  }
};
