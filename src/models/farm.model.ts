import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import Farmer from './farmer.model';
import Program from './program.model';
import Season from './season.model';

const Farm = db.define('farms', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    farmer_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: { model: 'farmers', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
    },
    season_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        foreignKey: true,
        references: { model: 'seasons', key: 'id' },
        onDelete: 'CASCADE'
    },
    program_id: {
        allowNull: false,
        foreignKey: true,
        references: { model: 'programs', key: 'id' },
        onDelete: 'CASCADE',
        type: DataTypes.INTEGER
    },
    agri_total_area: {
        type: DataTypes.DECIMAL
    },
    agri_estimated_yeld: {
        type: DataTypes.DECIMAL
    },
    agri_estimated_prod: {
        type: DataTypes.DECIMAL
    },
    paddy_total_area: {
        type: DataTypes.DECIMAL
    },
    total_estimated_paddy: {
        type: DataTypes.DECIMAL
    },
    paddy_transacted: {
        type: DataTypes.DECIMAL,
        defaultValue: 0
    },
    cluster: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    seed_packet_quantity: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    variety: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    lot_no: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    distribution_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },
    source_of_seed: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    }
});

Farm.belongsTo(Farmer, {
    foreignKey: "farmer_id",
    as: "farmer",
})

Farm.belongsTo(Program, {
    foreignKey: "program_id",
    as: "program",
})

Farm.belongsTo(Season, {
    foreignKey: "season_id",
    as: "season",
})


export default Farm;