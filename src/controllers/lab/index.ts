import { Request, Response } from "express";
import { Op } from "sequelize";
import Mill from "../../models/mills.model";
import ThirdPartyInspection from "../../models/third-party-inspections.model";
import Program from "../../models/program.model";
import MillProcess from "../../models/mill-process.model";
import Lab from "../../models/lab.model";
import ThirdPartySample from "../../models/third-party-sample.model";
import ThirdPartySampleDetails from "../../models/third-party-sample-details.model";

const fetchRiceSamplePagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { thirdPartyId,brandId, millId, labId, programId }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
      if (searchTerm) {
        whereCondition[Op.or] = [
          { "$mill.name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$lab.name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$thirdparty.name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
          { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
          { sample_collector: { [Op.iLike]: `%${searchTerm}%` } },
          { status: { [Op.iLike]: `%${searchTerm}%` } },
        ];
      }
      if (labId) {
        const idArray: number[] = labId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition.lab_id = { [Op.in]: idArray };
      }

      if (brandId) {
        const idArray: number[] = brandId
          .split(",")
          .map((id: any) => parseInt(id, 10));
          whereCondition["$mill.brand$"] = { [Op.overlap]: idArray };
      }

      if (millId) {
        const idArray: number[] = millId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition.mill_id = { [Op.in]: idArray };
      }

      if (thirdPartyId) {
        const idArray: number[] = thirdPartyId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition.third_party_id = { [Op.in]: idArray };
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

const addRiceSampleResults = async (req: Request, res: Response) => {
    try {
        const millProcess = await ThirdPartySample.findOne({where: { id: req.body.id }});

        if(!millProcess){
            return res.sendError(res, "Rice Sample not found");
        }

        const sampleStatus = await ThirdPartySample.update({
            sample_reports: req.body.sampleReports,
            status: req.body.sampleResult
        }, {
            where: { id: req.body.id }
        });

        const processStatus = await MillProcess.update({
            lab_sample_status: req.body.sampleResult
        }, {
            where: { id: millProcess?.dataValues?.mill_process_id }
        });

        await ThirdPartySampleDetails.update({
            sample_status: req.body.sampleResult
        }, {
            where: { third_party_sample_id: req.body.id }
        });

        return res.sendSuccess(res, { sampleStatus, processStatus });
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
      }
}

const fetchRiceSamplesDetailsPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const whereCondition: any = {};
    const thirdPartySampleId: string = req.query.thirdPartySampleId as string;

    try {
        whereCondition.third_party_sample_id = thirdPartySampleId;
        if (searchTerm) {
            whereCondition[Op.or] = [
                { sample_status: { [Op.iLike]: `%${searchTerm}%` } },
                { sample_name: { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }

        const include = [
            { model: ThirdPartySample, as: 'ricesample' }
        ];

        if (req.query.pagination === "true") {
            const { count, rows } = await ThirdPartySampleDetails.findAndCountAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder]
                ],
                include: include,
                offset: offset,
                limit: limit
            });

            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const rows = await ThirdPartySampleDetails.findAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder]
                ],
                include: include
            });

            return res.sendSuccess(res, rows);
        }
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
      }
}

export {
    fetchRiceSamplePagination,
    addRiceSampleResults,
    // fetchPhysicalTraceabilityGinner,
    fetchRiceSamplesDetailsPagination
}