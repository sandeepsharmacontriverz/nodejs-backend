'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const Table = await queryInterface.describeTable('ics');

    if (!Table.hasOwnProperty('farmGroup_id')) {
    await queryInterface.addColumn('ics', 'farmGroup_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      foreignKey: true,
      references: { model: "farm_groups", key: "id" },
      onDelete: "CASCADE",
    });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('ics', 'farmGroup_id');
  }
};
