'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Rename the column from "agri_total_area" to "gri_total_area"
    await queryInterface.renameColumn('transactions', 'mapped_ginner', 'mapped_mandi');
  },

  down: async (queryInterface, Sequelize) => {
    // If you need to revert the change, rename the column back to "agri_total_area"
    await queryInterface.renameColumn('transactions', 'mapped_mandi', 'mapped_ginner');
  }
};
