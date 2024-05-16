'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.renameColumn('farmers', 'cotton_total_area', 'paddy_total_area');
    await queryInterface.renameColumn('farmers', 'total_estimated_cotton', 'total_estimated_paddy');
    await queryInterface.renameColumn('farms', 'cotton_total_area', 'paddy_total_area');
    await queryInterface.renameColumn('farms', 'total_estimated_cotton', 'total_estimated_paddy');
    await queryInterface.renameColumn('farms', 'cotton_transacted', 'paddy_transacted');
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
