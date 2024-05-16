'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('third_party_samples', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      third_party_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'third_party_inspections', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      mill_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'mills', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      mill_process_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      sample_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      program_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      sample_collector: {
        type: Sequelize.TEXT
      },
      no_of_samples: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      lot_no: {
        type: Sequelize.STRING
      },
      samples: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      lab_id: {
        type: Sequelize.INTEGER
      },
      expected_date: {
        type: Sequelize.DATE
      },
      status: {
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
    await queryInterface.dropTable('third_party_samples');
  }
};