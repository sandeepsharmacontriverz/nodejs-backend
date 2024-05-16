'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.removeColumn('third_party_samples', 'samples');

    await queryInterface.addColumn('third_party_samples', 'code', {
      type: Sequelize.STRING
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('third_party_samples', 'code');
    await queryInterface.addColumn('third_party_samples', 'samples', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });
  }
};
