import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import UserRegistrations from './user-registrations.model';
import Program from './program.model';
import Mandi from './mandi.model';
import Mill from './mills.model';
// import Garment from './garment.model';
// import Weaver from './weaver.model';
import CMS from "./container-management-system.model";
import Country from './country.model';
import State from './state.model';
import Brand from './brand.model';

const UserApp = db.define('users_apps', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  username: {
    type: DataTypes.STRING
  },
  password: {
    type: DataTypes.STRING
  },
  firstName: {
    type: DataTypes.STRING
  },
  lastName: {
    type: DataTypes.STRING
  },
  reset_token: {
    type: DataTypes.STRING
  },
  mobile_no: {
    type: DataTypes.STRING
  },
  access_level: {
    type: DataTypes.STRING
  },
  user_reg_id: {
    type: DataTypes.INTEGER
  },
  email: {
    type: DataTypes.STRING
  },
  agent_id: {
    type: DataTypes.INTEGER
  },
  mandi_id: {
    type: DataTypes.INTEGER
  },
  mill_id: {
    type: DataTypes.INTEGER
  },
  // garment_id: {
  //   type: DataTypes.INTEGER
  // },
  // weaver_id: {
  //   type: DataTypes.INTEGER
  // },
  cms_id: {
    type: DataTypes.INTEGER
  },
  country: {
    type: DataTypes.INTEGER
  },
  farmer_group: {
    type: DataTypes.STRING
  },
  program: {
    type: DataTypes.INTEGER
  },
  platform: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.BOOLEAN
  },
  acs_country_id: {
    type: DataTypes.INTEGER
  },
  acs_state_id: {
    type: DataTypes.INTEGER
  },
  acs_district: {
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  acs_block: {
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  acs_village: {
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  acs_mandi: {
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  acs_brand: {
    type: DataTypes.INTEGER
  },
  acs_all_village: {
    type: DataTypes.BOOLEAN
  },
  remember_me_token: {
    type: DataTypes.STRING
  },
});

UserApp.belongsTo(UserRegistrations, {
  foreignKey: "user_reg_id",
  as: "registrations",
})

UserApp.belongsTo(Program, {
  foreignKey: "program",
  as: "programs",
})

UserApp.belongsTo(Mandi, {
  foreignKey: "mandi_id",
  as: "mandi",
})

UserApp.belongsTo(Mill, {
  foreignKey: "mill_id",
  as: "mill",
})

// UserApp.belongsTo(Garment, {
//   foreignKey: "garment_id",
//   as: "garment",
// })

// UserApp.belongsTo(Weaver, {
//   foreignKey: "weaver_id",
//   as: "weaver",
// });

UserApp.belongsTo(CMS, {
  foreignKey: "cms_id",
  as: "cms",
});

UserApp.belongsTo(Country, {
  foreignKey: "acs_country_id",
  as: "acscountry",
});

UserApp.belongsTo(State, {
  foreignKey: "acs_state_id",
  as: "acsstate",
});

UserApp.belongsTo(Brand, {
  foreignKey: "acs_brand",
  as: "acsbrand",
});

UserApp.sync();

export default UserApp;