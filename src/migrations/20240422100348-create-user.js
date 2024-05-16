'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      firstname: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lastname: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      farm_group: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
      },
      role: {
        type: Sequelize.INTEGER,
      },
      position: {
        type: Sequelize.STRING
      },
      mobile: {
        allowNull: false,
        type: Sequelize.STRING
      },
      countries_web: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
      },
      access_level: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
      country_id: {
        type: Sequelize.INTEGER,
      },
      state_id: {
        type: Sequelize.INTEGER,
      },
      district_id: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
      },
      block_id: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
      },
      village_id: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
      },
      brand_mapped: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
      },
      ticketApproveAccess: {
        type: Sequelize.BOOLEAN
      },
      ticketCountryAccess: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      ticketAccessOnly: {
        type: Sequelize.BOOLEAN
      },
      isManagementUser: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isAgreementAgreed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      status: {
        allowNull: false,
        defaultValue: true,
        type: Sequelize.BOOLEAN
      },
      process_role: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
      },
      otp: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      expiry: {
        type: Sequelize.DATE,
        allowNull: true,
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};
