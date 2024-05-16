import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import MillProcess from './mill-process.model';
import MillSales from './mill-sales.model';

const MillRiceSelections = db.define('mill_rice_selections', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  mill_process_id: {
    type: DataTypes.INTEGER
  },
  sales_id: {
    type: DataTypes.INTEGER
  },
  qty_used: {
    type: DataTypes.DOUBLE
  },
});

MillRiceSelections.belongsTo(MillProcess, {
  foreignKey: "mill_process_id",
  as: "process",
});

MillRiceSelections.belongsTo(MillSales, {
  foreignKey: "sales_id",
  as: "sales",
});


MillRiceSelections.sync();

export default MillRiceSelections;
