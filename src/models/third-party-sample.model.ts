import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import ThirdPartyInspection from './third-party-inspections.model';
import Mill from './mills.model';
import Program from './program.model';
import MillProcess from './mill-process.model';
import Lab from './lab.model';

const ThirdPartySample = db.define('third_party_samples', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    third_party_id: {
      type: DataTypes.INTEGER,
      foreignKey: true,
      references: { model: 'third_party_inspections', key: 'id' },
      onDelete: 'CASCADE',
      allowNull: false,
    },
    mill_id: {
      type: DataTypes.INTEGER,
      foreignKey: true,
      references: { model: 'mills', key: 'id' },
      onDelete: 'CASCADE',
      allowNull: false,
    },
    mill_process_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sample_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    program_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sample_collector: {
      type: DataTypes.TEXT
    },
    no_of_samples: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lot_no: {
      type: DataTypes.STRING
    },
    code: {
      type: DataTypes.STRING
    },
    lab_id: {
      type: DataTypes.INTEGER
    },
    expected_date: {
      type: DataTypes.DATE
    },
    status: {
      type: DataTypes.STRING
    },
    sample_reports: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: null
  }
});

ThirdPartySample.belongsTo(ThirdPartyInspection, {
    foreignKey: "third_party_id",
    as: "thirdparty",
});

ThirdPartySample.belongsTo(Mill, {
    foreignKey: "mill_id",
    as: "mill",
});

ThirdPartySample.belongsTo(MillProcess, {
  foreignKey: "mill_process_id",
  as: "millprocess",
});

ThirdPartySample.belongsTo(Program, {
    foreignKey: "program_id",
    as: "program",
});

ThirdPartySample.belongsTo(Lab, {
  foreignKey: "lab_id",
  as: "lab",
});

ThirdPartySample.sync();

export default ThirdPartySample;
