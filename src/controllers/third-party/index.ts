import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import { encrypt, generateOnlyQrCode } from "../../provider/qrcode";
import * as ExcelJS from "exceljs";
import * as path from "path";
import Season from "../../models/season.model";
import Program from "../../models/program.model";
import Transaction from "../../models/transaction.model";
import ThirdPartySample from "../../models/third-party-sample.model";
import Mill from "../../models/mills.model";
import ThirdPartyInspection from "../../models/third-party-inspections.model";
import MillProcess from "../../models/mill-process.model";
import Lab from "../../models/lab.model";
import Brand from "../../models/brand.model";
import ThirdPartySampleDetails from "../../models/third-party-sample-details.model";


//create Ginner Process
const createRiceSample = async (req: Request, res: Response) => {
    try {
      if (req.body.lotNo) {
        let lot = await ThirdPartySample.findOne({ where: { lot_no: req.body.lotNo } });
        if (lot) {
          return res.sendError(res, "Rice Sample with this Lot No already Exists");
        }
      }

      let mill = await Mill.findOne({ where: { id: req.body.millId } });
      let brandId = mill?.dataValues?.brand[0];
      let shortName = mill?.dataValues?.short_name;

      let brand = await Brand.findOne({
        where: { id: brandId }
      });

      const updatedCount = brand?.dataValues?.count + 1;

  
      const data = {
        third_party_id: req.body.thirdPartyId,
        mill_id: req.body.millId,
        mill_process_id: req.body.millProcessId,
        program_id: req.body.programId,
        lot_no: req.body.lotNo,
        sample_date: req.body.date,
        sample_collector: req.body.sampleCollector,
        no_of_samples: req.body.noOfSamples,
        lab_id: req.body.labId,
        expected_date: req.body.expectedDate,
        code: `DNA${shortName}-${req.body.reelLotNo ? req.body.reelLotNo : req.body.lotNo}-${updatedCount}`,
        status: 'Pending',
      };
      const ricesample = await ThirdPartySample.create(data);

      if (req.body.samples && req.body.samples.length > 0) {
        for await (const obj of req.body.samples) {
          const sampleData = {
            third_party_sample_id: ricesample.id,
            sample_name: obj.sampleName,
            sample_upload: obj.sampleUpload,
            sample_status: 'Pending',
          }
            await ThirdPartySampleDetails.create(sampleData);
          }
        }

      await Brand.update(
        { count: updatedCount },
        { where: { id: brand.id } }
      );
  
      return res.sendSuccess(res, ricesample );
    } catch (error: any) {
      console.error(error);
      return res.sendError(res, error.message);
    }
  };

  const fetchRiceSamplePagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const type = req.query.type || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { thirdPartyId, millId, labId, programId }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
      if (searchTerm) {
        whereCondition[Op.or] = [
          { "$mill.name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$lab.name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
          { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
          { code: { [Op.iLike]: `%${searchTerm}%` } },
          { sample_collector: { [Op.iLike]: `%${searchTerm}%` } },
          { status: { [Op.iLike]: `%${searchTerm}%` } },
        ];
      }

      if (type) {
        whereCondition.status = ['Accepted', 'Rejected'];
      }
    
      if (thirdPartyId) {
        whereCondition.third_party_id = thirdPartyId;
      }
      if (millId) {
        const idArray: number[] = millId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition.mill_id = { [Op.in]: idArray };
      }

      if (labId) {
        const idArray: number[] = labId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition.lab_id = { [Op.in]: idArray };
      }
  
      if (programId) {
        const idArray: number[] = programId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition.program_id = { [Op.in]: idArray };
      }
  
      let include = [
        {
          model: Mill,
          as: "mill",
          attributes: ["id", "name"],
        },
        {
          model: ThirdPartyInspection,
          as: "thirdparty",
          attributes: ["id", "name"],
        },
        {
          model: Program,
          as: "program",
          attributes: ["id", "program_name"],
        },
        {
            model: MillProcess,
            as: "millprocess",
            attributes: ["id", "batch_lot_no", 'reel_lot_no', 'lab_sample_status'],
        },
        {
            model: Lab,
            as: "lab",
            attributes: ["id", "name"],
        },
      ];

      //fetch data with pagination
      if (req.query.pagination === "true") {
        const { count, rows } = await ThirdPartySample.findAndCountAll({
          where: whereCondition,
          include: include,
          offset: offset,
          limit: limit,
          order: [["id", "desc"]],
        });
        return res.sendPaginationSuccess(res, rows, count);
      } else {
        const gin = await ThirdPartySample.findAll({
          where: whereCondition,
          include: include,
          order: [["id", "desc"]],
        });
        return res.sendSuccess(res, gin);
      }
    } catch (error: any) {
      console.error(error);
      return res.sendError(res, error.message);
    }
  };

  const getMillProcessLot = async (req: Request, res: Response) => {
    try {
        let millId = req.query.millId;
        if (!millId) {
        return res.sendError(res, "Need mill Id ");
        }

        let result = await MillProcess.findAll({
        attributes: ["id", "batch_lot_no", "reel_lot_no"],
        include: [
          {
            model: Program,
            as: "program",
          },
        ],
        where: { 
            mill_id: millId,
            [Op.or]: [
                { lab_sample_status: { [Op.ne]: 'Accepted' } },
                { lab_sample_status: null }
            ] },
        });
        return res.sendSuccess(res, result);
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
      }
  };

  const fetchRiceSample = async (req: Request, res: Response) => {
    const whereCondition: any = { id: req.query.id };
    try {
        let include = [
        {
          model: Mill,
          as: "mill",
          attributes: ["id", "name"],
        },
        {
          model: ThirdPartyInspection,
          as: "thirdparty",
          attributes: ["id", "name"],
        },
        {
          model: Program,
          as: "program",
          attributes: ["id", "program_name"],
        },
        {
            model: MillProcess,
            as: "millprocess",
            attributes: ["id", "batch_lot_no", 'reel_lot_no', 'lab_sample_status'],
        },
        {
            model: Lab,
            as: "lab",
            attributes: ["id", "name"],
        },
      ];
      //fetch data with pagination
  
      const rice = await ThirdPartySample.findOne({
        where: whereCondition,
        include: include,
      });
      return res.sendSuccess(res, rice);
    } catch (error: any) {
      console.error(error);
      return res.sendError(res, error.message);
    }
  };

  export {
    createRiceSample,
    fetchRiceSamplePagination,
    getMillProcessLot,
    fetchRiceSample,
    // deleteMandiProcess,
  };