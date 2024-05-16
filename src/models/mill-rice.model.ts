import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import MillProcess from './mill-process.model';
import RiceType from './rice-type.model';

const MillRice = db.define('mill_rices', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  process_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rice_tyoe: {
    type: DataTypes.INTEGER
  },
  rice_produced: {
    type: DataTypes.DOUBLE
  },
  rice_qty_stock: {
    type: DataTypes.DOUBLE
  },
  qr: {
    type: DataTypes.STRING
  },
  sold_status: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

MillRice.belongsTo(MillProcess, {
  foreignKey: "process_id",
  as: "millprocess",
});

MillRice.belongsTo(RiceType, {
  foreignKey: "rice_tyoe",
  as: "riceType",
});

MillRice.sync();

export default MillRice;