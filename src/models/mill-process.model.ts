import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import Mill from './mills.model';
// import Dyeing from './dyeing.model';
import Program from './program.model';
import Season from './season.model';
import RiceType from './rice-type.model';
import RiceVariety from './rice-variety.model';

const MillProcess = db.define('mill_processes', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  mill_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'mills', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  season_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  date: {
    allowNull: false,
    type: DataTypes.DATE
  },
  order_reference: {
    type: DataTypes.STRING
  },
  godown_no: {
    type: DataTypes.STRING
  },
  stack_no: {
    type: DataTypes.STRING
  },
  program_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  rice_variety: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  total_qty: {
    allowNull: false,
    type: DataTypes.DOUBLE
  },
  rice_type: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  rice_qty_produced: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.DOUBLE)
  },
  rice_realisation: {
    allowNull: false,
    type: DataTypes.DOUBLE
  },
  net_rice_qty: {
    type: DataTypes.DOUBLE
  },
  husks: {
    type: DataTypes.DOUBLE
  },
  no_of_bags: {
    type: DataTypes.INTEGER
  },
  batch_lot_no: {
    allowNull: false,
    type: DataTypes.STRING
  },
  reel_lot_no: {
    type: DataTypes.STRING
  },
  bag_id: {
    type: DataTypes.STRING
  },
  process_complete: {
    allowNull: false,
    type: DataTypes.BOOLEAN
  },
  other_required: {
    allowNull: false,
    type: DataTypes.BOOLEAN
  },
  qty_stock: {
    type: DataTypes.DOUBLE
  },
  status: {
    type: DataTypes.STRING
  },
  accept_date: {
    type: DataTypes.DATE,
  },
  qr: {
    type: DataTypes.STRING
  },
  other_information: {
    type: DataTypes.STRING
  },
  other_process: {
    type: DataTypes.STRING
  },
  rice_quality_document: {
    type: DataTypes.STRING
  }, 
  lab_sample_status: {
    type: DataTypes.STRING
  },
});


MillProcess.belongsTo(Season, {
  foreignKey: "season_id",
  as: "season",
});

MillProcess.belongsTo(RiceType, {
  foreignKey: "rice_type",
  as: "riceType",
});

MillProcess.belongsTo(RiceVariety, {
  foreignKey: "rice_variety",
  as: "variety",
});

MillProcess.belongsTo(Program, {
  foreignKey: "program_id",
  as: "program",
});

MillProcess.belongsTo(Mill, {
  foreignKey: "mill_id",
  as: "mill",
});

// SpinProcess.belongsTo(Dyeing, {
//   foreignKey: "dyeing_id",
//   as: "dyeing",
// });

MillProcess.sync();

export default MillProcess;