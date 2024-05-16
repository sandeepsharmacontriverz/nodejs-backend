import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';
import Country from './country.model';

const State = db.define('states',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  state_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  state_latitude: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state_longitude: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

State.belongsTo(Country, {
  foreignKey: "country_id",
  as: "country",
})

// State.hasMany(District, {
//   foreignKey: "state_id",
//   as: "state",
// })

State.associate = (models: any) => {
  State.hasMany(models.District, {
    foreignKey: 'state_id',
    as: 'state',
  });

  State.hasMany(models.Farmer, {
    foreignKey: 'state_id',
    as: 'state',
  });

  State.hasMany(models.Mill, {
    foreignKey: 'state_id',
    as: 'state',
  });

  State.hasMany(models.Mandi, {
    foreignKey: 'state_id',
    as: 'state',
  });

  State.hasMany(models.Transaction, {
    foreignKey: 'state_id',
    as: 'state',
  });

  State.hasMany(models.ScopeCert, {
    foreignKey: 'state_id',
    as: 'state',
  });

  State.hasMany(models.ProcessorTraining, {
    foreignKey: 'state_id',
    as: 'state',
  });
};

State.sync();

export default State;