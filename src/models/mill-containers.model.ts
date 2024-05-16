import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import MillSales from './mill-sales.model';


const MillContainers = db.define('mill_containers', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  sales_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  container_name: {
    type: DataTypes.STRING
  },
  container_no: {
    type: DataTypes.STRING
  },
  container_weight: {
    type: DataTypes.DOUBLE
  },
  qr: {
    type: DataTypes.STRING
  },
  cms_status: {
    type: DataTypes.BOOLEAN,
    defaultValue: null
  },
  sold_status: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
});

MillContainers.belongsTo(MillSales, {
  foreignKey: "sales_id",
  as: "millsales",
});

MillContainers.sync();

export default MillContainers;