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

// //create Spinner Process
const createMillProcess = async (req: Request, res: Response) => {
    try {
        let program = await Program.findOne({ where: { program_name: { [Op.iLike]: 'Reel' } } });
        let abc;
        if (program &&program.dataValues.id === req.body.programId) {
            abc = await riceId(req.body.millId, req.body.date);
        }

        const data = {
            mill_id: req.body.millId,
            program_id: req.body.programId,
            season_id: req.body.seasonId,
            date: req.body.date,
            order_reference: req.body.orderReference,
            godown_no: req.body.godownNo,
            stack_no: req.body.stackNo,
            total_qty: req.body.totalQty,
            rice_variety: req.body.riceVariety,
            rice_type: req.body.riceType,
            rice_qty_produced: req.body.riceQtyProduced,
            rice_realisation: req.body.riceRealisation,
            net_rice_qty: req.body.netRiceQty,
            husks: req.body.husks,
            no_of_bags: req.body.noOfBag,
            batch_lot_no: req.body.batchLotNo,
            reel_lot_no: abc ? abc : null,
            bag_id: req.body.bagId,
            process_complete: req.body.processComplete,
            other_required: req.body.otherRequired,
            other_process : req.body.otherProcess ,
            other_information: req.body.otherInformation,
            qty_stock: req.body.netRiceQty,
            status: 'Pending',
            lab_sample_status: 'Pending'
        };

        const mill = await MillProcess.create(data);
        let uniqueFilename = `mill_procees_qrcode_${Date.now()}.png`;
        let da = encrypt(`Mill,Process,${mill.id}`);
        let aa = await generateOnlyQrCode(da, uniqueFilename);
        const qr = await MillProcess.update({ qr: uniqueFilename }, {
            where: {
                id: mill.id
            }
        });

        for await (let rice of req.body.rices) {
            let riceData = {
                process_id: mill.id,
                rice_tyoe: rice.RiceType,
                rice_produced: rice.riceProduced,
                rice_qty_stock: rice.riceProduced
            }

            const rices = await MillRice.create(riceData);
            let uniqueFilename = `mill_rice_qrcode_${Date.now()}.png`;
            let da = encrypt(`mill,Rice, ${rices.id}`);
            let aa = await generateOnlyQrCode(da, uniqueFilename);
            const gin = await MillRice.update({ qr: uniqueFilename }, {
                where: {
                    id: rices.id
                }
            });
        }

        for await (let obj of req.body.bags) {
            if(obj){
                 // let update = await MandiSales.update({ qty_stock: obj.totalQty - obj.qtyUsed }, { where: { id: obj.id } });
            let update = await MandiBag.update({ mill_status: true }, { where: { id: obj.id } });
            let create = await MillPaddySelections.create({ qty_used: obj.weight, process_id: mill.id, paddy_id: obj.id })
            }
        }

        res.sendSuccess(res, { mill });
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
    }
}

const updateMillProcess = async (req: Request, res: Response) => {
    try {
        if (!req.body.id) {
            return res.sendError(res, "Need Process Id");
        }
        const data = {
            date: req.body.date,
            rice_variety: req.body.riceVariety,
            rice_type: req.body.riceType,
            rice_qty_produced: req.body.riceQtyProduced,
            rice_realisation: req.body.riceRealisation,
            net_rice_qty: req.body.netriceQty,
            husks: req.body.husks,
            process_complete: req.body.processComplete,
        };
        const spin = await MillProcess.update(data,
            {
                where: { id: req.body.id }
            }
        );
        let rice = MillRice.destroy({ where: { process_id: req.body.id } })
        for await (let rice of req.body.rices) {
            let riceData = {
                process_id: req.body.id,
                rice_type: rice.RiceType,
                rice_produced: rice.riceProduced,
            }
            const rices = await MillRice.create(riceData);
        }

        res.sendSuccess(res, { spin });
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}

const riceId = async (id: any, date: any) => {
    let a = await sequelize.query(
        `SELECT CONCAT('RL-REE', UPPER(LEFT("country"."county_name", 2)), UPPER(LEFT("state"."state_name", 2)), UPPER("processor"."short_name")) as idprefix
         FROM "mills" AS "processor"
         INNER JOIN "states" AS "state" ON "processor"."state_id" = "state"."id"
         INNER JOIN "countries" AS "country" ON "state"."country_id" = "country"."id"
         WHERE "processor"."id" = :prscr_id`,
        {
            replacements: { prscr_id: id }, // Assuming prscr_id is a variable with the desired id
            type: sequelize.QueryTypes.SELECT,
            raw: true
        }
    )
    let mandi = await MillProcess.count({
        include: [
            {
                model: Program,
                as: 'program',
                where: { program_name: { [Op.iLike]: 'Reel' } }
            }
        ],
        where: {
            mill_id: id
        }
    })

    let currentDate = new Date();
    let day = String(currentDate.getUTCDate()).padStart(2, "0");
    let month = String(currentDate.getUTCMonth() + 1).padStart(2, "0"); // UTC months are zero-indexed, so we add 1
    let year = String(currentDate.getUTCFullYear());

    let prcs_date = day + month + year;

    return a[0].idprefix + prcs_date + '/' + (((mandi) ?? 1) + 1)
}

//fetch Spinner Process with filters
const fetchMillProcessPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { millId, seasonId, programId }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { '$mill.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                // { rice_variety: { [Op.iLike]: `%${searchTerm}%` } },
                { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { bag_id: { [Op.iLike]: `%${searchTerm}%` } },
                // { '$riceType.riceType_name$': { [Op.iLike]: `%${searchTerm}%` } },
            ]
        }
        if (millId) {
            whereCondition.mill_id = millId;
        }
        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.season_id = { [Op.in]: idArray };
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
                attributes: ['id', 'name']
            },
            {
                model: Season,
                as: "season",
                attributes: ['id', 'name']
            },
            {
                model: Program,
                as: "program",
                attributes: ['id', 'program_name']
            }
        ];

        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await MillProcess.findAndCountAll({
                where: whereCondition,
                
                include: include,
                order: [
                    [
                        'id', 'desc'
                    ]
                ],
                offset: offset,
                limit: limit,
            });

            let data = [];

            for await (let row of rows) {
                let ricetype = [];
                let ricevariety = [];
                let report = {};

                if (row.dataValues?.rice_type?.length > 0) {
                    ricetype = await RiceType.findAll({
                        attributes: ["id", "riceType_name"],
                        where: { id: { [Op.in]: row.dataValues?.rice_type } }
                    });
                }

                if (row.dataValues?.rice_variety?.length > 0) {
                    ricevariety = await RiceVariety.findAll({
                        attributes: ["id", "variety_name"],
                        where: { id: { [Op.in]: row.dataValues?.rice_variety } }
                    });
                }

                if (row.dataValues?.batch_lot_no) {
                    report = await ThirdPartySample.findOne({
                        attributes: ["id", "sample_reports"],
                        where: { lot_no: row.dataValues?.batch_lot_no }
                    });
                }

                data.push({
                    ...row.dataValues,
                    ricetype,
                    rice_variety:ricevariety,
                    lab_report: report
                })
            }

            return res.sendPaginationSuccess(res, data, count);
        } else {
            const gin = await MillProcess.findAll({
                where: whereCondition,
                include: include,
                order: [
                    [
                        'id', 'desc'
                    ]
                ]
            });

            let data = [];

            for await (let row of gin) {
                let ricetype = [];
                let ricevariety = [];

                if (row.dataValues?.rice_type && row.dataValues?.rice_type.length > 0) {
                    ricetype = await RiceType.findAll({
                        attributes: ["id", "riceType_name"],
                        where: { id: { [Op.in]: row.dataValues?.rice_type } }
                    });
                }

                if (row.dataValues?.rice_variety && row.dataValues?.rice_variety.length > 0) {
                    ricevariety = await RiceVariety.findAll({
                        attributes: ["id", "variety_name"],
                        where: { id: { [Op.in]: row.dataValues?.rice_variety } }
                    });
                }

                data.push({
                    ...row.dataValues,
                    ricetype,
                    rice_variety:ricevariety
                })
            }

            return res.sendSuccess(res, data);
        }
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const fetchMillProcess = async (req: Request, res: Response) => {

    const whereCondition: any = {};
    try {
        whereCondition.id = req.query.id;
        let include = [
            {
                model: Mill,
                as: "mill",
                attributes: ['id', 'name']
            },
            {
                model: Season,
                as: "season",
            },
            // {
            //     model: Dyeing,
            //     as: "dyeing",
            // },
            {
                model: Program,
                as: "program",
            }
        ];
        //fetch data with pagination

        const gin = await MillProcess.findOne({
            where: whereCondition,
            include: include,
            order: [
                [
                    'id', 'desc'
                ]
            ]
        });


        let ricetype = [];

        if (gin.dataValues?.rice_type.length > 0) {
            ricetype = await RiceType.findAll({
                attributes: ["id", "riceType_name"],
                where: { id: { [Op.in]: gin.dataValues?.rice_type } },
            });
        }
        gin.ricetype = ricetype


        return res.sendSuccess(res, gin);

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const deleteMillProcess = async (req: Request, res: Response) => {
    try {
        // let count = await SpinProcessYarnSelection.count({ where: { spin_process_id: req.body.id } });

        // if (count > 0) {
        //     res.sendError(res, 'Unable to delete this process since some lint of this process was sold')
        // } else {
            // Retrieve data
            const millPaddySelections = await MillPaddySelections.findAll({
                attributes: ['id', 'process_id', 'paddy_id', 'qty_used'],
                where: {
                    process_id: req.body.id,
                },
            });

            // Loop through lintSelections
            for await (const paddy of millPaddySelections) {
            //     // await MandiSales.update(
            //     //     { qty_stock: Sequelize.literal(`qty_stock + ${paddy.qty_used}`) },
            //     //     {
            //     //         where: {
            //     //             id: paddy.paddy_id,
            //     //         },
            //     //     }
            //     // );
                await MandiBag.update({ mill_status: false }, { where: { id: paddy.paddy_id } });
            }

            // Delete rows
            const res1 = await MillPaddySelections.destroy({
                where: {
                    process_id: req.body.id
                },
            });

            // const physicalTraceabilityDataSpinner = await PhysicalTraceabilityDataSpinner.findOne({ where: { spin_process_id: req.body.id } });
            // if (physicalTraceabilityDataSpinner) {
            //     await PhysicalTraceabilityDataSpinnerSample.destroy({
            //         where: { physical_traceability_data_spinner_id: physicalTraceabilityDataSpinner.id }
            //     });
            //     await PhysicalTraceabilityDataSpinner.destroy({
            //         where: { spin_process_id: req.body.id }
            //     });
            // }

            const res3 = await MillProcess.destroy({
                where: {
                    id: req.body.id,
                },

            });
            return res.sendSuccess(res, { message: 'Successfully deleted this process' });
        // }
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


const exportMillProcess = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "mill-process.xlsx");

    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { millId, seasonId, programId }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { '$mill.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { yarn_type: { [Op.iLike]: `%${searchTerm}%` } },
                { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { box_id: { [Op.iLike]: `%${searchTerm}%` } },
                { '$riceType.riceType_name$': { [Op.iLike]: `%${searchTerm}%` } },
            ]
        }
        if (millId) {
            whereCondition.mill_id = millId;
        }
        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.season_id = { [Op.in]: idArray };
        }

        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.program_id = { [Op.in]: idArray };
        }
        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:J1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Process';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "S No.", "Date", "Season",
            "Mill Lot No", "REEL Lot No", "Rice Type", "Rice Variety", "Rice Recovery %", "No of Bags",
            "Total Rice weight (Kgs)", 
        ]);
        headerRow.font = { bold: true };
        let include = [
            {
                model: Mill,
                as: "mill",
            },
            {
                model: Season,
                as: "season",
            },
            {
                model: Program,
                as: "program",
            }
        ];
        const gin = await MillProcess.findAll({
            where: whereCondition,
            include: include
        });
        // Append data to worksheet
        for await (const [index, item] of gin.entries()) {
            let ricetype = '';
            let ricevariety = '';

            if (item.rice_type && item.rice_type.length > 0) {
                let rice = await RiceType.findAll({ attributes: ["id", "riceType_name"], where: { id: { [Op.in]: item.rice_type } } });
                ricetype = rice.map((yrn: any) => yrn.dataValues.riceType_name).join(',')
            }

            if (item.rice_variety && item.rice_variety.length > 0) {
                let rice = await RiceVariety.findAll({
                    attributes: ["id", "variety_name"],
                    where: { id: { [Op.in]: item?.rice_variety } }
                });
                ricevariety = rice.map((yrn: any) => yrn.dataValues.variety_name).join(',')
            }


            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                season: item.season ? item.season.name : '',
                lotNo: item.batch_lot_no ? item.batch_lot_no : '',
                reellotNo: item.reel_lot_no ? item.reel_lot_no : '',
                count: ricetype ? ricetype : '',
                rice_variety: ricevariety ? ricevariety : '',
                resa: item.rice_realisation ? item.rice_realisation : '',
                boxes: item.no_of_bags ? item.no_of_bags : '',
                total: item.net_rice_qty
            });
            worksheet.addRow(rowValues);
        }
        // Auto-adjust column widths based on content
        worksheet.columns.forEach((column: any) => {
            let maxCellLength = 0;
            column.eachCell({ includeEmpty: true }, (cell: any) => {
                const cellLength = (cell.value ? cell.value.toString() : '').length;
                maxCellLength = Math.max(maxCellLength, cellLength);
            });
            column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
        });

        // Save the workbook
        await workbook.xlsx.writeFile(excelFilePath);
        res.status(200).send({
            success: true,
            messgage: "File successfully Generated",
            data: process.env.BASE_URL + "mill-process.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};

const chooseRice = async (req: Request, res: Response) => {
    const { millId, programId, seasonId, riceVarietyId, riceTypeId, reelLotNo, batchLotNo }: any = req.query;

    const whereCondition: any = {};
    try {

        if (!millId) {
            return res.sendError(res, 'Mill Id is required')
        }
        if (!programId) {
            return res.sendError(res, 'Program Id is required')
        }

        if (millId) {
            whereCondition.mill_id = millId;
        }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.season_id = { [Op.in]: idArray };
        }

        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.program_id = { [Op.in]: idArray };
        }

        if (batchLotNo) {
            const idArray: any[] = batchLotNo
                .split(",")
                .map((id: any) => id);
            whereCondition.batch_lot_no = { [Op.in]: idArray };
        }

        if (reelLotNo) {
            const idArray: any[] = reelLotNo
                .split(",")
                .map((id: any) => id);
            whereCondition.reel_lot_no = { [Op.in]: idArray };
        }

        if (riceTypeId) {
            const idArray: number[] = riceTypeId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.rice_type = { [Op.overlap]: idArray };
        }

        if (riceVarietyId) {
            const idArray: number[] = riceVarietyId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.rice_variety = { [Op.overlap]: idArray };
        }


        let include = [
            {
                model: Mill,
                as: "mill",
                attributes: ["id", "name"]
            },
            {
                model: Program,
                as: "program",
                attributes: ["id", "program_name"]
            },
        ];
        whereCondition.qty_stock = { [Op.gt]: 0 }
        whereCondition.lab_sample_status = 'Accepted';
        //fetch data with pagination

        const millProcess = await MillProcess.findAll({
            where: whereCondition,
            include: include,
            attributes: ['id', 'rice_variety', 'rice_type', 'net_rice_qty', 'reel_lot_no', 'batch_lot_no', 'qty_stock'],
            order: [
                [
                    'id', 'desc'
                ]
            ]
        });

        let data = [];

        for await (let row of millProcess) {
            let ricevariety = [];
            let ricetype = [];

            if (row.dataValues?.rice_variety && row.dataValues?.rice_variety.length > 0) {
                ricevariety = await RiceVariety.findAll({
                    attributes: ["id", "variety_name"],
                    where: { id: { [Op.in]: row.dataValues?.rice_variety } }
                });
            }

            if (row.dataValues?.rice_type && row.dataValues?.rice_type.length > 0) {
                ricetype = await RiceType.findAll({
                    attributes: ["id", "riceType_name"],
                    where: { id: { [Op.in]: row.dataValues?.rice_type } }
                });
            }

            data.push({
                ...row.dataValues,
                ricevariety,
                ricetype
            })
        }

        return res.sendSuccess(res, data);

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

//create Mill Sale
const createMillSales = async (req: Request, res: Response) => {
    try {

        const data = {
            mill_id: req.body.millId,
            program_id: req.body.programId,
            season_id: req.body.seasonId,
            date: req.body.date,
            order_ref: req.body.orderRef,
            buyer_type: req.body.buyerType,
            buyer_id: req.body.buyerId,
            processor_name: req.body.processorName,
            processor_address: req.body.processorAddress,
            total_qty: req.body.totalQty,
            transaction_via_trader: req.body.transactionViaTrader,
            transaction_agent: req.body.transactionAgent,
            no_of_containers: req.body.noOfContainers,
            batch_lot_no: req.body.batchLotNo,
            reel_lot_no: req.body.reelLotNno ? req.body.reelLotNno : null,
            rice_type: req.body.riceType,
            rice_variety: req.body.riceVariety,
            container_name: req.body.containerName,
            container_no: req.body.containerNo,
            invoice_no: req.body.invoiceNo,
            bill_of_ladding: req.body.billOfLadding,
            transporter_name: req.body.transporterName,
            vehicle_no: req.body.vehicleNo,
            quality_doc: req.body.qualityDoc,
            tc_files: req.body.tcFiles,
            contract_file: req.body.contractFile,
            invoice_file: req.body.invoiceFile,
            delivery_notes: req.body.deliveryNotes,
            qty_stock: req.body.totalQty,
            price: req.body.price,
            dispatch_date: req.body.dispatchDate,
            fumigation_date: req.body.fumigationDate,
            fumigation_chemicals_details: req.body.fumigationChemicalsDetails,
            fumigation_total_qty: req.body.fumigationTotalQty,
            fumigation_total_chemical_used: req.body.fumigationTotalChemicalUsed,
            fumigation_chemical_invoice:req.body.fumigationChemicalInvoice,
            fumigation_time: req.body.fumigationTime,
            status: "To be Submitted",
        };

        const millSales = await MillSales.create(data);
        let uniqueFilename = `mill_sales_qrcode_${Date.now()}.png`;
        let da = encrypt(`Mill,Sale,${millSales.id}`);
        let aa = await generateOnlyQrCode(da, uniqueFilename);
        const gin = await MillSales.update({ qr: uniqueFilename }, {
            where: {
                id: millSales.id
            }
        });

        if (req.body.containers && req.body.containers.length > 0) {
            for await (let yarn of req.body.containers) {
                let containerData = {
                    sales_id: millSales.id,
                    container_name: yarn.containerName,
                    container_no: yarn.containerNo,
                    container_weight: yarn.containerWeight
                }

                const containers = await MillContainers.create(containerData);
                let uniqueFilename = `mill_container_qrcode_${Date.now()}.png`;
                let da = encrypt(`Mill,Container, ${containers.id}`);
                let aa = await generateOnlyQrCode(da, uniqueFilename);
                const gin = await MillContainers.update({ qr: uniqueFilename }, {
                    where: {
                        id: containers.id
                    }
                });
            }
        }

        if (req.body.chooseRice && req.body.chooseRice.length > 0) {
            for await (let obj of req.body.chooseRice) {
              let val = await MillProcess.findOne({ where: { id: obj.id } });
              if (val) {
                let update = await MillProcess.update(
                  { qty_stock: val?.dataValues?.qty_stock - obj.qtyUsed },
                  { where: { id: obj.id } }
                );
                await MillRiceSelections.create({
                  mill_process_id: obj.id,
                  sales_id: millSales.id,
                  qty_used: obj.qtyUsed,
                });
              }
            }
          }

        // if (spinSales) {
        //     await send_spin_mail(spinSales.id);
        // }

        res.sendSuccess(res,  millSales );
    } catch (error: any) {
        console.error(error)
        return res.sendError(res, error.message);
    }
}


// update Spinner Sale
const updateMillSales = async (req: Request, res: Response) => {
    try {
        if (!req.body.id) {
            return res.sendError(res, "Need Sales Id");
        }
        const data = {
            status: "Pending for QR scanning",
            date: req.body.date,
            invoice_no: req.body.invoiceNo,
            vehicle_no: req.body.vehicleNo,
            invoice_file: req.body.invoiceFile,
            analysis_report: req.body.analysisReport,
            contract_basis_employee: req.body.contractBasisEmployee,
            daily_packing_report: req.body.dailyPackingReport,
            dryer_output: req.body.dryerOutput,
            employee_on_payroll: req.body.employeeOnPayroll,
            entry_quality_analysis: req.body.entryQualityAnalysis,
            grn: req.body.grn,
            hodi_katai: req.body.hodiKatai,
            in_process: req.body.inProcess,
            invoice_for_po: req.body.invoiceForPo,
            labour_bill: req.body.labourBill,
            lease_premises_expenses: req.body.leasePremisesExpenses,
            plant_analysis_report: req.body.plantAnalysisReport,
            production_schedule: req.body.productionSchedule,
            purchase_order: req.body.purchaseOrder,
            salaried_employee_expenses_frl: req.body.salariedEmployeeExpensesFrl,
            truck_inward_details: req.body.truckInwardDetails,
        };

        const mandiSales = await MillSales.update(data, { where: { id: req.body.id } });
        res.sendSuccess(res, { mandiSales });
    } catch (error: any) {
        console.error(error)
        return res.sendError(res, error.message);
    }
}

const fetchMillSale = async (req: Request, res: Response) => {

    const whereCondition: any = {};
    try {
        whereCondition.id = req.query.id;
        let include = [
            {
                model: Mill,
                as: "mill",
                attributes: ['id', 'name']
            },
            {
                model: Season,
                as: "season",
                attributes: ['id', 'name']
            },
            {
                model: Program,
                as: "program",
                attributes: ['id', 'program_name']
            },
            // {
            //     model: YarnCount,
            //     as: 'yarncount',
            //     attributes: ['id', 'yarnCount_name']
            // },
            {
                model: ContainerManagementSystem,
                as: "containermanagement",
                attributes: ['id', 'name']
            },
            // {
            //     model: Knitter,
            //     as: "knitter",
            //     attributes: ['id', 'name']
            // }
        ];
        //fetch data with pagination

        const gin = await MillSales.findOne({
            where: whereCondition,
            include: include,
            order: [
                [
                    'id', 'desc'
                ]
            ]
        });

        let riceType = [];
        let riceVariety = [];

        if (gin.dataValues?.rice_type.length > 0) {
            riceType = await RiceType.findAll({
            attributes: ["id", "riceType_name"],
            where: { id: { [Op.in]: gin.dataValues?.rice_type } },
          });
        }

        if (gin.dataValues?.rice_variety.length > 0) {
            riceVariety = await RiceVariety.findAll({
            attributes: ["id", "variety_name"],
            where: { id: { [Op.in]: gin.dataValues?.rice_variety } },
          });
        }
        let data = { ...gin.dataValues, riceType, riceVariety };

        return res.sendSuccess(res, data);

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

// //fetch Spinner Sales with filters
const fetchMillSalesPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { millId, seasonId, programId, riceType, type }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    const riceTypeArray = riceType?.split(',').map((item:any) => item.trim()); 
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { order_ref: { [Op.iLike]: `%${searchTerm}%` } },
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                // { yarn_type: { [Op.iLike]: `%${searchTerm}%` } },
                { vehicle_no: { [Op.iLike]: `%${searchTerm}%` } },
                { '$containermanagement.name$': { [Op.iLike]: `%${searchTerm}%` } },
                // { '$knitter.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                // { '$riceType.riceType_name$': { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }

        if (millId) {
            whereCondition.mill_id = millId;
        }
        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.season_id = { [Op.in]: idArray };
        }

        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.program_id = { [Op.in]: idArray };
        }
        
        if (riceType) {
            const idArray: number[] = riceTypeArray
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.rice_type = { [Op.overlap]: idArray };
        }


        let include = [
            {
                model: Mill,
                as: "mill",
                attributes: ['id', 'name']
            },
            {
                model: Season,
                as: "season",
                attributes: ['id', 'name']
            },
            {
                model: Program,
                as: "program",
                attributes: ['id', 'program_name']
            },
            {
                model: ContainerManagementSystem,
                as: "containermanagement",
                attributes: ['id', 'name']
            },
        ];

        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await MillSales.findAndCountAll({
                where: whereCondition,
                include: include,
                order: [
                    [
                        'id', 'desc'
                    ]
                ],
                offset: offset,
                limit: limit,
            });


            let data = [];

            for await (let row of rows) {
                const ricetype = await RiceType.findAll({
                    where: {
                    id: {
                        [Op.in]: row.dataValues.rice_type,
                    },
                    },
                    attributes: ["id", "riceType_name"],
                });
                const riceVariety = await RiceVariety.findAll({
                    where: {
                    id: {
                        [Op.in]: row.dataValues.rice_variety,
                    },
                    },
                    attributes: ["id", "variety_name"],
                });

                const containers = await MillContainers.findAll({
                    where: {
                    sales_id: row.dataValues.id,
                    },
                });

                data.push({
                    ...row.dataValues,
                    ricetype,
                    riceVariety,
                    containers
                });
            }
    
            return res.sendPaginationSuccess(res, data, count);
        } else {
            const mill = await MillSales.findAll({
                where: whereCondition,
                include: include,
                order: [
                    [
                        'id', 'desc'
                    ]
                ],
            });
            let data = [];

            for await (let item of mill) {
                let riceType : any
                let riceVariety: any
          
                if (item.rice_type && item.rice_type.length > 0) {
                    riceType = await RiceType.findAll({
                    where: { id: { [Op.in]: item.rice_type } },
                  });
                }
    
                if (item.rice_variety && item.rice_variety.length > 0) {
                    riceVariety = await RiceVariety.findAll({
                    where: { id: { [Op.in]: item.rice_variety } },
                  });
                }

                const containers = await MillContainers.findAll({
                    where: {
                    sales_id: item.dataValues.id,
                    },
                });


                data.push({
                  ...item.dataValues,
                  riceType,
                  riceVariety,
                  containers
                });
              }
            return res.sendSuccess(res, data);
        }
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const exportMillSale = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "mill-sale.xlsx");

    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { millId, seasonId, programId, riceType, type }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    const riceTypeArray = riceType?.split(',').map((item:any) => item.trim()); 
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { order_ref: { [Op.iLike]: `%${searchTerm}%` } },
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                // { yarn_type: { [Op.iLike]: `%${searchTerm}%` } },
                { vehicle_no: { [Op.iLike]: `%${searchTerm}%` } },
                { '$containermanagement.name$': { [Op.iLike]: `%${searchTerm}%` } },
                // { '$knitter.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                // { '$riceType.riceType_name$': { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }

        if (millId) {
            whereCondition.mill_id = millId;
        }
        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.season_id = { [Op.in]: idArray };
        }

        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.program_id = { [Op.in]: idArray };
        }
        
        if (riceType) {
            whereCondition.rice_type = { [Op.contains]: riceTypeArray }; 
        }

        if (type) {
            if (type === 'containermanagement') {
                whereCondition.buyer_id = { [Op.not]: null }
            }
        }
        
        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:R1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Sale';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Season", "Program", "Mill", 
            "Order Reference", "Buyer Name", "Processor Name", "Processor Address", "No of Containers", "Lot No",
            "Reel Lot No", "Rice Type", "Rice Variety", "Container Name", "Container No", "Invoice No", "Bill Of Ladding", "Vehicle No",
            "Transporter Name","Transcation via trader", "Agent Details" , "Quality Stock", "Price","Dispatch Date"
        ]);
        headerRow.font = { bold: true };
        let include = [
            {
                model: Mill,
                as: "mill",
                attributes: ['id', 'name']
            },
            {
                model: Season,
                as: "season",
                attributes: ['id', 'name']
            },
            {
                model: Program,
                as: "program",
                attributes: ['id', 'program_name']
            },
            {
                model: ContainerManagementSystem,
                as: "containermanagement",
                attributes: ['id', 'name']
            },
        ];
        const gin = await MillSales.findAll({
            where: whereCondition,
            include: include,
            order: [
                [
                    'id', 'desc'
                ]
            ]
        });
        // Append data to worksheet
        for await (const [index, item] of gin.entries()) {
            let riceType : any
            let riceVariety: any
      
            if (item.rice_type && item.rice_type.length > 0) {
                riceType = await RiceType.findAll({
                where: { id: { [Op.in]: item.rice_type } },
              });
            }

            if (item.rice_variety && item.rice_variety.length > 0) {
                riceVariety = await RiceVariety.findAll({
                where: { id: { [Op.in]: item.rice_variety } },
              });
            }

            const riceTypeArray =riceType?.map((item:any) => item.riceType_name);
            const riceVarietyArray =riceVariety?.map((item:any) => item.variety_name);

            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                season: item.season ? item.season.name : '',
                program: item.program ? item.program.program_name : '',
                mill: item.mill.name,

                order_ref: item.order_ref,
                buyer_name: item.containermanagement.name,
                processor_name: item.processor_name,
                processor_address: item.processor_address,
                no_of_containers: item.no_of_containers,
                batch_lot_no: item.batch_lot_no,
                reel_lot_no: item.reel_lot_no ? item.reel_lot_no : null,
                rice_type: riceTypeArray ? riceTypeArray?.join(',') : "" ,
                rice_variety: riceVarietyArray ? riceVarietyArray?.join(',') : "" ,
                container_name: item.container_name?.join(','),
                container_no: item.container_no?.join(','),
                invoice_no: item.invoice_no,
                bill_of_ladding: item.bill_of_ladding,
                vehicle_no: item.vehicle_no,
                transporter_name: item.transporter_name,
                transaction_via_trader: item.transaction_via_trader ? 'Yes' : 'No',
                agent: item.transaction_agent ? item.transaction_agent : '',
                // quality_doc: item.qualityDoc,
                // tc_files: item.tcFiles,
                // contract_file: item.contractFile,
                // invoice_file: item.invoiceFile,
                // delivery_notes: item.deliveryNotes,
                qty_stock: item.total_qty,
                price: item.price,
                dispatch_date: item.dispatch_date,

                
            });
            worksheet.addRow(rowValues);
        }
        // Auto-adjust column widths based on content
        worksheet.columns.forEach((column: any) => {
            let maxCellLength = 0;
            column.eachCell({ includeEmpty: true }, (cell: any) => {
                const cellLength = (cell.value ? cell.value.toString() : '').length;
                maxCellLength = Math.max(maxCellLength, cellLength);
            });
            column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
        });

        // Save the workbook
        await workbook.xlsx.writeFile(excelFilePath);
        res.status(200).send({
            success: true,
            messgage: "File successfully Generated",
            data: process.env.BASE_URL + "mill-sale.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};

// const deleteSpinnerSales = async (req: Request, res: Response) => {
//     try {
//         if (!req.body.id) {
//             return res.sendError(res, 'Need Sales Id');
//         }
//         let yarn_selections = await SpinProcessYarnSelection.findAll({
//             attributes: ['id', 'yarn_id', 'spin_process_id', 'sales_id', 'no_of_box', 'qty_used'],
//             where: {
//                 sales_id: req.body.id
//             }
//         })
//         yarn_selections.forEach(async (yarn: any) => {
//             SpinProcess.update(
//                 {
//                     qty_stock: sequelize.literal(`qty_stock + ${yarn.qty_used}`),
//                     tot_box_user: sequelize.literal(`tot_box_user - ${yarn.no_of_box}`)
//                 },
//                 {
//                     where: {
//                         id: yarn.spin_process_id
//                     }
//                 }
//             );
//             const spinYarnData = await SpinYarn.findOne({ where: { id: yarn.yarn_id } });
//             if (spinYarnData) {
//                 await SpinYarn.update(
//                     { sold_status: false, yarn_qty_stock: +spinYarnData.yarn_qty_stock + +yarn.qty_used },
//                     { where: { id: yarn.yarn_id } }
//                 );
//             }
//             // await SpinYarn.update({ sold_status: false }, { where: { id: yarn.yarn_id } });
//         });

//         SpinSales.destroy({
//             where: {
//                 id: req.body.id
//             }
//         });

//         SpinProcessYarnSelection.destroy({
//             where: {
//                 sales_id: req.body.id
//             }
//         });
//         return res.sendSuccess(res, { message: 'Successfully deleted this process' });

//     } catch (error: any) {
//         return res.sendError(res, error.message);
//     }
// }

// //fetch Spinner transaction with filters
const fetchMillSalesDashBoard = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { mandiId, status, filter, programId, millId, seasonId }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    const bagWhereCandition: any = {};
    try {
        if (searchTerm) {
            bagWhereCandition[Op.or] = [
                { "$sales.lot_no$": { [Op.iLike]: `%${searchTerm}%` } }, // Search by
                { "$sales.invoice_no$": { [Op.iLike]: `%${searchTerm}%` } }, // Search by
                { "$sales.mandi.name$": { [Op.iLike]: `%${searchTerm}%` } },
                { '$sales.program.program_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by program
                { '$sales.season.name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type
            ];
        }

        if (status === 'Pending') {
            whereCondition.buyer = millId
            whereCondition.status = { [Op.in]: ['Pending','Rejected','Partially Accepted','Partially Rejected' , 'Pending for QR scanning'] }
            bagWhereCandition.bag_status = null
        }
        if (status === 'Sold') {
            whereCondition.buyer = millId
            // whereCondition.status = 'Sold';
            bagWhereCandition.bag_status = true
        }

        if (mandiId) {
            const idArray: number[] = mandiId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.mandi_id = { [Op.in]: idArray };
        }
        if (filter === 'Quantity') {
            whereCondition.qty_stock = { [Op.gt]: 0 }
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

        let include = [
            {
                model: MandiSales,
                as: "sales",
                where: whereCondition,
                include: [
                    {
                        model: Mandi,
                        as: "mandi",
                        include: [{
                            model: State,
                            as: "state"
                        }]
                    },
                    {
                        model: Season,
                        as: "season",
                    },
                    {
                        model: Program,
                        as: "program",
                    },
                    {
                        model: Mill,
                        as: "buyerdata",
                        attributes: ['id', 'name', 'address'],
                    },
                ],
            },
            {
                model: MandiBag,
                as: "bag",
            },
        ];
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const  rows = await BagSelection.findAll({
                where: bagWhereCandition,
                include: include,
                order: [
                    [
                        'id', 'asc'
                    ]
                ],
            });

            const aggregatedData = rows.reduce((acc: any, row: any) => {
                const { sales, bag, id } = row;
                const salesId = sales.id;

                if (!acc[salesId]) {
                    acc[salesId] = { ...sales.toJSON(), bags: [] };
                }
        
                if (bag) {
                    const bagWithId = { ...bag.toJSON(), bag_sele_id: id }; 
                    acc[salesId].bags.push(bagWithId); 
                }
            
                return acc;
            }, {});

            // Convert object back to array
            const aggregatedRows = Object.values(aggregatedData);
            const paginatedData = aggregatedRows.slice(offset, offset + limit);

            return res.sendPaginationSuccess(res, paginatedData, aggregatedRows.length);
        } else {
            const mandi = await BagSelection.findAll({
                where: bagWhereCandition,
                include: include,
                order: [
                    [
                        'id', 'asc'
                    ]
                ]
            });
            const aggregatedData = mandi.reduce((acc: any, row: any) => {
                const { sales, bag, id } = row;
                const salesId = sales.id;
        
                if (!acc[salesId]) {
                    acc[salesId] = { ...sales.toJSON(), bags: [] };
                }
            
                if (bag) {
                    const bagWithId = { ...bag.toJSON(), bag_sele_id: id };
                    acc[salesId].bags.push(bagWithId);
                }
            
                return acc;
            }, {});

            // Convert object back to array
            const aggregatedRows = Object.values(aggregatedData);

            return res.sendPaginationSuccess(res, aggregatedRows, aggregatedRows.length);
        }
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

// //update spinner transactions to accept and reject
const updateStatusSales = async (req: Request, res: Response) => {
    try {
        if(req.body?.uploadSample){
            const result = await MandiSales.update({upload_sample: req.body.uploadSample}, { where: { id: req.body.id } });
            res.sendSuccess(res, result);
        }else{
            let update = []
            for (const obj of req.body.items) {
                let result;
                let soldCount = 0;
                let rejectedCount = 0;
                let nullCount = 0;

                let data:any = {
                    accept_date: obj.status === 'Sold' ? new Date().toISOString() : null
                };
                for (const bag of obj.bags) {
                    if(obj.status !== 'Sold'){
                        let mandi = await MandiBag.update({sold_status: false}, { where: { id: bag.id } });
                    }
                    let mandi = await BagSelection.update({bag_status: obj.status === 'Sold' ? true : false}, { where: { id: bag.bag_sele_id } });
                }
                let bags = await BagSelection.findAll({ where: { sales_id: obj.id} });
                
                for (const bag of bags) {
                    if (bag.bag_status === true) {
                        soldCount++;
                    } else if (bag.bag_status === false) {
                        rejectedCount++;
                    }
                }

                // Update status based on counts
                let status;
                if (soldCount === bags.length) {
                    status = 'Sold';
                } else if (rejectedCount === bags.length) {
                    status = 'Rejected';
                } else if (soldCount > rejectedCount) {
                    status = 'Partially Accepted';
                } else {
                    status = 'Partially Rejected';
                }

                data = {...data,status: status}

                const mandiSale = await MandiSales.findOne({ where: { id: obj.id } });
                if (mandiSale) {
                    // Increment qty_stock by obj.qtyStock
                    if(obj.status === 'Sold'){
                        data.qty_stock = Number(mandiSale.qty_stock) + Number(obj.qtyStock);
                    }
                    await MandiSales.update(data, { where: { id: obj.id } });
                }
                update.push(result);
            }
            res.sendSuccess(res, { update });
        }
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}

// //count the number of bales and total quantity stock With Program
// const countCottonBaleWithProgram = async (req: Request, res: Response) => {
//     try {
//         let whereCondition: any = {}
//         whereCondition.buyer = req.query.spinnerId;
//         whereCondition.status = 'Sold';
//         const gin = await GinSales.findAll({
//             where: whereCondition,
//             attributes: [
//                 [
//                     Sequelize.fn("SUM", Sequelize.col("no_of_bales")),
//                     "totalBales",
//                 ],
//                 [
//                     Sequelize.fn(
//                         "SUM",
//                         Sequelize.col("qty_stock")
//                     ),
//                     "totalQuantity",
//                 ],
//             ],
//             include: [
//                 {
//                     model: Program,
//                     as: "program",
//                     attributes: ["id", "program_name", "program_status"],
//                 }
//             ],
//             group: ["program.id"],
//         });
//         const spinSale = await SpinSales.findAll({
//             where: {
//                 spinner_id: req.query.spinnerId,
//             },
//             attributes: [
//                 [
//                     Sequelize.fn("SUM", Sequelize.col("total_qty")),
//                     "totalQuantity",
//                 ],
//                 [
//                     Sequelize.fn(
//                         "SUM",
//                         Sequelize.col("qty_stock")
//                     ),
//                     "totalQuantityStock",
//                 ],
//             ],
//             include: [
//                 {
//                     model: Program,
//                     as: "program",
//                     attributes: ["id", "program_name", "program_status"],
//                 }
//             ],
//             group: ["program.id"],
//         });
//         res.sendSuccess(res, { gin, spinSale });
//     } catch (error: any) {
//         return res.sendError(res, error.message);
//     }
// };

const exportMillTransaction = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "Mill_transaction_list.xlsx");
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { mandiId, filter, programId, millId }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { lot_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by program
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type
            ];
        }
        whereCondition.buyer = millId
        // whereCondition.status = 'Sold';
        whereCondition.status = { [Op.in]: ['Partially Accepted','Partially Rejected' , 'Sold'] }
        if (mandiId) {
            const idArray: number[] = mandiId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.mandi_id = { [Op.in]: idArray };
        }
        if (filter === 'Quantity') {
            whereCondition.qty_stock = { [Op.gt]: 0 }
        }
        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.program_id = { [Op.in]: idArray };
        }
        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Season", "Mandi Name",
            "Invoice No", "Bag Lot", "No of Bags",
            "REEL Lot No", "Quantity", "Program",
            "Vehicle No"
        ]);
        headerRow.font = { bold: true };
        let include = [
            {
                model: Mandi,
                as: "mandi",
            },
            {
                model: Season,
                as: "season",
            },
            {
                model: Program,
                as: "program",
            }
        ];
        const gin = await MandiSales.findAll({
            where: whereCondition,
            include: include,
        });

        // Append data to worksheet
        for await (const [index, item] of gin.entries()) {
            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                season: item.season ? item.season.name : '',
                mandi: item.mandi ? item.mandi.name : '',
                invoice: item.invoice_no ? item.invoice_no : '',
                lot_no: item.lot_no ? item.lot_no : '',
                no_of_bags: item.no_of_bags ? item.no_of_bags : '',
                reel_lot_no: item.reel_lot_no ? item.reel_lot_no : '',
                quantity: item.qty_stock ? item.qty_stock : '',
                program: item.program ? item.program.program_name : '',
                vehicle: item.vehicle_no ? item.vehicle_no : ''
            });
            worksheet.addRow(rowValues);
        }
        // Auto-adjust column widths based on content
        worksheet.columns.forEach((column: any) => {
            let maxCellLength = 0;
            column.eachCell({ includeEmpty: true }, (cell: any) => {
                const cellLength = (cell.value ? cell.value.toString() : '').length;
                maxCellLength = Math.max(maxCellLength, cellLength);
            });
            column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
        });

        // Save the workbook
        await workbook.xlsx.writeFile(excelFilePath);
        res.status(200).send({
            success: true,
            messgage: "File successfully Generated",
            data: process.env.BASE_URL + "Mill_transaction_list.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};

const getProgram = async (req: Request, res: Response) => {
    try {
        if (!req.query.millId) {
            return res.sendError(res, 'Need Mill Id');
        }

        let millId = req.query.millId;
        let mill = await Mill.findOne({ where: { id: millId } });
        if (!mill?.program_id) {
            return res.sendSuccess(res, []);
        }
        let data = await Program.findAll({
            where: {
                id: { [Op.in]: mill.program_id }
            }
        });
        res.sendSuccess(res, data);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

// const getSalesInvoice = async (req: Request, res: Response) => {
//     try {
//         if (!req.query.salesId) {
//             return res.sendError(res, 'Need Sales Id');
//         }

//         let salesId = req.query.salesId;
//         let sales = await GinSales.findOne({
//             where: { id: salesId }, include: [{
//                 model: Ginner,
//                 as: "ginner",
//                 include: [{
//                     model: State,
//                     as: "state"
//                 }]
//             },
//             {
//                 model: Season,
//                 as: "season",
//             },
//             {
//                 model: Program,
//                 as: "program",
//             },
//             {
//                 model: Spinner,
//                 as: "buyerdata",
//                 attributes: ['id', 'name', 'address'],
//             }]
//         });
//         let data = await generateGinSalesHtml(sales.dataValues)
//         return res.sendSuccess(res, { file: process.env.BASE_URL + 'sales_invoice.pdf' });
//     } catch (error: any) {
//         return res.sendError(res, error.message);
//     }
// };

const getRiceVariety = async (req: Request, res: Response) => {
    try {
        if (!req.query.millId) {
            return res.sendError(res, 'Need Mill Id');
        }

        let millId = req.query.millId;
        let mill = await Mill.findOne({ where: { id: millId } });
        if (!mill?.rice_variety) {
            return res.sendSuccess(res, []);
        }
        let idArray: number[] = mill.rice_variety
            .split(",")
            .map((id: any) => parseInt(id, 10));

        if (idArray.length > 0) {
            let data = await RiceVariety.findAll({
                where: {
                    id: { [Op.in]: idArray }
                }
            });
            res.sendSuccess(res, data);
        } else {
            res.sendSuccess(res, []);
        }

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};
const getRiceType = async (req: Request, res: Response) => {
    try {
        if (!req.query.millId) {
            return res.sendError(res, 'Need Mill Id');
        }

        let millId = req.query.millId;
        let mill = await Mill.findOne({ where: { id: millId } });
        if (!mill?.rice_type) {
            return res.sendSuccess(res, []);
        }
        let idArray: number[] = mill.rice_type
            .split(",")
            .map((id: any) => parseInt(id, 10));

        if (idArray.length > 0) {
            let data = await RiceType.findAll({
                where: {
                    id: { [Op.in]: idArray }
                }
            });
            res.sendSuccess(res, data);
        } else {
            res.sendSuccess(res, []);
        }

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const getCMS= async (req: Request, res: Response) => {
    let millId = req.query.millId;
    if (!millId) {
        return res.sendError(res, 'Need mill Id ');
    }
    let ress = await Mill.findOne({ where: { id: millId } });
    if (!ress) {
        return res.sendError(res, 'No Mill Found ');
    }
    let result: any = await ContainerManagementSystem.findAll({
            attributes: ['id', 'name'],
            where: { brand: { [Op.overlap]: ress?.dataValues?.brand } }
        });

    res.sendSuccess(res, result);
}

const getMillDashboard = async (req: Request, res: Response) => {
    let millId = req.query.millId;
    if (!millId) {
        return res.sendError(res, 'Need Mill Id ');
    }
    let whereCondition = {
        upload_sample:{[Op.not]:null},
        buyer: millId
    }
    const ginner = await MandiSales.findAll({
        include: [{
            model: Mandi,
            as: "mandi",
            attributes: []
        }],
        attributes: [
            [Sequelize.literal("mandi.id"), "id"],
            [Sequelize.literal('"mandi"."name"'), "name"],
        ],
        where: whereCondition,
        group: ['mandi_id', 'mandi.id']
    })
    res.sendSuccess(res, ginner);
}

const chooseLint = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const { mandiId, millId, programId, reelLotNo, invoiceNo, seasonId }: any = req.query;
    const whereCondition: any = {};
    try {
        if (!millId) {
            return res.sendError(res, 'Mill Id is required')
        }
        if (!programId) {
            return res.sendError(res, 'Program Id is required')
        }
        if (millId) {
            whereCondition.buyer = millId;
        }
        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.season_id = { [Op.in]: idArray };
        }

        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.program_id = { [Op.in]: idArray };
        }

        if (mandiId) {
            const idArray: number[] = mandiId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.mandi_id = { [Op.in]: idArray };
        }

        if (reelLotNo) {
            const idArray: any[] = reelLotNo
                .split(",")
                .map((id: any) => id);
            whereCondition.reel_lot_no = { [Op.in]: idArray };
        }

        if (invoiceNo) {
            const idArray: any[] = invoiceNo
                .split(",")
                .map((id: any) => id);
            whereCondition.invoice_no = { [Op.in]: idArray };
        }

        // whereCondition.status = 'Sold';
        whereCondition.upload_sample ={[Op.not]: null};
        whereCondition.qty_stock = { [Op.gt]: 0 }

        let include = [
            {
                model: MandiSales,
                as: "sales",
                where: whereCondition,
                include: [
                    {
                        model: Season,
                        as: "season",
                        attributes: ['id', 'name']
                    },
                    {
                        model: Program,
                        as: "program",
                        attributes: ['id', 'program_name']
                    },
                    {
                        model: Mandi,
                        as: "mandi",
                        attributes: ['id', 'name']
                    },
                ],
                // group: ["season.id", "season_id"]
            },
            {
                model: MandiBag,
                as: "bag",
                where:{mill_status:false},
                attributes: {
                    exclude: ['qr','sold_status','mill_status','old_weight','createdAt','updatedAt']
                }
            },
        ];
        
        //fetch data with pagination
        let result = await BagSelection.findAll({
            where: {bag_status:true},
            include: include,
            group: ["sales.id","sales->season.id","sales->program.id","bag.id","bag_selections.id","sales->mandi.id"]
        });
        let riceVariety:any = [];
        for await (let item of result) {
            let lint_ids: any = [];
            let newId = await MandiProcess.findAll({
                where: {
                    id: item.bag.process_id
                },
            })

      let Process = await PaddySelection.findAll({
        where: {
          process_id: newId.map(
            (obj: any) => obj?.dataValues?.id
          ),
        },
        attributes: ["id", "transaction_id"],
      });

      lint_ids = Process.map((obj: any) => obj?.dataValues?.transaction_id);
    
      const varietyIds = await Transaction.findAll({
        where: {
          id: {
            [Op.in]: lint_ids,
          },
        },
      });

       riceVariety = await RiceVariety.findAll({
        where: {
          id: {
            [Op.in]: varietyIds.map((obj: any) => obj?.dataValues.riceVariety_id),
          },
        },
        attribute: ["id", "variety_name"],
      }); 
    }
        // for await (let item of result) {
        //     let items = await BagSelection.findAll({
        //         include: [
        //             {
        //                 model: MandiSales,
        //                 as: "sales",
        //                 where: { ...whereCondition, season_id: item.dataValues.season.id },
        //                 attributes: ['id', 'date', 'total_qty', 'no_of_bags', 'chosen_bag', 'lot_no', 'press_no', 'reel_lot_no', 'qty_stock', 'invoice_no'],
        //                 include: [
        //                     {
        //                         model: Mandi,
        //                         as: "mandi",
        //                         attributes: ['id', 'name']
        //                     },
        //                     {
        //                         model: Program,
        //                         as: "program",
        //                         attributes: ['id', 'program_name']
        //                     }
        //                 ],
        //             },
        //             {
        //                 model: MandiBag,
        //                 as: "bag",
        //             },
        //         ],
                
        //         order: [['id', 'DESC']]
        //     });
        //     list.push({ ...item.dataValues, data: items });
        // }
        const aggregatedData = result.reduce((acc: any, row: any) => {
            const { sales, bag, id } = row;
            const salesId = sales.id;
        
            if (!acc[salesId]) {
                acc[salesId] = { ...sales.toJSON(), riceVariety:riceVariety,available_lint: 0, bags: [] };
            }
        
            // Add bag weight to available lint for the sale
            if (bag) {
                acc[salesId].available_lint += Number(bag.weight);
                const bagWithId = { ...bag.toJSON()}; 
                acc[salesId].bags.push(bag); 
            }
        
            return acc;
        }, {});

        // Convert object back to array
        const aggregatedRows = Object.values(aggregatedData);

        return res.sendSuccess(res, aggregatedRows);

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

// const chooseYarn = async (req: Request, res: Response) => {
//     const searchTerm = req.query.search || "";
//     const { spinnerId, programId, reelLotNo, seasonId }: any = req.query;
//     const whereCondition: any = {};
//     try {
//         if (!spinnerId) {
//             return res.sendError(res, 'Spinner Id is required')
//         }
//         if (!programId) {
//             return res.sendError(res, 'Program Id is required')
//         }
//         if (spinnerId) {
//             whereCondition.spinner_id = spinnerId;
//         }

//         if (seasonId) {
//             const idArray: number[] = seasonId
//                 .split(",")
//                 .map((id: any) => parseInt(id, 10));
//             whereCondition.season_id = { [Op.in]: idArray };
//         }

//         if (programId) {
//             const idArray: number[] = programId
//                 .split(",")
//                 .map((id: any) => parseInt(id, 10));
//             whereCondition.program_id = { [Op.in]: idArray };
//         }

//         if (reelLotNo) {
//             const idArray: any[] = reelLotNo
//                 .split(",")
//                 .map((id: any) => id);
//             whereCondition.reel_lot_no = { [Op.in]: idArray };
//         }
//         whereCondition.qty_stock = { [Op.gt]: 0 }
//         let include = [
//             {
//                 model: Season,
//                 as: "season",
//                 attributes: []
//             }
//         ];

//         let result = await SpinYarn.findAll({
//             attributes: [
//                 [Sequelize.col('"spinprocess"."season"."id"'), 'season_id'],
//                 [Sequelize.col('"spinprocess"."season"."name"'), 'season_name'],
//                 // [Sequelize.fn('SUM', Sequelize.col('yarn_produced')), 'available_yarn']
//                 [Sequelize.fn('SUM', Sequelize.col('yarn_qty_stock')), 'available_yarn']
//             ],
//             include: [{
//                 model: SpinProcess,
//                 attributes: [],
//                 as: "spinprocess",
//                 where: whereCondition,
//                 include: include,
//             }],
//             where: { sold_status: false },
//             group: ["spinprocess.season.id", "spinprocess.season_id"]
//         })

//         //fetch data with pagination
//         // let result = await SpinProcess.findAll({
//         //     where: whereCondition,
//         //     include: include,
//         //     attributes: [
//         //         [Sequelize.fn('SUM', Sequelize.col('qty_stock')), 'available_yarn']
//         //     ],
//         //     group: ["season.id", "season_id"]
//         // });

//         let list = [];
//         for await (let item of result) {
//             let items = await SpinProcess.findAll({
//                 where: { ...whereCondition, season_id: item.dataValues.season_id },
//                 attributes: ['id', 'yarn_type', 'yarn_count', 'net_yarn_qty', 'reel_lot_no', 'batch_lot_no', 'qty_stock',],
//                 include: [
//                     {
//                         model: Program,
//                         as: "program",
//                         attributes: ['id', 'program_name']
//                     },
//                     {
//                         model: Spinner,
//                         as: "spinner",
//                         attributes: ['id', 'name']
//                     }
//                 ],
//                 order: [['id', 'DESC']]
//             });

//             let data = [];

//             for await (let row of items) {
//                 const lot_details = await SpinYarn.findAll({
//                     attributes: [
//                         [sequelize.fn('SUM', Sequelize.col('"spinprocess"."net_yarn_qty"')), 'total_yarn'],
//                         [sequelize.fn('SUM', Sequelize.col('"spin_yarns"."yarn_produced"')), 'yarn_produced'],
//                         [sequelize.fn('SUM', Sequelize.col('"spin_yarns"."yarn_qty_stock"')), 'qty_stock'],
//                         // Add other attributes here...
//                     ],
//                     where: {
//                         sold_status: false
//                     },
//                     include: [
//                         {
//                             model: SpinProcess,
//                             as: 'spinprocess',
//                             attributes: ['id', 'batch_lot_no', 'date', 'yarn_type', 'net_yarn_qty', 'qty_stock', 'reel_lot_no'],
//                             where: { id: row?.dataValues?.id },
//                         },
//                     ],
//                     group: ['spinprocess.id', 'spinprocess.batch_lot_no', 'spinprocess.reel_lot_no'],
//                 });


//                 if (lot_details.length > 0) {
//                     const yarns = await SpinYarn.findAll({
//                         include: [{
//                             model: YarnCount,
//                             as: 'yarncount',
//                             attributes: ['id', 'yarnCount_name'],
//                         }],
//                         order: [["id", "desc"]],
//                         where: {
//                             process_id: row?.dataValues?.id,
//                             sold_status: false
//                         },
//                     });

//                     if (yarns.length > 0) {
//                         lot_details[0].dataValues.yarns = yarns;
//                         data.push(lot_details[0]);
//                     }
//                 }
//             }


//             list.push({ ...item.dataValues, data: data });
//         }

//         return res.sendSuccess(res, list);

//     } catch (error: any) {
//         console.log(error)
//         return res.sendError(res, error.message);
//     }
// };

const getRiceTypeAndVariety = async (req: Request, res: Response) => {
    const { millId}: any = req.query;
    const whereCondition: any = {};
    try {
      if (!millId) {
        return res.sendError(res, 'Need Mill Id ');
      }
  

        whereCondition.lab_sample_status = 'Accepted';
        whereCondition.qty_stock = { [Op.gt]: 0 }
  
      const batchLotNo = await MillProcess.findAll({
        attributes: ['batch_lot_no'],
        where: whereCondition,
        group: ['batch_lot_no']
      });

      const reelLot = await MillProcess.findAll({
        attributes: ['reel_lot_no'],
        where: whereCondition,
        group: ['reel_lot_no']
      });
  
      const riceTypeData = await MillProcess.findAll({
        attributes: ['rice_type'],
        where: whereCondition,
        group: ['rice_type'],
      });

      let checkriceTypeData: any = [];

      if(riceTypeData && riceTypeData.length > 0){
        for await (let row of riceTypeData){
            checkriceTypeData = [...checkriceTypeData, ...new Set(row?.dataValues?.rice_type?.map((item: any) => item))]
        }
      }
      const riceType = await RiceType.findAll({      
        attributes: ["id", "riceType_name"],         
        where: {  
          id: { 
            [Op.in]: checkriceTypeData
          } 
        }, 
      });


      const riceVarietyData = await MillProcess.findAll({
        attributes: ['rice_variety'],
        where: whereCondition,
        group: ['rice_variety'],
      });

      let checkriceVarietyData: any = [];

      if(riceVarietyData && riceVarietyData.length > 0){
        for await (let row of riceVarietyData){
            checkriceVarietyData = [...checkriceVarietyData, ...new Set(row?.dataValues?.rice_variety?.map((item: any) => item))]
        }
      }
      const riceVariety = await RiceVariety.findAll({      
        attributes: ["id", "variety_name"],         
        where: {  
          id: { 
            [Op.in]: checkriceVarietyData
          } 
        }, 
      });
  
      res.sendSuccess(res, { batchLotNo, reelLot, riceType,  riceVariety});
    } catch (error: any) {
      return res.sendError(res, error.message);
    }
  };

// const getYarnReelLotNo = async (req: Request, res: Response) => {
//     const { programId, status, spinnerId }: any = req.query;
//     const whereCondition: any = {};
//     try {
//         if (!spinnerId) {
//             return res.sendError(res, 'Spinner Id is required')
//         }
//         if (!programId) {
//             return res.sendError(res, 'Program Id is required')
//         }
//         if (programId) {
//             const idArray: number[] = programId
//                 .split(",")
//                 .map((id: any) => parseInt(id, 10));
//             whereCondition.program_id = { [Op.in]: idArray };
//         }
//         if (spinnerId) {
//             whereCondition.spinner_id = spinnerId;
//         }
//         whereCondition.reel_lot_no = { [Op.not]: null }
//         whereCondition.qty_stock = { [Op.gt]: 0 }
//         const reelLot = await SpinProcess.findAll({
//             attributes: ['reel_lot_no'],
//             where: whereCondition,
//             group: ['reel_lot_no']
//         });

//         res.sendSuccess(res, reelLot);
//     } catch (error: any) {
//         return res.sendError(res, error.message);
//     }
// };

// const _getSpinnerProcessTracingChartData = async (reelLotNo: any) => {
//     let include = [
//         {
//             model: Spinner,
//             as: "spinner",
//         }
//     ];
//     let whereCondition = {
//         reel_lot_no: reelLotNo
//     };
//     let transactionInclude = [
//         {
//             model: Village,
//             as: 'village'
//         },
//         {
//             model: Farmer,
//             as: 'farmer',
//             include: [
//                 {
//                     model: Village,
//                     as: 'village'
//                 },
//                 {
//                     model: FarmGroup,
//                     as: 'farmGroup'
//                 }
//             ]
//         }
//     ]
//     let spin = await SpinProcess.findAll({
//         where: whereCondition,
//         include: include,
//         order: [
//             [
//                 'id', 'desc'
//             ]
//         ]
//     });
//     spin = await Promise.all(spin.map(async (el: any) => {
//         el = el.toJSON();
//         el.ginSales = await GinSales.findAll({
//             where: {
//                 buyer: el.spinner.id
//             },
//             include: [
//                 {
//                     model: Ginner,
//                     as: "ginner"
//                 }
//             ]
//         });
//         el.ginSales = await Promise.all(el.ginSales.map(async (el: any) => {
//             el = el.toJSON();
//             el.transaction = await Transaction.findAll({
//                 where: {
//                     mapped_ginner: el.ginner_id
//                 },
//                 include: transactionInclude
//             });
//             return el;
//         }))
//         return el;
//     }));

//     return formatDataForSpinnerProcess(reelLotNo, spin);
// }

// const getSpinnerProcessTracingChartData = async (req: Request, res: Response) => {
//     const { reelLotNo } = req.query;
//     const data = await _getSpinnerProcessTracingChartData(reelLotNo);
//     res.sendSuccess(res, data);
// }

export {
    createMillProcess,
    fetchMillProcessPagination,
    exportMillProcess,
    createMillSales,
    fetchMillSalesPagination,
    exportMillSale,
    updateMillSales,
    fetchMillSale,
//     updateSpinnerSales,
//     fetchSpinnerSale,
//     fetchSpinSalesPagination,
//     exportSpinnerSale,
    fetchMillSalesDashBoard,
    updateStatusSales,
//     countCottonBaleWithProgram,
//     exportSpinnerTransaction,
    getProgram,
//     fetchComberNoilPagination,
//     chooseYarnProcess,
//     getYarnCount,
    deleteMillProcess,
//     deleteSpinnerSales,
    getCMS,
    fetchMillProcess,
    updateMillProcess,
    getMillDashboard,
    chooseLint,
    getRiceType,
    getRiceVariety, 
//     getSalesInvoice,
    chooseRice,
    getRiceTypeAndVariety,
    exportMillTransaction
//     getYarnReelLotNo,
//     getSpinnerProcessTracingChartData,
//     _getSpinnerProcessTracingChartData
}