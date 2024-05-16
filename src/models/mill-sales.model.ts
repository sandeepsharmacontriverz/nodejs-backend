import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import Mill from './mills.model';
// import Dyeing from './dyeing.model';
import Program from './program.model';
import Season from './season.model';
import ContainerManagementSystem from './container-management-system.model';

const MillSales = db.define('mill_sales', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  mill_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'mills', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  season_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  date: {
    allowNull: false,
    type: DataTypes.DATE
  },
  program_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  order_ref: {
    type: DataTypes.STRING
  },
  buyer_type: {
    allowNull: false,
    type: DataTypes.STRING
  },
  buyer_id: {
    type: DataTypes.INTEGER
  },
  processor_name: {
    type: DataTypes.STRING
  },
  processor_address: {
    type: DataTypes.STRING
  },
  transaction_via_trader: {
    allowNull: false,
    type: DataTypes.BOOLEAN
  },
  transaction_agent: {
    type: DataTypes.STRING
  },
  total_qty: {
    type: DataTypes.DOUBLE
  },
  no_of_containers: {
    type: DataTypes.INTEGER
  },
  batch_lot_no: {
    allowNull: false,
    type: DataTypes.TEXT
  },
  reel_lot_no: {
    type: DataTypes.TEXT
  },
  rice_type: {
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  rice_variety: {
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  container_name: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  container_no: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  invoice_no: {
    allowNull: false,
    type: DataTypes.STRING
  },
  bill_of_ladding: {
    allowNull: false,
    type: DataTypes.STRING
  },
  transporter_name: {
    allowNull: false,
    type: DataTypes.STRING
  },
  vehicle_no: {
    allowNull: false,
    type: DataTypes.STRING
  },
  quality_doc: {
    type: DataTypes.STRING
  },
  tc_files: {
    type: DataTypes.STRING
  },
  contract_file: {
    type: DataTypes.STRING
  },
  invoice_file: {
    type: DataTypes.ARRAY(DataTypes.TEXT)
  },
  delivery_notes: {
    type: DataTypes.STRING
  },
  qty_stock: {
    type: DataTypes.DOUBLE
  },
  status: {
    type: DataTypes.STRING
  },
  accept_date: {
    type: DataTypes.DATE
  },
  qr: {
    type: DataTypes.STRING
  },
  price: {
    type: DataTypes.DOUBLE
  },
  dispatch_date: {
    type: DataTypes.DATE
  },
  fumigation_date: {
    type: DataTypes.TEXT
  },
  fumigation_chemicals_details: {
    type: DataTypes.TEXT
  },
  fumigation_total_qty: {
    type: DataTypes.TEXT
  },
  fumigation_total_chemical_used: {
    type: DataTypes.TEXT
  },
  fumigation_chemical_invoice: {
    type: DataTypes.STRING
  },
  fumigation_time: {
    type: DataTypes.TIME
  },
  analysis_report: {
    type: DataTypes.STRING
  },
  contract_basis_employee: {
    type: DataTypes.STRING
  },
  daily_packing_report: {
    type: DataTypes.STRING
  },
  dryer_output: {
    type: DataTypes.STRING
  },
  employee_on_payroll: {
    type: DataTypes.STRING
  },
  entry_quality_analysis: {
    type: DataTypes.STRING
  },
  grn: {
    type: DataTypes.STRING
  },
  hodi_katai: {
    type: DataTypes.STRING
  },
  in_process: {
    type: DataTypes.STRING
  },
  invoice_for_po: {
    type: DataTypes.STRING
  },
  labour_bill: {
    type: DataTypes.STRING
  },
  lease_premises_expenses: {
    type: DataTypes.STRING
  },
  plant_analysis_report: {
    type: DataTypes.STRING
  },
  production_schedule: {
    type: DataTypes.STRING
  },
  purchase_order: {
    type: DataTypes.STRING
  },
  salaried_employee_expenses_frl: {
    type: DataTypes.STRING
  },
  truck_inward_details: {
    type: DataTypes.STRING
  }
});


MillSales.belongsTo(Season, {
  foreignKey: "season_id",
  as: "season",
});

MillSales.belongsTo(Program, {
  foreignKey: "program_id",
  as: "program",
});

MillSales.belongsTo(Mill, {
  foreignKey: "mill_id",
  as: "mill",
});

MillSales.belongsTo(ContainerManagementSystem, {
  foreignKey: "buyer_id",
  as: "containermanagement",
});

MillSales.sync();

export default MillSales;