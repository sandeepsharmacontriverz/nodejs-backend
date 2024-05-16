import { Request, Response } from "express";
import { Sequelize, Op, where } from "sequelize";
import { encrypt, generateGinSalesHtml, generateOnlyQrCode } from "../../provider/qrcode";
import MandiSales from "../../models/mandi-sales.model";
import Mandi from "../../models/mandi.model";
import State from "../../models/state.model";
import Season from "../../models/season.model";
import Program from "../../models/program.model";
import Mill from "../../models/mills.model";
import BagSelection from "../../models/bag-selection.model";
import MandiBag from "../../models/mandi-bags.model";
import { upload } from "@controllers/upload";
import * as ExcelJS from "exceljs";
import * as path from "path";
import sequelize from "../../util/dbConn";
import MillProcess from "../../models/mill-process.model";
import RiceType from "../../models/rice-type.model";
import MillRice from "../../models/mill-rice.model";
import MillPaddySelections from "../../models/mill-paddy-seletions.model";
import RiceVariety from "../../models/rice-variety.model";
import MandiProcess from "../../models/mandi-process.model";
import PaddySelection from "../../models/paddy-selection.model";
import Transaction from "../../models/transaction.model";
import MillSales from "../../models/mill-sales.model";
import MillRiceSelections from "../../models/mill-rice-selections.model";
import ThirdPartySample from "../../models/third-party-sample.model";
import ContainerManagementSystem from "../../models/container-management-system.model";
import MillContainers from "../../models/mill-containers.model";


// //fetch Spinner transaction with filters
const fetchCMSDashBoard = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { cmsId, status, countryId,stateId, programId, millId, seasonId }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};

    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by
                { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by
                { "$mill.name$": { [Op.iLike]: `%${searchTerm}%` } }, // Search by
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by program
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type
                { status: { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type
            ];
        }

        if (!cmsId) {
            return res.sendError(res, 'Need CMS Id');
        }

        whereCondition.buyer_id = cmsId;
        if (status === 'Pending') {
            whereCondition.status = { [Op.in]: ['Pending', 'Pending for QR scanning', 'Partially Accepted', 'Partially Rejected'] }
        }

        if (millId) {
            const idArray: number[] = millId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.mill_id = { [Op.in]: idArray };
        }

        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.program_id = { [Op.in]: idArray };
        }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.season_id = { [Op.in]: idArray };
        }

        if (countryId) {
            const idArray: number[] = countryId
              .split(",")
              .map((id: any) => parseInt(id, 10));
            whereCondition["$mill.country_id$"] = { [Op.in]: idArray };
          }

        if (stateId) {
            const idArray: number[] = stateId
              .split(",")
              .map((id: any) => parseInt(id, 10));
            whereCondition["$mill.state_id$"] = { [Op.in]: idArray };
        }

        let include = [
            {
                model: Mill,
                as: "mill",
                attributes: ['id', 'name'],
            },{
                model: Season,
                as: "season",
                attributes: ['id', 'name'],
            },
            {
                model: Program,
                as: "program",
                attributes: ['id', 'program_name'],
            },
            {
                model: ContainerManagementSystem,
                as: "containermanagement",
                attributes: ['id', 'name']
            },
        ];
        //fetch data with pagination
       //fetch data with pagination
       let result = await MillSales.findAll({
        where: whereCondition,
        include: include,
        order: [["id", "ASC"]],
      });

      const bags_list = [];
    for await (const row of result) {
      const container_details = await MillContainers.findOne({
        attributes: [
            [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('mill_containers.container_weight')), 0), 'total_container_weight']
          // Add other attributes here...
        ],
        where: {
          sales_id: row?.dataValues?.id,
          cms_status: null,
        },
        group: ["sales_id"],
      });
      const containers = await MillContainers.findAll({
        where: {
          sales_id: row?.dataValues?.id,
          cms_status: null,
        },
      });

      const ricetype = await RiceType.findAll({
        where: {
        id: {
            [Op.in]: row?.dataValues?.rice_type,
        },
        },
        attributes: ["id", "riceType_name"],
      });

      const riceVariety = await RiceVariety.findAll({
        where: {
        id: {
            [Op.in]: row?.dataValues?.rice_variety,
        },
        },
        attributes: ["id", "variety_name"],
      });
    
      if (containers && containers.length > 0) {
        bags_list.push({
            ...row.dataValues,
            ricetype,
            riceVariety,
            container_details,
            containers 
        })
      }
    }

        return res.sendSuccess(res, bags_list);
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
    }
};

const fetchCMSDashBoardAll = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { cmsId, countryId, stateId, programId, millId, seasonId }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};

    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by
                { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by
                { "$mill.name$": { [Op.iLike]: `%${searchTerm}%` } }, // Search by
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by program
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type
                { status: { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type
            ];
        }

        if (!cmsId) {
            return res.sendError(res, 'Need CMS Id');
        }

        whereCondition.buyer_id = cmsId;
        whereCondition.status = { [Op.in]: ['Sold', 'Partially Accepted', 'Partially Rejected'] }

        if (millId) {
            const idArray: number[] = millId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.mill_id = { [Op.in]: idArray };
        }

        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.program_id = { [Op.in]: idArray };
        }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.season_id = { [Op.in]: idArray };
        }

        if (countryId) {
            const idArray: number[] = countryId
              .split(",")
              .map((id: any) => parseInt(id, 10));
            whereCondition["$mill.country_id$"] = { [Op.in]: idArray };
          }

        if (stateId) {
            const idArray: number[] = stateId
              .split(",")
              .map((id: any) => parseInt(id, 10));
            whereCondition["$mill.state_id$"] = { [Op.in]: idArray };
        }

        let include = [
            {
                model: Mill,
                as: "mill",
                attributes: ["id","name"],
            },{
                model: Season,
                as: "season",
                attributes: ["id","name"],
            },
            {
                model: Program,
                as: "program",
                attributes: ["id","program_name"],
            },
            {
                model: ContainerManagementSystem,
                as: "containermanagement",
                attributes: ["id","name"]
            },
        ];

      const rows = await MillSales.findAll({
        where: whereCondition,
        include: include,
        order: [["id", "DESC"]],
      });

      let data = [];

      for await (const row of rows) {
        const container_details = await MillContainers.findOne({
          attributes: [
            [Sequelize.fn('COUNT', Sequelize.literal('DISTINCT id')), 'no_of_containers'],
              [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('mill_containers.container_weight')), 0), 'total_container_weight']
          ],
          where: {
            sales_id: row?.dataValues?.id,
            cms_status: true,
          },
          group: ["sales_id"],
        });
        const containers = await MillContainers.findAll({
          where: {
            sales_id: row?.dataValues?.id,
            cms_status: true,
          },
        });
  
        const ricetype = await RiceType.findAll({
          where: {
          id: {
              [Op.in]: row?.dataValues?.rice_type,
          },
          },
          attributes: ["id", "riceType_name"],
        });
  
        const riceVariety = await RiceVariety.findAll({
          where: {
          id: {
              [Op.in]: row?.dataValues?.rice_variety,
          },
          },
          attributes: ["id", "variety_name"],
        });
      
        if (containers && containers.length > 0) {
          data.push({
              ...row.dataValues,
              ricetype,
              riceVariety,
              container_details,
              containers 
          })
        }
      }
  
      let result = data.slice(offset, offset + limit);

      return res.sendPaginationSuccess(res, result, data.length);
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
    }
};

const updateTransactionStatus = async (req: Request, res: Response) =>{
    try {
        let update = []
        for await (const obj of req.body.items) {
            for await (const container of obj.containers) {
                let mill = await MillContainers.update({cms_status: obj.status === 'Sold' ? true : false}, { where: { id: container.id } });
            }
            let cons = await MillContainers.findAll({ where: { sales_id: obj.id } });
            if(cons && cons.length > 0){
                let trueCount = 0;
                let falseCount = 0;
                let nullCount = 0;

               for await (const item of cons) {
                if (item.cms_status === true) {
                    trueCount++;
                } else if (item.cms_status === false) {
                    falseCount++;
                } else {
                    nullCount++;
                }
               }

               let status;
               let data:any = {};
                if (trueCount === cons.length) {
                    status = 'Sold';
                    data = {
                        status: 'Sold',
                        accept_date: new Date().toISOString(),
                    };
                } else if (falseCount === cons.length) {
                    status = 'Rejected';
                    data = {
                        status: 'Rejected',
                        accept_date: null,
                    };
                } else if (trueCount > falseCount && nullCount >= 0) {
                    status = 'Partially Accepted';
                    data = {
                        status: 'Partially Accepted',
                        accept_date: new Date().toISOString(),
                    };
                } else if (falseCount >= trueCount && nullCount >= 0 && falseCount > 0) {
                    status = 'Partially Rejected';
                    data = {
                        status: 'Partially Rejected',
                        accept_date: null,
                    };
                } 

                  let result = await MillSales.update(data, { where: { id: obj.id } });
                  update.push(result);  
            }  

            if(obj.status === 'Rejected'){
                const containerUsed = obj.containers.reduce((accumulator: any, currentContainer: any) => {
                    return accumulator + currentContainer.container_weight;
                }, 0);

                let qtyUsed = containerUsed;
                const processes = await MillRiceSelections.findAll({
                        where: { sales_id: obj.id } 
                    })
                if(processes && processes.length > 0){
                    for (let process of processes){
                        let val = await MillProcess.findOne({ where: { id: process.mill_process_id } });
                        if(qtyUsed > 0){
                            let updateProcess = {}
                            if(qtyUsed <= process.qty_used){
                                updateProcess = {
                                    qty_stock: val.qty_stock + qtyUsed
                                }
                                await MillRiceSelections.update(
                                    { qty_used: process.qty_used - qtyUsed },
                                    { where: { id: process.id } }
                                );
                                qtyUsed = 0;
                            }else{
                                updateProcess = {
                                    qty_stock: val.qty_stock + process.qty_used
                                }
                                qtyUsed = qtyUsed - process.qty_used;
                                await MillRiceSelections.destroy({where: { id: process.id }});
                            }
                            await MillProcess.update(updateProcess, { where: { id: process.mill_process_id } });
                        }
                    }
                }

            }
        }
        res.sendSuccess(res, { update });
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.meessage);
      }
}

const getMillsForFilter = async (req: Request, res: Response) => {
    const { cmsId, status, filter, programId, spinnerId }: any = req.query;
    const whereCondition: any = {};
    try {
  
      if (!cmsId) {
        return res.sendError(res, 'Need CMS Id');
    }

    whereCondition.buyer_id = cmsId;
  
      const mills = await MillSales.findAll({
        attributes: ["mill_id", "mill.name"],
        where: whereCondition,
        include: [
          {
            model: Mill,
            as: "mill",
            attributes: ["id", "name"],
          },
        ],
        group: ["mill_id", "mill.id"],
      });

      res.sendSuccess(res, mills);
    } catch (error: any) {
      return res.sendError(res, error.message);
    }
  };

export {
    fetchCMSDashBoard,
    updateTransactionStatus,
    fetchCMSDashBoardAll,
    getMillsForFilter
}