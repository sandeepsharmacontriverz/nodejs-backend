import { Request, Response } from "express";
import { Sequelize, Op, where } from "sequelize";
import * as ExcelJS from "exceljs";
import * as fs from "fs";
import * as path from "path";
import Brand from "../../models/brand.model";
// import FarmGroup from "../../models/farm-group.model";
import Farmer from "../../models/farmer.model";
import Farm from "../../models/farm.model";
import Program from "../../models/program.model";
import Season from "../../models/season.model";
import Country from "../../models/country.model";
import Village from "../../models/village.model";
import State from "../../models/state.model";
import District from "../../models/district.model";
import Block from "../../models/block.model";
import { generateQrCode } from "../../provider/qrcode";
import archiver from 'archiver';
import ICS from "../../models/ics.model";
import Transaction from "../../models/transaction.model";
import sequelize from "../../util/dbConn";
import RiceVariety from "../../models/rice-variety.model";
import FarmGroup from "../../models/farm-group.model";

//create farmer
const createFarmer = async (req: Request, res: Response) => {
  try {
    let result = await Farmer.findOne({ where: { code: req.body.code } })
    if (result) {
      return res.sendError(res, "FARMER_CODE_ALREADY_EXIST");
    }
    const data = {
      program_id: Number(req.body.programId),
      brand_id: Number(req.body.brandId),
      farmGroup_id: Number(req.body.farmGroupId),
      riceVariety_id: Number(req.body.riceVarietyId),
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      code: req.body.code,
      country_id: Number(req.body.countryId),
      state_id: Number(req.body.stateId),
      district_id: Number(req.body.districtId),
      block_id: Number(req.body.blockId),
      village_id: Number(req.body.villageId),
      joining_date: req.body.joiningDate,
      ics_id: Number(req.body.icsId),
      tracenet_id: req.body.tracenetId,
      cert_status: req.body.certStatus,
      agri_total_area: req.body.agriTotalArea,
      agri_estimated_yeld: req.body.agriEstimatedYield,
      agri_estimated_prod: req.body.agriEstimatedProd,
      paddy_total_area: req.body.cottonTotalArea,
      total_estimated_paddy: req.body.totalEstimatedCotton
    };
    const farmer = await Farmer.create(data);
    let village = await Village.findOne({ where: { id: Number(req.body.villageId) } })
    let uniqueFilename = `qrcode_${Date.now()}.png`;
    let name = farmer.firstName + " " + farmer.lastName
    let aa = await generateQrCode(`${farmer.id}`,
      name, uniqueFilename, farmer.code, village ? village.village_name : '');
    const farmerPLace = await Farmer.update({ qrUrl: uniqueFilename }, {
      where: {
        id: farmer.id
      }
    });
    const farmData = {
      farmer_id: farmer.id,
      program_id: Number(req.body.programId),
      season_id: Number(req.body.seasonId),
      agri_total_area: req.body.agriTotalArea,
      agri_estimated_yeld: req.body.agriEstimatedYield,
      agri_estimated_prod: req.body.agriEstimatedProd,
      paddy_total_area: req.body.cottonTotalArea,
      total_estimated_paddy: req.body.totalEstimatedCotton
    };
    const farm = await Farm.create(farmData);
    res.sendSuccess(res, { farmer, farm });
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
}

//fetch farmer details with filters
const fetchFarmerPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const sortOrder = req.query.sort || "asc";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const programId: string = req.query.programId as string;
  const brandId: string = req.query.brandId as string;
  const { icsId, farmGroupId, countryId, stateId, villageId, cert, seasonId }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { '$farmer.firstName$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by first name
        { '$farmer.code$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by code
        { '$farmer.program.program_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by program
        { '$farmer.country.county_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by country
        { '$farmer.village.village_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by village
        { '$farmer.brand.brand_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by brand
        { '$farmer.cert_status$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by cert status
      ];
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$farmer.brand_id$"] = { [Op.in]: idArray };
    }
    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$farmer.program_id$"] = { [Op.in]: idArray };
    }
    if (farmGroupId) {
      const idArray: number[] = farmGroupId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$farmer.farmGroup_id$"] = { [Op.in]: idArray };
    }

    if (countryId) {

      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$farmer.country_id$"] = { [Op.in]: idArray };
    }
    if (stateId) {
      const idArray: number[] = stateId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$farmer.state_id$"] = { [Op.in]: idArray };
    }
    if (villageId) {
      const idArray: number[] = villageId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$farmer.village_id$"] = { [Op.in]: idArray };
    }

    if (cert) {
      const idArray: string[] = cert
        .split(",")
        .map((id: any) => id);
      whereCondition["$farmer.cert_status$"] = { [Op.in]: idArray };
    }

    if (icsId) {
      const idArray: string[] = icsId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$farmer.ics_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: string[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }

    let include = [
      {
        model: Farmer,
        as: "farmer",
        include: [
          {
            model: Program,
            as: "program",
          },
          {
            model: Brand,
            as: "brand",
          },
          {
            model: RiceVariety,
            as: "rice_variety",
          },
          {
            model: FarmGroup,
            as: "farmGroup",
          },
          {
            model: Country,
            as: "country",
          },
          {
            model: Village,
            as: "village",
          },
          {
            model: State,
            as: "state",
          },
          {
            model: District,
            as: "district",
          },
          {
            model: Block,
            as: "block",
          }
        ]
      },
      {
        model: Season,
        as: "season"
      }

    ];
    let farmCount: any
    if (brandId || countryId || programId) {
      let whereCondition: any = {};
      let group: any
      if (brandId) {
        const idArray: number[] = brandId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$farmer.brand_id$"] = { [Op.in]: idArray };
        group = ["farmer.brand_id"]
      }
      if (countryId) {
        const idArray: number[] = countryId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$farmer.country_id$"] = { [Op.in]: idArray };
        group = ["farmer.country_id"]
      }
      if (programId) {
        const idArray: number[] = programId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$farmer.program_id$"] = { [Op.in]: idArray };
        group = ["farmer.program_id"]
      }
      farmCount = await Farm.findAll({
        where: whereCondition,
        attributes: [
          [
            Sequelize.fn("SUM", Sequelize.col("farmer.agri_total_area")),
            "totalArea",
          ],
          [
            Sequelize.fn("COUNT", Sequelize.col("farmer.id")),
            "totalFarmer",
          ],
          [
            Sequelize.fn(
              "SUM",
              Sequelize.col("farmer.paddy_total_area")
            ),
            "totalCotton",
          ],
        ],
        include: [
          {
            model: Farmer,
            as: "farmer",
            attributes: []
          }
        ],
        group: group
      });
    }

    //fetch data with pagination
    if (req.query.pagination === "true") {
      const { count, rows } = await Farm.findAndCountAll({
        where: whereCondition,
        include: include,
        order: [['id', 'desc']],
        offset: offset,
        limit: limit,
      });
      return res.sendPaginationSuccess(res, { rows, farmCount: farmCount ? farmCount : [] }, count);
    } else {
      const farmGroup = await Farm.findAll({
        where: whereCondition,
        order: [['id', 'desc']],
        include: include
      });
      return res.sendSuccess(res, farmGroup);
    }
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
};

const fetchFarmer = async (req: Request, res: Response) => {
  try {
    let include = [
      {
        model: Program,
        as: "program",
      },
      {
        model: Brand,
        as: "brand",
      },
      // {
      //   model: FarmGroup,
      //   as: "farmGroup",
      // },
      {
        model: Country,
        as: "country",
      },
      {
        model: Village,
        as: "village",
      },
      {
        model: State,
        as: "state",
      },
      {
        model: District,
        as: "district",
      },
      {
        model: Block,
        as: "block",
      },
    ];

    //fetch data with pagination

    // const farmer= await Farmer.findByPk(req.query.id);
    const farmer = await Farmer.findOne({
      where: { id: req.query.id },
      include: include
    });
    const farm = await Farm.findOne({
      farmer_id: req.query.id,
      order: [
        ["id", 'asc'], // Sort the results based on the 'name' field and the specified order
      ]
    })
    return res.sendSuccess(res, { ...farmer.dataValues, season_id: farm.season_id });
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
};

const updateFarmer = async (req: Request, res: Response) => {
  try {
    let result = await Farmer.findOne({ where: { id: { [Op.ne]: req.body.id }, code: req.body.code } })
    if (result) {
      return res.sendError(res, "FARMER_CODE_ALREADY_EXIST");
    }
    const data = {
      program_id: Number(req.body.programId),
      brand_id: Number(req.body.brandId),
      farmGroup_id: Number(req.body.farmGroupId),
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      code: req.body.code,
      country_id: Number(req.body.countryId),
      state_id: Number(req.body.stateId),
      district_id: Number(req.body.districtId),
      block_id: Number(req.body.blockId),
      village_id: Number(req.body.villageId),
      joining_date: req.body.joiningDate,
      ics_id: req.body.icsId ? req.body.icsId : null,
      tracenet_id: req.body.tracenetId,
      cert_status: req.body.certStatus,
      agri_total_area: req.body.agriTotalArea,
      agri_estimated_yeld: req.body.agriEstimatedYield,
      agri_estimated_prod: req.body.agriEstimatedProd,
      paddy_total_area: req.body.cottonTotalArea,
      total_estimated_paddy: req.body.totalEstimatedCotton
    };
    const farmer = await Farmer.update(data, {
      where: {
        id: req.body.id,
      },
    });
    if(farmer && (farmer[0] === 1)){
      let village = await Village.findOne({ where: { id: Number(req.body.villageId) } })
      let uniqueFilename = `qrcode_${Date.now()}.png`;
      let name = req.body.firstName + " " + req.body.lastName
      let aa = await generateQrCode(`${farmer.id}`,
        name, uniqueFilename, req.body.code, village ? village.village_name : '');
      const farmerPLace = await Farmer.update({ qrUrl: uniqueFilename }, {
          where: {
              id: req.body.id
            }
          });
      }
    if (req.body.farmId) {
      let farmer = await Farm.update({
        program_id: Number(req.body.programId),
        agri_total_area: req.body.agriTotalArea,
        agri_estimated_yeld: req.body.agriEstimatedYield,
        agri_estimated_prod: req.body.agriEstimatedProd,
        paddy_total_area: req.body.cottonTotalArea,
        total_estimated_paddy: req.body.totalEstimatedCotton
      }, { where: { id: req.body.farmId } })
    }

    res.sendSuccess(res, { farmer });
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const deleteFarmer = async (req: Request, res: Response) => {
  try {
    const farmer = await Farm.destroy({
      where: {
        id: req.body.id,
      },
    });
    res.sendSuccess(res, farmer);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const createFarmerFarm = async (req: Request, res: Response) => {
  try {
    let result = await Farm.findOne({ where: { season_id: req.body.seasonId, farmer_id: { [Op.eq]: req.body.farmerId } } })
    if (result) {
      return res.sendError(res, 'Farm is already exist with same season');
    }
    const data = {
      farmer_id: req.body.farmerId,
      program_id: req.body.programId,
      season_id: req.body.seasonId,
      agri_total_area: req.body.agriTotalArea,
      agri_estimated_yeld: req.body.agriEstimatedYield,
      agri_estimated_prod: req.body.agriEstimatedProd,
      paddy_total_area: req.body.cottonTotalArea,
      total_estimated_paddy: req.body.totalEstimatedCotton
    };
    const farm = await Farm.create(data);
    res.sendSuccess(res, { farm });
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
};

const updateFarmerFarm = async (req: Request, res: Response) => {
  try {
    let result = await Farm.findOne({ where: { season_id: req.body.seasonId, farmer_id: { [Op.eq]: req.body.farmerId }, id: { [Op.ne]: Number(req.body.id) } } })
    if (result) {
      return res.sendError(res, 'Farm is already exist with same season');
    }
    const data = {
      farmer_id: req.body.farmerId,
      program_id: req.body.programId,
      season_id: req.body.seasonId,
      agri_total_area: req.body.agriTotalArea,
      agri_estimated_yeld: req.body.agriEstimatedYield,
      agri_estimated_prod: req.body.agriEstimatedProd,
      paddy_total_area: req.body.cottonTotalArea,
      total_estimated_paddy: req.body.totalEstimatedCotton
    };
    const farm = await Farm.update(data, {
      where: {
        id: req.body.id,
      },
    });

    res.sendSuccess(res, { farm });
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
};

//fetching the farm details from farmer
const fetchFarmPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const farmerId = req.query.farmerId;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } }, // Search by Season Name
        { agri_total_area: { [Op.like]: `%${searchTerm}%` } }, // Search by Agri total Area
        { paddy_total_area: { [Op.like]: `%${searchTerm}%` } }, // Search by cotton total area
      ];
    }
    if (farmerId) {
      whereCondition.farmer_id = farmerId;
    }
    let include = [
      {
        model: Farmer,
        as: "farmer",
        include: [
          {
            model:RiceVariety,
            as:"rice_variety"
          }
        ]
      },
      {
        model: Program,
        as: "program",
      },
      {
        model: Season,
        as: "season",
      }
    ];
    //fetch data with pagination
    if (req.query.pagination === "true") {
      const { count, rows } = await Farm.findAndCountAll({
        where: whereCondition,
        include: include,
        order :[
          ['season_id',"desc"]
        ],
        offset: offset,
        limit: limit,
      });
      return res.sendPaginationSuccess(res, rows, count);
    } else {
      const result = await Farm.findAll({
        where: whereCondition,
        include: include,
      });
      return res.sendSuccess(res, result);
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

//fetching the farm details from farmer
const fetchFarm = async (req: Request, res: Response) => {
  try {
    let include = [
      {
        model: Farmer,
        as: "farmer",
        include: [
          {
            model: Program,
            as: "program",
          },
          {
            model: Brand,
            as: "brand",
          },
          {
            model: FarmGroup,
            as: "farmGroup",
          },
          {
            model: Country,
            as: "country",
          },
          {
            model: Village,
            as: "village",
          },
          {
            model: State,
            as: "state",
          },
          {
            model: District,
            as: "district",
          },
          {
            model: Block,
            as: "block",
          },
          {
            model:RiceVariety,
            as:"rice_variety"
          }
        ]
      },
      {
        model: Program,
        as: "program",
      },
      {
        model: Season,
        as: "season",
      }
    ];
    //fetch data with pagination
    const farm = await Farm.findOne({
      where: { id: req.query.id },
      include: include
    });
    return res.sendSuccess(res, farm);

  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

//count the number of Area and yield With Program
const countFarmWithProgram = async (req: Request, res: Response) => {
  try {
    let whereCondition = {}
    if (req.query.brandId) {
      whereCondition = { "$farmer.brand_id$": req.query.brandId }
    }
    const farmer = await Farm.findAll({
      where: whereCondition,
      attributes: [
        [
          Sequelize.fn("SUM", Sequelize.col("farmer.agri_total_area")),
          "totalArea",
        ],
        [
          Sequelize.fn("COUNT", Sequelize.col("farmer.id")),
          "totalFarmer",
        ],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.col("farmer.paddy_total_area")
          ),
          "totalCotton",
        ],
      ],
      include: [
        {
          model: Program,
          as: "program",
          attributes: ["id", "program_name", "program_status"],
        },
        {
          model: Farmer,
          as: "farmer",
          attributes: [],
        }
      ],
      group: ["program.id"],
    });
    res.sendSuccess(res, farmer);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const exportFarmer = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "farmer.xlsx");
  const searchTerm = req.query.search || "";
  const programId: string = req.query.programId as string;
  const brandId: string = req.query.brandId as string;
  const { icsId, farmGroupId, RiceVarietyId, countryId, stateId, villageId, cert, seasonId }: any = req.query;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { '$farmer.firstName$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by first name
        { '$farmer.code$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by code
        { '$farmer.program.program_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by program
        { '$farmer.country.county_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by country
        { '$farmer.village.village_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by village
        { '$farmer.brand.brand_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by brand
        { '$farmer.cert_status$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by cert status
      ];
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$farmer.brand_id$"] = { [Op.in]: idArray };
    }
    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$farmer.program_id$"] = { [Op.in]: idArray };
    }
    if (farmGroupId) {
      const idArray: number[] = farmGroupId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$farmer.farmGroup_id$"] = { [Op.in]: idArray };
    }
    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$farmer.country_id$"] = { [Op.in]: idArray };
    }
    if (stateId) {
      const idArray: number[] = stateId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$farmer.state_id$"] = { [Op.in]: idArray };
    }
    if (villageId) {
      const idArray: number[] = villageId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$farmer.village_id$"] = { [Op.in]: idArray };
    }

    if (cert) {
      const idArray: string[] = cert
        .split(",")
        .map((id: any) => id);
      whereCondition["$farmer.cert_status$"] = { [Op.in]: idArray };
    }

    if (icsId) {
      const idArray: string[] = icsId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$farmer.ics_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: string[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }

    if (RiceVarietyId) {
      const idArray: string[] = RiceVarietyId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.riceVariety_id = { [Op.in]: idArray };
    }

    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    // Set bold font for header row
    worksheet.columns = [
      { header: 'Farmer Name', key: 'farmerName', width: 25 },
      { header: 'Farmer Code', key: 'fatherCode', width: 25 },
      { header: 'Country', key: 'country', width: 10 },
      { header: 'State', key: 'state', width: 10 },
      { header: 'District', key: 'district', width: 10 },
      { header: 'Block', key: 'block', width: 10 },
      { header: 'Village', key: 'village', width: 10 },
      { header: 'Season', key: 'seasons', width: 10 },
      { header: 'FarmGroup', key: 'farmGroup', width: 25 },
      { header: 'Brand', key: 'brand', width: 15 },
      { header: 'Program', key: 'program', width: 10 },
      { header: 'Total Agriculture Area', key: 'agriTotalArea', width: 10 },
      { header: 'Estimated Yield (Kg/Ac)', key: 'agriEstimatedYield', width: 10 },
      { header: 'Total estimated Production', key: 'agriEstimatedProd', width: 10 },
      { header: 'Paddy Total Area', key: 'totalEstimatedPaddy', width: 10 },
      { header: 'Total Estimated Paddy', key: 'paddyTotalArea', width: 10 },
      { header: 'Tracenet Id', key: 'tracenetId', width: 15 },
      { header: 'ICS Name', key: 'iscName', width: 15 },
      { header: 'Certification Status', key: 'cert', width: 15 },
      { header: 'Rice Varietry', key: 'varietyName', width: 15 }
    ];
    let row: any = worksheet.findRow(1);
    row.font = { bold: true };
    const farmer = await Farm.findAll({
      where: whereCondition,
      attributes: [
        [Sequelize.fn("concat", Sequelize.col("firstName"), Sequelize.col("lastName")), "farmerName"],
        [Sequelize.col('"farmer"."code"'), 'fatherCode'],
        [Sequelize.col('"farmer"."country"."county_name"'), 'country'],
        [Sequelize.col('"farmer"."state"."state_name"'), 'state'],
        [Sequelize.col('"farmer"."district"."district_name"'), 'district'],
        [Sequelize.col('"farmer"."block"."block_name"'), 'block'],
        [Sequelize.col('"farmer"."village"."village_name"'), 'village'],
        [Sequelize.col('"season"."name"'), 'seasons'],
        [Sequelize.col('"farmer"."farmGroup"."name"'), 'farmGroup'],
        [Sequelize.col('"farmer"."brand"."brand_name"'), 'brand'],
        [Sequelize.col('"farmer"."program"."program_name"'), 'program'],
        [Sequelize.col('"farms"."agri_total_area"'), 'agriTotalArea'],
        [Sequelize.col('"farms"."agri_estimated_yeld"'), 'agriEstimatedYield'],
        [Sequelize.col('"farms"."agri_estimated_prod"'), 'agriEstimatedProd'],
        [Sequelize.col('"farms"."total_estimated_paddy"'), 'totalEstimatedPaddy'],
        [Sequelize.col('"farms"."paddy_total_area"'), 'paddyTotalArea'],
        [Sequelize.col('"farmer"."tracenet_id"'), 'tracenetId'],
        [Sequelize.col('"farmer"."ics"."ics_name"'), 'iscName'],
        [Sequelize.col('"farmer"."cert_status"'), 'cert'],
        [Sequelize.col('"farmer"."rice_variety"."variety_name"'), 'varietyName'],
      ],
      include: [
        {
          model: Farmer,
          as: "farmer",
          attributes: [],
          include: [
            {
              model: Program,
              as: "program",
              attributes: [],
            },
            {
              model: Brand,
              as: "brand",
              attributes: [],
            },
            {
              model: FarmGroup,
              as: "farmGroup",
              attributes: [],
            },
            {
              model: Country,
              as: "country",
              attributes: [],
            },
            {
              model: Village,
              as: "village",
              attributes: [],
            },
            {
              model: State,
              as: "state",
              attributes: [],
            },
            {
              model: District,
              as: "district",
              attributes: [],
            },
            {
              model: Block,
              as: "block",
              attributes: [],
            },
            {
              model: Block,
              as: "block",
              attributes: [],
            },
            {
              model: ICS,
              as: "ics",
              attributes: [],
            },
            {
              model: RiceVariety,
              as: "rice_variety",
            },
          ]
        },
        {
          model: Season,
          as: "season",
          attributes: [],
        }
      ],
      raw: true
    });
    worksheet.addRows(farmer);
    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "farmer.xlsx",
    });
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

//generate Qr for villages 
const generateQrCodeVillage = async (req: Request, res: Response) => {
  try {
    if (!req.query.villageId) {
      return res.sendError(res, "Need Village id");
    }
    const farmers = await Farmer.findAll({
      where: { village_id: Number(req.query.villageId) },
      include: [{
        model: Village,
        as: "village",
      }]
    });
    if (farmers.length === 0) {
      return res.sendError(res, "NO_FAMRER_FOUND");
    }
    let count = 0;
    for await (const farmer of farmers) {
      if (!farmer.qrUrl) {
        count = count + 1;
        let uniqueFilename = `qrcode_${Date.now()}.png`;
        let name = farmer.firstName + " " + farmer.lastName
        let data = await generateQrCode(`${farmer.id}`,
          name, uniqueFilename, farmer.code, farmer.village.village_name);
        const farmerPLace = await Farmer.update({ qrUrl: uniqueFilename }, {
          where: {
            id: farmer.id
          },
        });
      }
    }
    res.sendSuccess(res, { data: `${count} farmer has been update` });

  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }

}

//Export Qr code for villages  extracting the zip file
const exportQrCode = async (req: Request, res: Response) => {
  try {
    if (!req.query.villageId) {
      return res.sendError(res, "Need Village id");
    }
    const farmers = await Farmer.findAll({
      where: { village_id: Number(req.query.villageId) },
      include: [{
        model: Village,
        as: "village",
      }]
    });
    if (farmers.length === 0) {
      return res.sendError(res, "NO_FAMRER_FOUND");
    }
    let destinationFolder = path.join('./qrCode');
    let sourceFolder = path.join('./upload');
    if (!fs.existsSync(destinationFolder)) {
      fs.mkdirSync(destinationFolder);
    }
    for await (const farmer of farmers) {
      if (farmer.qrUrl) {
        const sourcePath = `${sourceFolder}/${farmer.qrUrl}`;
        const destinationPath = `${destinationFolder}/${farmer.qrUrl}`;
        fs.copyFileSync(sourcePath, destinationPath);
      } else {
        let uniqueFilename = `qrcode_${Date.now()}.png`;
        let name = farmer.firstName + " " + farmer.lastName
        let data = await generateQrCode(`${farmer.id}`,
          name, uniqueFilename, farmer.code, farmer.village.village_name);
        console.log(data);
        const farmerPLace = await Farmer.update({ qrUrl: uniqueFilename }, {
          where: {
            id: farmer.id
          },
        });
        const sourcePath = `${sourceFolder}/${uniqueFilename}`;
        const destinationPath = `${destinationFolder}/${uniqueFilename}`;
        fs.copyFileSync(sourcePath, destinationPath);
      }
    }
    const zipFileName = path.join('./upload', 'qrCode.zip');
    const output = fs.createWriteStream(zipFileName);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Compression level (0 to 9)
    });

    output.on('close', () => {
      console.log(`${zipFileName} created: ${archive.pointer()} total bytes`);
    });

    archive.on('warning', (err: any) => {
      if (err.code === 'ENOENT') {
        console.warn(err);
      } else {
        throw err;
      }
    });

    archive.on('error', (err: any) => {
      throw err;
    });

    archive.pipe(output);
    archive.directory(destinationFolder, false);
    archive.finalize();
    res.sendSuccess(res, {
      link: process.env.BASE_URL + 'qrCode.zip'
    });
    setTimeout(() => {
      fs.rmdir(destinationFolder, { recursive: true }, (err) => {
        console.log(err);
      })
    }, 2000);
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
}

const dashboardGraph = async (req: Request, res: Response) => {
  try {
    let whereCondition: any = {};
    if (req.query.seasonId) {
      whereCondition.season_id = req.query.seasonId
    }

    const result = await Farm.findOne({
      where: whereCondition,
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.literal('DISTINCT farmer_id')), 'total_farmers'],
        [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('farms.paddy_total_area')), 0), 'total_area'],
        [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('farms.total_estimated_paddy')), 0), 'total_expected_yield']
      ]
    });
    const trans = await Transaction.findOne({
      attributes: [
        [sequelize.fn('sum', Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")), 'total_procured']
      ],
      where: {
        ...whereCondition,
        status: 'Sold'
      }
    })

    const graph = await Farm.findAll({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.literal('DISTINCT farmer_id')), 'total_farmers'],
        [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('farms.paddy_total_area')), 0), 'total_area'],
        [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('farms.total_estimated_paddy')), 0), 'total_expected_yield']
      ],
      include: [{
        model: Season,
        as: 'season',
        attributes: ['id', 'name']
      }],
      group: ['season.id']
    });
    res.sendSuccess(res, { ...result.dataValues, ...trans.dataValues, graph: graph });
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
}

const fetchFarmerPecurement = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const { icsId, farmGroupId, countryId, stateId, villageId,brandId, cert, seasonId }: any = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { firstName: { [Op.iLike]: `%${searchTerm}%` } }, // Search by first name
        { lastName: { [Op.iLike]: `%${searchTerm}%` } }, // Search by last name
        { code: { [Op.iLike]: `%${searchTerm}%` } }, // Search by code
      ];
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.country_id = { [Op.in]: idArray };
    }
    if (stateId) {
      const idArray: number[] = stateId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.state_id = { [Op.in]: idArray };
    }
    if (villageId) {
      const idArray: number[] = villageId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.village_id = { [Op.in]: idArray };
    }
    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.brand_id = { [Op.in]: idArray };
    }

    if (req.query.pagination === "true") {
      const { count, rows } = await Farm.findAndCountAll({
        order: [['id', 'desc']],
        include: [
          {
            model: Farmer,
            as: 'farmer',
            where: whereCondition,
            include: [{
              model: Brand,
              as: 'brand',
              attributes: ['id', 'brand_name']
            }],
            attributes: ['id', 'firstName', 'lastName', 'code', 'program_id', 'brand_id'],
          }
        ],
        attributes: ['id', 'farmer_id'],
        offset: offset,
        limit: limit
      });
      const uniqueFarmers = new Set();
      // Filter out duplicates based on farmer id
      const formattedData = rows.reduce((acc:any, item:any) => {
        if (!uniqueFarmers.has(item.farmer.id)) {
          // If the farmer id is not in the set, add it to the set and add the item to the formatted data
          uniqueFarmers.add(item.farmer.id);
          acc.push({
            ...item.farmer.toJSON(),
            brand: item.farmer.brand.toJSON()
          });
        }
        return acc;
      }, []);
      return res.sendPaginationSuccess(res, formattedData, formattedData.length);
    } else {
      const farmGroup = await Farm.findAll({
        order: [['id', 'desc']],
        include: [
          {
            model: Farmer,
            where: whereCondition,
            as: 'brand',
            include: [{
              model: Brand,
              as: 'brand',
              attributes: ['id', 'brand_name']
            }],
            attributes: ['id', 'firstName', 'lastName', 'code', 'program_id', 'brand_id']
          }
        ],
        attributes: ['id', 'farmer_id']
      });

      const formattedData = farmGroup.map((item:any) => ({
        ...item.farmer.toJSON(),
        brand: item.farmer.brand.toJSON()
      }));

      return res.sendSuccess(res, formattedData);
    }


  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
};

export {
  createFarmer,
  fetchFarmerPagination,
  updateFarmer,
  deleteFarmer,
  fetchFarmPagination,
  fetchFarm,
  updateFarmerFarm,
  createFarmerFarm,
  countFarmWithProgram,
  exportFarmer,
  fetchFarmer,
  generateQrCodeVillage,
  exportQrCode,
  dashboardGraph,
  fetchFarmerPecurement
};
