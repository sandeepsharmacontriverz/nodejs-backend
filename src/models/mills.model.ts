import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import Country from './country.model';
import State from './state.model';
import District from './district.model';

const Mill = db.define('mills', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: {
    allowNull: false,
    type: DataTypes.STRING
  },
  short_name: {
    allowNull: false,
    type: DataTypes.STRING
  },
  address: {
    allowNull: false,
    type: DataTypes.STRING
  },
  country_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'countries', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  state_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'states', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  district_id: {
    type: DataTypes.INTEGER
  },
  program_id: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  latitude: {
    type: DataTypes.STRING
  },
  longitude: {
    type: DataTypes.STRING
  },
  website: {
    type: DataTypes.STRING
  },
  contact_person: {
    allowNull: false,
    type: DataTypes.STRING
  },
  rice_type: {
    type: DataTypes.STRING
  },
  rice_variety: {
    type: DataTypes.STRING
  },
  realisation_range_from: {
    allowNull: false,
    type: DataTypes.STRING
  },
  realisation_range_to: {
    allowNull: false,
    type: DataTypes.STRING
  },
  unit_cert: {
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  company_info: {
    type: DataTypes.STRING
  },
  org_logo: {
    type: DataTypes.STRING
  },
  org_photo: {
    type: DataTypes.STRING
  },
  certs: {
    type: DataTypes.STRING
  },
  brand: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  mobile: {
    type: DataTypes.STRING
  },
  landline: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING
  },
  millUser_id: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  registration_document: {
    type: DataTypes.STRING
  }
});

Mill.belongsTo(Country, {
  foreignKey: "country_id",
  as: "country",
});

Mill.belongsTo(State, {
  foreignKey: "state_id",
  as: "state",
});
Mill.belongsTo(District, {
  foreignKey: "district_id",
  as: "district",
});

Mill.sync();

export default Mill;