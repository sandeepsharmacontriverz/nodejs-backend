import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import MillProcess from './mill-process.model';
import MandiSales from './mandi-sales.model';

const MillPaddySelections = db.define('mill_paddy_seletions', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  process_id: {
    type: DataTypes.INTEGER
  },
  paddy_id: {
    type: DataTypes.INTEGER
  },
  qty_used: {
    type: DataTypes.DOUBLE
  }
});

MillPaddySelections.belongsTo(MillProcess, {
  foreignKey: "process_id",
  as: "millprocess",
});

MillPaddySelections.belongsTo(MandiSales, {
  foreignKey: "paddy_id",
  as: "mandisales",
});

MillPaddySelections.sync();

export default MillPaddySelections;

