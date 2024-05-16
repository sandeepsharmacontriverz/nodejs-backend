import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import Country from './country.model';
import State from './state.model';
import District from './district.model';

const ContainerManagementSystem = db.define('container_management_systems', {
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
    containerManagmentUser_id: {
        allowNull: false,
        type: DataTypes.ARRAY(DataTypes.INTEGER)
    },
    registration_document: {
        type: DataTypes.STRING
    }
});

ContainerManagementSystem.belongsTo(Country, {
    foreignKey: "country_id",
    as: "country",
});

ContainerManagementSystem.belongsTo(State, {
    foreignKey: "state_id",
    as: "state",
});

ContainerManagementSystem.belongsTo(District, {
    foreignKey: "district_id",
    as: "district",
});

ContainerManagementSystem.sync();

export default ContainerManagementSystem;
