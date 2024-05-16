'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.addColumn('mill_processes', 'lab_sample_status', {
     type: Sequelize.STRING
   })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('mill_processes', 'lab_sample_status',)
  }
};
