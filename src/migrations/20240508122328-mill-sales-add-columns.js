'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('mill_sales', 'fumigation_date', {
      type: Sequelize.TEXT
    });
    await queryInterface.addColumn('mill_sales', 'fumigation_chemicals_details', {
      type: Sequelize.TEXT
    });
    await queryInterface.addColumn('mill_sales', 'fumigation_total_qty', {
      type: Sequelize.TEXT
    });
    await queryInterface.addColumn('mill_sales', 'fumigation_total_chemical_used', {
      type: Sequelize.TEXT
    });
    await queryInterface.addColumn('mill_sales', 'fumigation_chemical_invoice', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('mill_sales', 'fumigation_time', {
      type: Sequelize.TIME
    });

    // 17 Upload new columns 
    await queryInterface.addColumn('mill_sales', 'analysis_report', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('mill_sales', 'contract_basis_employee', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('mill_sales', 'daily_packing_report', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('mill_sales', 'dryer_output', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('mill_sales', 'employee_on_payroll', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('mill_sales', 'entry_quality_analysis', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('mill_sales', 'grn', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('mill_sales', 'hodi_katai', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('mill_sales', 'in_process', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('mill_sales', 'invoice_for_po', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('mill_sales', 'labour_bill', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('mill_sales', 'lease_premises_expenses', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('mill_sales', 'plant_analysis_report', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('mill_sales', 'production_schedule', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('mill_sales', 'purchase_order', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('mill_sales', 'salaried_employee_expenses_frl', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('mill_sales', 'truck_inward_details', {
      type: Sequelize.STRING
    });
  },

  async down (queryInterface, Sequelize) {

    await queryInterface.removeColumn('mill_sales', 'fumigation_date');
    await queryInterface.removeColumn('mill_sales', 'fumigation_chemicals_details');
    await queryInterface.removeColumn('mill_sales', 'fumigation_total_qty');
    await queryInterface.removeColumn('mill_sales', 'fumigation_total_chemical_used');
    await queryInterface.removeColumn('mill_sales', 'fumigation_chemical_invoice');
    await queryInterface.removeColumn('mill_sales', 'fumigation_time');

    // 17 Upload new columns 
    await queryInterface.removeColumn('mill_sales', 'analysis_report');
    await queryInterface.removeColumn('mill_sales', 'contract_basis_employee');
    await queryInterface.removeColumn('mill_sales', 'daily_packing_report');
    await queryInterface.removeColumn('mill_sales', 'dryer_output');
    await queryInterface.removeColumn('mill_sales', 'employee_on_payroll');
    await queryInterface.removeColumn('mill_sales', 'entry_quality_analysis');
    await queryInterface.removeColumn('mill_sales', 'grn');
    await queryInterface.removeColumn('mill_sales', 'hodi_katai');
    await queryInterface.removeColumn('mill_sales', 'in_process');
    await queryInterface.removeColumn('mill_sales', 'invoice_for_po');
    await queryInterface.removeColumn('mill_sales', 'labour_bill');
    await queryInterface.removeColumn('mill_sales', 'lease_premises_expenses');
    await queryInterface.removeColumn('mill_sales', 'plant_analysis_report');
    await queryInterface.removeColumn('mill_sales', 'production_schedule');
    await queryInterface.removeColumn('mill_sales', 'purchase_order');
    await queryInterface.removeColumn('mill_sales', 'salaried_employee_expenses_frl');
    await queryInterface.removeColumn('mill_sales', 'truck_inward_details');
  }
};
