import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import Mandi from './mandi.model';
import Season from './season.model';
import Program from './program.model';
import Mill from './mills.model';
import BagSelection from './bag-selection.model';

const MandiSales = db.define('mandi_sales', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  mandi_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'mandis', key: 'id' },
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
  total_qty: {
    type: DataTypes.DOUBLE
  },
  no_of_bags: {
    type: DataTypes.INTEGER
  },
  chosen_bag: {
    type: DataTypes.STRING
  },
  lot_no: {
    type: DataTypes.STRING
  },
  buyer: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  shipping_address: {
    allowNull: false,
    type: DataTypes.STRING
  },
  transaction_via_trader: {
    allowNull: false,
    type: DataTypes.BOOLEAN
  },
  transaction_agent: {
    type: DataTypes.STRING
  },
  tc_file: {
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
  candy_rate: {
    allowNull: false,
    type: DataTypes.STRING
  },
  rate: {
    allowNull: false,
    type: DataTypes.STRING
  },
  sale_value: {
    type: DataTypes.STRING
  },
  invoice_no: {
    type: DataTypes.STRING
  },
  despatch_from: {
    allowNull: false,
    type: DataTypes.STRING
  },
  despatch_to: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.STRING
  },
  qr: {
    type: DataTypes.STRING
  },
  weight_loss: {
    type: DataTypes.BOOLEAN
  },
  transporter_name: {
    type: DataTypes.STRING
  },
  vehicle_no: {
    type: DataTypes.STRING
  },
  lrbl_no: {
    type: DataTypes.STRING
  },
  place_of_supply: {
    type: DataTypes.STRING
  },
  gst_number: {
    type: DataTypes.STRING
  },
  gst_percentage: {
    type: DataTypes.STRING
  },
  gross_weight: {
    type: DataTypes.STRING
  },
  tare_weight: {
    type: DataTypes.STRING
  },
  less_weight: {
    type: DataTypes.STRING
  },
  sample: {
    type: DataTypes.STRING
  },
  accept_date: {
    type: DataTypes.DATE
  },
  bag_press_no: {
    type: DataTypes.STRING
  },
  reel_lot_no: {
    type: DataTypes.STRING
  },
  qty_stock: {
    type: DataTypes.DOUBLE
  },
  upload_sample: {
    type: DataTypes.STRING
  }
});

MandiSales.belongsTo(Mandi, {
  foreignKey: "mandi_id",
  as: "mandi",
});

MandiSales.belongsTo(Mill, {
  foreignKey: "buyer",
  as: "buyerdata",
});

MandiSales.belongsTo(Season, {
  foreignKey: "season_id",
  as: "season",
});

MandiSales.belongsTo(Program, {
  foreignKey: "program_id",
  as: "program",
});


MandiSales.sync()

export default MandiSales;