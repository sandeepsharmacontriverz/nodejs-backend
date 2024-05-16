'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('third_party_samples_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      third_party_sample_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'third_party_samples', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      sample_name: {
        type: Sequelize.STRING
      },
      sample_upload: {
        type: Sequelize.STRING
      },
      sample_status: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('third_party_samples_details');
  }
};