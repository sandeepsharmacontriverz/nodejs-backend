'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('bag_selections', 'bag_status', {
      type: Sequelize.BOOLEAN,
      defaultValue: null
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('bag_selections', 'bag_status',);
  }
};
