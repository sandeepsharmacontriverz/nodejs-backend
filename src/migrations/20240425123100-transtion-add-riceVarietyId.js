'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
      await queryInterface.addColumn('transactions', 'riceVariety_id', {
        type: Sequelize.INTEGER,
        references: { model: "rice_varieties", key: "id" },
      });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('transactions', 'riceVariety_id');
  }
};
