'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users_apps', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      firstName: {
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.STRING
      },
      reset_token: {
        type: Sequelize.STRING
      },
      mobile_no: {
        type: Sequelize.STRING
      },
      access_level: {
        type: Sequelize.STRING
      },
      user_reg_id: {
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING
      },
      agent_id: {
        type: Sequelize.INTEGER
      },
      mandi_id: {
        type: Sequelize.INTEGER
      },
      mill_id: {
        type: Sequelize.INTEGER
      },
      cms_id: {
        type: Sequelize.INTEGER
      },
      country: {
        type: Sequelize.INTEGER
      },
      farmer_group: {
        type: Sequelize.STRING
      },
      program: {
        type: Sequelize.INTEGER
      },
      platform: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.BOOLEAN
      },
      acs_country_id: {
        type: Sequelize.INTEGER
      },
      acs_state_id: {
        type: Sequelize.INTEGER
      },
      acs_district: {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      acs_block: {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      acs_village: {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      acs_mandi: {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      acs_brand: {
        type: Sequelize.INTEGER
      },
      acs_all_village: {
        type: Sequelize.BOOLEAN
      },
      remember_me_token: {
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
    await queryInterface.dropTable('users_apps');
  }
};