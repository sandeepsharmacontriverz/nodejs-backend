import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';
import State from './state.model'

const Country = db.define('countries',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  county_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  latitude: {
    type: DataTypes.DOUBLE,
  }, 
  longitude: {
    type: DataTypes.DOUBLE,
  }
});

Country.associate = (models: any) => {
  Country.hasMany(models.State, {
    foreignKey: 'country_id',
    as: 'country',
  });
  Country.hasMany(models.Farmer, {
    foreignKey: 'country_id',
    as: 'country',
  });
  Country.hasMany(models.Mill, {
    foreignKey: 'country_id',
    as: 'country',
  });
  Country.hasMany(models.Mandi, {
    foreignKey: 'country_id',
    as: 'country',
  });
  Country.hasMany(models.Transaction, {
    foreignKey: 'country_id',
    as: 'country',
  });

  Country.hasMany(models.ScopeCert, {
    foreignKey: 'country_id',
    as: 'country',
  });

  Country.hasMany(models.ProcessorTraining, {
    foreignKey: 'country_id',
    as: 'country',
  });
};

Country.sync();

export default Country;