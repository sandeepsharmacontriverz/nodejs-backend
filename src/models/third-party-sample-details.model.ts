import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import ThirdPartySample from './third-party-sample.model';

const ThirdPartySampleDetails = db.define('third_party_samples_details', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    third_party_sample_id: {
      type: DataTypes.INTEGER,
      foreignKey: true,
      references: { model: 'third_party_samples', key: 'id' },
      onDelete: 'CASCADE',
      allowNull: false,
    },
    sample_name: {
      type: DataTypes.STRING
    },
    sample_upload: {
      type: DataTypes.STRING
    },
    sample_status: {
      type: DataTypes.STRING
    },
});

ThirdPartySampleDetails.belongsTo(ThirdPartySample, {
    foreignKey: "third_party_sample_id",
    as: "ricesample",
});


ThirdPartySampleDetails.sync();

export default ThirdPartySampleDetails;
