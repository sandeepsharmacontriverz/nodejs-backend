'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
      await queryInterface.removeColumn('mill_processes', 'riceVariety_type');
      await queryInterface.addColumn('mill_processes', 'rice_variety', {
        type: Sequelize.ARRAY(Sequelize.INTEGER) 
      });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('mill_processes', 'rice_variety');
  }
};
