import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import MandiSales from './mandi-sales.model';
import MandiBag from './mandi-bags.model';

const BagSelection = db.define('bag_selections', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  sales_id: {
    type: DataTypes.INTEGER
  },
  bag_id: {
    type: DataTypes.INTEGER
  },
  print: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  bag_status: {
    type: DataTypes.BOOLEAN,
    defaultValue: null
  }
});

BagSelection.belongsTo(MandiSales, {
  foreignKey: 'sales_id',
  as: 'sales',
});

BagSelection.belongsTo(MandiBag, {
  foreignKey: "bag_id",
  as: "bag",
})

BagSelection.sync();

export default BagSelection;
