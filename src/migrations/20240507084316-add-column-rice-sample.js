'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('third_party_samples', 'sample_reports', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('third_party_samples', 'sample_reports');
  }
};
