import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import Mandi from './mandi.model';
import Season from './season.model';
import Program from './program.model';

const MandiProcess = db.define('mandi_processes', {
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
  mandi_out_turn: {
    type: DataTypes.DOUBLE
  },
  lot_no: {
    allowNull: false,
    type: DataTypes.STRING
  },
  reel_lot_no: {
    type: DataTypes.STRING
  },
  bag_press_no: {
    type: DataTypes.STRING
  },
  qr: {
    type: DataTypes.STRING
  },
  heap_number: {
    type: DataTypes.STRING
  },
  heap_register: {
    type: DataTypes.STRING
  },
  weigh_bridge: {
    type: DataTypes.STRING
  },
  delivery_challan: {
    type: DataTypes.STRING
  },
  bag_process: {
    type: DataTypes.STRING
  },
  rice_quality: {
    type: DataTypes.STRING
  },
});

MandiProcess.belongsTo(Season, {
  foreignKey: "season_id",
  as: "season",
});

MandiProcess.belongsTo(Program, {
  foreignKey: "program_id",
  as: "program",
});


MandiProcess.belongsTo(Mandi, {
  foreignKey: "mandi_id",
  as: "mandi",
});

MandiProcess.sync();

export default MandiProcess;