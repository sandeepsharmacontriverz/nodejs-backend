import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';

const RiceVariety = db.define('rice_varieties',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  variety_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  variety_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

RiceVariety.associate = (models: any) => {
  RiceVariety.hasMany(models.Farmer, {
    foreignKey: "riceVariety_id",
    as: "rice_variety",
  });
  RiceVariety.hasMany(models.Transaction, {
    foreignKey: "riceVariety_id",
    as: "rice_variety",
  });
};

export default RiceVariety;