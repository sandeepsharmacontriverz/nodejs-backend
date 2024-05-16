import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';

const RiceType = db.define('rice_types',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  riceType_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  riceType_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

export default RiceType;