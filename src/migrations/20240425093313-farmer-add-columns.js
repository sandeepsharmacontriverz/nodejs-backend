'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const farmersTable = await queryInterface.describeTable('farmers');

    // Check if riceVariety_id column exists
    if (!farmersTable.hasOwnProperty('riceVariety_id')) {
      await queryInterface.addColumn('farmers', 'riceVariety_id', {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: "rice_varieties", key: "id" },
        onDelete: "SET NULL",
      });
    }

    // Check if farmGroup_id column exists
    if (!farmersTable.hasOwnProperty('farmGroup_id')) {
      await queryInterface.addColumn('farmers', 'farmGroup_id', {
        allowNull: false,
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: "farm_groups", key: "id" },
        onDelete: "CASCADE",
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('farmers', 'riceVariety_id');
    await queryInterface.removeColumn('farmers', 'farmGroup_id');
  }
};
