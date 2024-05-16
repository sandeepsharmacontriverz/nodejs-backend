'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if 'yarn_type' column exists in 'mills' table
    const millTable = await queryInterface.describeTable('mills');
    if (millTable.hasOwnProperty('yarn_type')) {
      // Remove 'yarn_type' column from 'mills' table
      await queryInterface.removeColumn('mills', 'yarn_type');
    }

    // Check if 'rice_type' column exists in 'mills' table
    if (!millTable.hasOwnProperty('rice_type')) {
      // Add 'rice_type' column to 'mills' table
      await queryInterface.addColumn('mills', 'rice_type', {
        type: Sequelize.STRING,
      });
      await queryInterface.addColumn('mills', 'rice_variety', {
        type: Sequelize.STRING,
      });
    } else {
      // If 'rice_type' column already exists, change its data type to Sequelize.STRING
      await queryInterface.changeColumn('mills', 'rice_type', {
        type: Sequelize.STRING,
      });
      await queryInterface.changeColumn('mills', 'rice_variety', {
        type: Sequelize.STRING,
      });
    }

    // Similarly, you can perform similar checks and operations for other columns

    // Check if 'bale_weight_from' and 'bale_weight_to' exist in 'mandis' table
    const mandiTable = await queryInterface.describeTable('mandis');
    if (mandiTable.hasOwnProperty('bale_weight_from') && mandiTable.hasOwnProperty('bale_weight_to')) {
      // Rename columns in 'mandis' table
      await queryInterface.renameColumn('mandis', 'bale_weight_from', 'bag_weight_from');
      await queryInterface.renameColumn('mandis', 'bale_weight_to', 'bag_weight_to');
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove 'rice_type' column from 'mills' table
    await queryInterface.removeColumn('mills', 'rice_type');
    await queryInterface.removeColumn('mills', 'rice_variety');

    // Rename columns back in 'mandis' table
    await queryInterface.renameColumn('mandis', 'bag_weight_from', 'bale_weight_from');
    await queryInterface.renameColumn('mandis', 'bag_weight_to', 'bale_weight_to');
  }
};
