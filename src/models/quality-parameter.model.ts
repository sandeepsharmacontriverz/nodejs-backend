import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
// import GinProcess from './gin-process.model';
import Ginner from './mandi.model';
import Spinner from './mills.model';
import MandiProcess from './mandi-process.model';
import MandiSales from './mandi-sales.model';
import Mandi from './mandi.model';
import Mill from './mills.model';
// import SpinProcess from './spin-process.model';
// import GinSales from './gin-sales.model';

const QualityParameter = db.define('quality-parameters', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  process_id: {
    type: DataTypes.INTEGER
  },
  mill_id: {
    type: DataTypes.INTEGER
  },
  mandi_id: {
    type: DataTypes.INTEGER
  },
  sold_to: {
    type: DataTypes.INTEGER
  },
  test_report: {
    type: DataTypes.DATE
  },
  lab_name: {
    type: DataTypes.STRING
  },
  sci: {
    type: DataTypes.DOUBLE
  },
  moisture: {
    type: DataTypes.DOUBLE
  },
  mic: {
    type: DataTypes.DOUBLE
  },
  mat: {
    type: DataTypes.DOUBLE
  },
  uhml: {
    type: DataTypes.DOUBLE
  },
  ui: {
    type: DataTypes.DOUBLE
  },
  sf: {
    type: DataTypes.DOUBLE
  },
  str: {
    type: DataTypes.DOUBLE
  },
  elg: {
    type: DataTypes.DOUBLE
  },
  rd: {
    type: DataTypes.DOUBLE
  },
  plusb: {
    type: DataTypes.DOUBLE
  },
  sales_id: {
    type: DataTypes.INTEGER
  },
  lot_no: {
    type: DataTypes.STRING
  },
  reel_lot_no: {
    type: DataTypes.STRING
  },
  document: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
});

QualityParameter.belongsTo(Mill, {
  foreignKey: "sold_to",
  as: "sold",
});

QualityParameter.belongsTo(MandiProcess, {
  foreignKey: "process_id",
  as: "process",
});

QualityParameter.belongsTo(Mandi, {
  foreignKey: "mandi_id",
  as: "mandi",
});

QualityParameter.belongsTo(Mill, {
  foreignKey: "mill_id",
  as: "mill",
});

QualityParameter.belongsTo(MandiSales, {
  foreignKey: "sales_id",
  as: "sales",
});

QualityParameter.sync();

export default QualityParameter;
