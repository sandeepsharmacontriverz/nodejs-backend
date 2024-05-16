import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import MandiProcess from './mandi-process.model';

const MandiBag = db.define('mandi-bags', {
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
  bag_no: {
    type: DataTypes.STRING
  },
  weight: {
    type: DataTypes.STRING
  },
  Q1: {
    type: DataTypes.STRING
  },
  Q2: {
    type: DataTypes.STRING
  },
  Q3: {
    type: DataTypes.STRING
  },
  Q4: {
    type: DataTypes.STRING
  },
  Q5: {
    type: DataTypes.STRING
  },
  Q6: {
    type: DataTypes.STRING
  },
  Q7: {
    type: DataTypes.STRING
  },
  qr: {
    type: DataTypes.STRING
  },
  sold_status: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  mill_status: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  old_weight: {
    type: DataTypes.STRING
  }
});

MandiBag.belongsTo(MandiProcess, {
  foreignKey: "process_id",
  as: "mandiprocess",
});

MandiBag.sync();

export default MandiBag;