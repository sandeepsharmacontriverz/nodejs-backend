'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mandis', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      short_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      address: {
        allowNull: false,
        type: Sequelize.STRING
      },
      country_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'countries', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      state_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'states', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      district_id: {
        type: Sequelize.INTEGER
      },
      program_id: {
        allowNull: false,
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      latitude: {
        type: Sequelize.STRING
      },
      longitude: {
        type: Sequelize.STRING
      },
      website: {
        type: Sequelize.STRING
      },
      contact_person: {
        allowNull: false,
        type: Sequelize.STRING
      },
      outturn_range_from: {
        allowNull: false,
        type: Sequelize.STRING
      },
      outturn_range_to: {
        allowNull: false,
        type: Sequelize.STRING
      },
      bale_weight_from: {
        allowNull: false,
        type: Sequelize.STRING
      },
      bale_weight_to: {
        allowNull: false,
        type: Sequelize.STRING
      },
      unit_cert: {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      company_info: {
        type: Sequelize.STRING
      },
      org_logo: {
        type: Sequelize.STRING
      },
      org_photo: {
        type: Sequelize.STRING
      },
      certs: {
        type: Sequelize.STRING
      },
      brand: {
        allowNull: false,
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      mobile: {
        type: Sequelize.STRING
      },
      landline: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      mandi_type: {
        type: Sequelize.STRING
      },
      mandiUser_id: {
        allowNull: false,
        type: Sequelize.ARRAY(Sequelize.INTEGER)
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
    await queryInterface.dropTable('mandis');
  }
};