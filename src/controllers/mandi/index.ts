import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import { encrypt, generateOnlyQrCode } from "../../provider/qrcode";
import * as ExcelJS from "exceljs";
import * as path from "path";
import Season from "../../models/season.model";
import Program from "../../models/program.model";
import Transaction from "../../models/transaction.model";
import Village from "../../models/village.model";
import State from "../../models/state.model";
import Country from "../../models/country.model";
import sequelize from "../../util/dbConn";
import Farmer from "../../models/farmer.model";
// import { send_gin_mail } from "../send-emails";
import FarmGroup from "../../models/farm-group.model";
import { formatDataForGinnerProcess } from "../../util/tracing-chart-data-formatter";
// import QualityParameter from "../../models/quality-parameter.model";
import Brand from "../../models/brand.model";
// import PhysicalTraceabilityDataGinner from "../../models/physical-traceability-data-ginner.model";
// import PhysicalTraceabilityDataGinnerSample from "../../models/physical-traceability-data-ginner-sample.model";
import MandiProcess from "../../models/mandi-process.model";
import MandiBag from "../../models/mandi-bags.model";
import PaddySelection from "../../models/paddy-selection.model";
import Mill from "../../models/mills.model";
import MandiSales from "../../models/mandi-sales.model";
import BagSelection from "../../models/bag-selection.model";
import Mandi from "../../models/mandi.model";
import RiceVariety from "../../models/rice-variety.model";

//create Ginner Process
const createMandiProcess = async (req: Request, res: Response) => {
  try {
    if (req.body.lotNo) {
      let lot = await MandiProcess.findOne({ where: { lot_no: req.body.lotNo } });
      if (lot) {
        return res.sendError(res, "Lot No already Exists");
      }
    }

    const data = {
      mandi_id: req.body.mandiId,
      program_id: req.body.programId,
      season_id: req.body.seasonId,
      date: req.body.date,
      total_qty: req.body.totalQty,
      no_of_bags: req.body.noOfBags,
      mandi_out_turn: req.body.mot,
      lot_no: req.body.lotNo,
      reel_lot_no: req.body.reelLotNno,
      bag_press_no: req.body.pressNo,
      heap_number: req.body.heapNumber,
      heap_register: req.body.heapRegister,
      weigh_bridge: req.body.weighBridge,
      delivery_challan: req.body.deliveryChallan,
      bag_process: req.body.bagProcess,
      rice_quality: req.body.riceQuality,
    };
    const mandiprocess = await MandiProcess.create(data);

    let uniqueFilename = `mandi_procees_qrcode_${Date.now()}.png`;
    let da = encrypt(`${mandiprocess.id}`);
    let aa = await generateOnlyQrCode(da, uniqueFilename);
    const mandi = await MandiProcess.update(
      { qr: uniqueFilename },
      {
        where: {
          id: mandiprocess.id,
        },
      }
    );

    for await (const bag of req.body.bags) {
      let bagData = {
        process_id: mandiprocess.id,
        bag_no: String(bag.bagNo),
        weight: bag.weight,
        Q1: bag.Q1,
        Q2: bag.Q2,
        Q3: bag.Q3,
        Q4: bag.Q4,
        Q5: bag.Q5,
        Q6: bag.Q6,
        Q7: bag.Q7,
      };
      const bags = await MandiBag.create(bagData);

      let uniqueFilename = `mandi_bag_qrcode_${Date.now()}.png`;
      let da = encrypt(`Mandi,Bag, ${bags.id}`);
      let aa = await generateOnlyQrCode(da, uniqueFilename);
      const mandi = await MandiBag.update(
        { qr: uniqueFilename },
        {
          where: {
            id: bags.id,
          }
        }
      );
    }

    for await (const paddy of req.body.choosePaddy) {
      let trans = await Transaction.findAll({
        where: {
          mapped_mandi: req.body.mandiId,
          status: "Sold",
          farmer_id: paddy.frmr_id,
          season_id: paddy.season_id,
          program_id: req.body.programId,
          qty_stock: { [Op.gt]: 0 },
        },
      });

      for await (const tran of trans) {
        let realQty = 0;
        if (paddy.qty_used > 0) {
          let qty_stock = tran.dataValues.qty_stock || 0;
          if (qty_stock < paddy.qty_used) {
            realQty = qty_stock;
            paddy.qty_used = Number(paddy.qty_used) - Number(realQty);
          } else {
            realQty = paddy.qty_used;
            paddy.qty_used = 0;
          }
          let update = await Transaction.update(
            { qty_stock: qty_stock - Number(realQty) },
            { where: { id: tran.id } }
          );
          let cot = await PaddySelection.create({
            process_id: mandiprocess.id,
            transaction_id: tran.id,
            qty_used: realQty,
          });
        }
      }
    }

    // if (req.body.enterPhysicalTraceability) {
    //   const physicalTraceabilityData = {
    //     end_date_of_DNA_marker_application: req.body.endDateOfDNAMarkerApplication,
    //     date_sample_collection: req.body.dateSampleCollection,
    //     data_of_sample_dispatch: req.body.dataOfSampleDispatch,
    //     operator_name: req.body.operatorName,
    //     cotton_connect_executive_name: req.body.cottonConnectExecutiveName,
    //     expected_date_of_lint_sale: req.body.expectedDateOfLintSale,
    //     physical_traceability_partner_id: req.body.physicalTraceabilityPartnerId,
    //     gin_process_id: ginprocess.id,
    //     ginner_id: req.body.ginnerId
    //   };
    //   const physicalTraceabilityDataGinner = await PhysicalTraceabilityDataGinner.create(physicalTraceabilityData);

    //   for await (const weightAndBaleNumber of req.body.weightAndBaleNumber) {
    //     let brand = await Brand.findOne({
    //       where: { id: req.body.brandId }
    //     });

    //     const updatedCount = brand.dataValues.count + 1;
    //     let physicalTraceabilityDataGinnerSampleData = {
    //       physical_traceability_data_ginner_id: physicalTraceabilityDataGinner.id,
    //       weight: weightAndBaleNumber.weight,
    //       bale_no: weightAndBaleNumber.baleNumber,
    //       original_sample_status: weightAndBaleNumber.originalSampleStatus,
    //       code: `DNA${req.body.ginnerShortname}-${req.body.reelLotNno || ''}-${updatedCount}`,
    //       sample_result: 0
    //     };
    //     await PhysicalTraceabilityDataGinnerSample.create(physicalTraceabilityDataGinnerSampleData);

    //     await Brand.update(
    //       { count: updatedCount },
    //       { where: { id: brand.id } }
    //     );
    //   }
    // }

    res.sendSuccess(res, { mandiprocess });
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.message);
  }
};

const updateMandiProcess = async (req: Request, res: Response) => {
  if (!req.body.id) {
    return res.sendError(res, "Need Process Id");
  }
  if (req.body.lotNo) {
    let lot = await MandiProcess.findOne({
      where: { lot_no: req.body.lotNo, id: { [Op.ne]: req.body.id } },
    });
    if (lot) {
      return res.sendError(res, "Lot No already Exists");
    }
  }
  const data = {
    date: req.body.date,
    lot_no: req.body.lotNo,
  };
  const mandiprocess = await MandiProcess.update(data, {
    where: { id: req.body.id },
  });
  res.sendSuccess(res, { mandiprocess });
};

const fetchMandiProcessPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { mandiId, seasonId, programId }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { bag_press_no: { [Op.iLike]: `%${searchTerm}%` } },
        { heap_number: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (mandiId) {
      whereCondition.mandi_id = mandiId;
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
      },
    ];
    //fetch data with pagination
    if (req.query.pagination === "true") {
      const { count, rows } = await MandiProcess.findAndCountAll({
        where: whereCondition,
        include: include,
        offset: offset,
        limit: limit,
        order: [["id", "desc"]],
      });
      let sendData: any = [];
      for await (let row of rows) {
        let cotton = await PaddySelection.findAll({
          attributes: ["transaction_id"],
          where: { process_id: row.dataValues.id },
        });
        let farmer = [];
        if (cotton.length > 0) {
          farmer = await Transaction.findAll({
            attributes: ["farmer_id"],
            where: {
              id: cotton.map((obj: any) => obj.dataValues.transaction_id),
            },
            include: [
              {
                model: Farmer,
                as: "farmer",
              },
              {
                model: RiceVariety,
                as: "rice_variety",
              },
            ],
            group: ["farmer_id", "farmer.id", "transactions.riceVariety_id", "rice_variety.id"],
          });
        }
        let bag = await MandiBag.findOne({
          attributes: [
            [
              Sequelize.fn(
                "SUM",
                Sequelize.literal("CAST(weight AS DOUBLE PRECISION)")
              ),
              "lint_quantity",
            ],
            [sequelize.fn("min", sequelize.col("bag_no")), "pressno_from"],
            [sequelize.fn("max", Sequelize.literal("LPAD(bag_no, 10, ' ')")), "pressno_to"],
          ],
          where: { process_id: row.dataValues.id },
        });
        sendData.push({
          ...row.dataValues,
          farmer: farmer,
          mandi_press_no:
            (bag.dataValues.pressno_from || "") +
            "-" +
            (bag.dataValues.pressno_to || "").trim(),
          lint_quantity: bag.dataValues.lint_quantity,
        });
      }
      return res.sendPaginationSuccess(res, sendData, count);
    } else {
      const gin = await MandiProcess.findAll({
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

//Export the Ginner Sales details through excel file
const exportMandiProcess = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "mandi-process.xlsx");
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { mandiId, seasonId, programId }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { bag_press_no: { [Op.iLike]: `%${searchTerm}%` } },
        { heap_number: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (mandiId) {
      whereCondition.mandi_id = mandiId;
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
      },
    ];
    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:O1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Mandi Process";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Created Date",
      "Date",
      "Season",
      "Lot No",
      "Bag No",
      "REEL Lot No",
      "Heap Number",
      "No of Bags",
      "Total Paddy Quantity in bags(kgs)",
      "Program",
      "Mot",
      "Total Paddy Consumed(kgs)",
      "Farmer",
      "Rice Variety"
    ]);
    headerRow.font = { bold: true };
    const mandi = await MandiProcess.findAll({
      where: whereCondition,
      include: include,
      order: [["id", "desc"]],
    });
    // Fetch associated data in bulk for better performance
    const processIds = mandi.map((process: any) => process.id);
    // Fetch GinBale data for all gin processes in one query
    const mandiBags = await MandiBag.findAll({
      attributes: [
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal("CAST(weight AS DOUBLE PRECISION)")
          ),
          "lint_quantity",
        ],
        [sequelize.fn("min", sequelize.col("bag_no")), "pressno_from"],
        [sequelize.fn("max", Sequelize.literal("LPAD(bag_no, 10, ' ')")), "pressno_to"],
        "process_id",
      ],
      raw: true,
      where: { process_id: { [Op.in]: processIds } },
      group: ["process_id"],
    });
    // Fetch associated CottonSelection and Transaction data in bulk
    const paddySelections = await PaddySelection.findAll({
      include: [
        {
          model: Transaction,
          attributes: [],
          as: "transaction",
          include:[{
            model: RiceVariety,
            attributes: [],
            as: "rice_variety",
          }]
        },
      ],
      attributes: [
        "process_id",
        [sequelize.col("transaction.farmer_name"), "name"],
        [sequelize.col("transaction.rice_variety.variety_name"), "variety_name"],
      ],
      where: { process_id: { [Op.in]: processIds } },
    });

    // Append data to worksheet
    for await (const [index, item] of mandi.entries()) {
      const paddySelectionsForProcess = paddySelections.filter(
        (paddy: any) => paddy.process_id === item.id
      );

      let bag = mandiBags.find((obj: any) => obj.process_id == item.id);
      let mandi_press_no =
        (bag?.pressno_from || "") + "-" + (bag?.pressno_to || "").trim();
      let lint_quantity = bag?.lint_quantity ?? 0;

      const rowValues = Object.values({
        index: index + 1,
        createdDate: item.createdAt ? item.createdAt : "",
        date: item.date ? item.date : "",
        season: item.season ? item.season.name : "",
        lot: item.lot_no ? item.lot_no : "",
        gin_press_no: mandi_press_no ? mandi_press_no : "",
        reel_lot_no: item.reel_lot_no ? item.reel_lot_no : "",
        heap_number: item.heap_number ? item.heap_number : "",
        no_of_bales: item.no_of_bags ? item.no_of_bags : "",
        lint_quantity: lint_quantity ? lint_quantity : "",
        program: item.program ? item.program.program_name : "",
        gin_out_turn: item.mandi_out_turn ? item.mandi_out_turn : "",
        total_qty: item.total_qty ? item.total_qty : "",
        a: [
          ...new Set(
            paddySelectionsForProcess.map((obj: any) => obj.dataValues.name)
          ),
        ].join(", "),
        variety: [
          ...new Set(
            paddySelectionsForProcess.map((obj: any) => obj.dataValues.variety_name)
          ),
        ].join(", "),
      });
      worksheet.addRow(rowValues);
    }
    // Auto-adjust column widths based on content
    worksheet.columns.forEach((column: any) => {
      let maxCellLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const cellLength = (cell.value ? cell.value.toString() : "").length;
        maxCellLength = Math.max(maxCellLength, cellLength);
      });
      column.width = Math.min(25, maxCellLength + 2); // Limit width to 30 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "mandi-process.xlsx",
    });
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

const chooseBag = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const { mandiId, seasonId, programId }: any = req.query;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { bag_press_no: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (!mandiId) {
      return res.sendError(res, "Mandi Id is required");
    }
    if (!programId) {
      return res.sendError(res, "Program Id is required");
    }
    if (mandiId) {
      whereCondition.mandi_id = mandiId;
    }
    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }

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
      },
    ];
    //fetch data with pagination

    let result = await MandiProcess.findAll({
      where: whereCondition,
      include: include,
      order: [["id", "DESC"]],
    });
    const id_array = result.map((item: any) => item.id);
    const bags_list = [];
    for await (const id of id_array) {
      const lot_details = await MandiBag.findAll({
        attributes: [
          [
            sequelize.fn(
              "SUM",
              Sequelize.literal(
                'CAST("mandi-bags"."weight" AS DOUBLE PRECISION)'
              )
            ),
            "weight",
          ],
          // Add other attributes here...
        ],
        where: {
          sold_status: false,
        },
        include: [
          {
            model: MandiProcess,
            as: "mandiprocess",
            attributes: ["id", "lot_no", "date", "bag_press_no", "reel_lot_no"],
            where: { id: id },
          },
        ],
        group: ["mandiprocess.id", "mandiprocess.lot_no"],
      });
      if (lot_details.length > 0) {
        const bags = await MandiBag.findAll({
          where: {
            process_id: id,
            sold_status: false,
          },
        });

        if (bags.length > 0) {
          lot_details[0].dataValues.bags = bags;
          bags_list.push(lot_details[0]);
        }
      }
    }
    return res.sendSuccess(res, bags_list);
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.message);
  }
};

const deleteMandiProcess = async (req: Request, res: Response) => {
  try {
    let ids = await BagSelection.count({
      where: { "$bag.process_id$": req.body.id },
      include: [{ model: MandiBag, as: "bag" }],
    });

    if (ids > 0) {
      return res.sendError(res, "Unable to delete this process since some bags of this process was sold");
    } else {
      let paddy = await PaddySelection.findAll({
        where: { process_id: req.body.id },
      });
      for await (let cs of paddy) {
        await Transaction.update(
          {
            qty_stock: Sequelize.literal(
              `qty_stock + ${cs.dataValues.qty_used}`
            ),
          },
          {
            where: {
              id: cs.dataValues.transaction_id,
            },
          }
        );
      }
      await PaddySelection.destroy({
        where: {
          process_id: req.body.id,
        },
      });

      // const physicalTraceabilityDataGinner = await PhysicalTraceabilityDataGinner.findOne({ where: { gin_process_id: req.body.id } });
      // if (physicalTraceabilityDataGinner) {
      //   await PhysicalTraceabilityDataGinnerSample.destroy({
      //     where: { physical_traceability_data_ginner_id: physicalTraceabilityDataGinner.id }
      //   });
      //   await PhysicalTraceabilityDataGinner.destroy({
      //     where: { gin_process_id: req.body.id }
      //   });
      // }

      await MandiProcess.destroy({
        where: {
          id: req.body.id,
        },
      });

      return res.sendSuccess(res, {
        message: "Successfully deleted this process",
      });
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const fetchMandiProcess = async (req: Request, res: Response) => {
  const whereCondition: any = { id: req.query.id };
  try {
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
      },
    ];
    //fetch data with pagination

    const mandi = await MandiProcess.findOne({
      where: whereCondition,
      include: include,
    });
    return res.sendSuccess(res, mandi);
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.message);
  }
};
//fetch Ginner Bale
const fetchMandiBag = async (req: Request, res: Response) => {
  try {
    //fetch data with process id
    const mandi = await MandiBag.findAll({
      where: {
        process_id: req.query.processId,
      },
      include: [
        {
          model: MandiProcess,
          as: "mandiprocess",
        },
      ],
    });
    return res.sendSuccess(res, mandi);
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.message);
  }
};

const choosePaddy = async (req: Request, res: Response) => {
  try {
    let mandiId = req.query.mandiId;
    let programId = req.query.programId;
    if (!mandiId) {
      return res.sendError(res, "Need Mandi Id");
    }
    if (!programId) {
      return res.sendError(res, "Need Program Id");
    }
    let villageId: any = req.query.villageId;
    let farmerId: any = req.query.farmerId;
    let seasonId: any = req.query.seasonId;
    let whereCondition: any = {
      status: "Sold",
      qty_stock: {
        [Op.gt]: 0,
      },
      mapped_mandi: mandiId,
      program_id: programId,
    };

    if (villageId) {
      const idArray: number[] = villageId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.village_id = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }

    if (farmerId) {
      const idArray: number[] = farmerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.farmer_id = { [Op.in]: idArray };
    }

    const results = await Transaction.findAll({
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("qty_stock")), "qty_stock"],
        [Sequelize.fn("SUM", Sequelize.col("qty_stock")), "qty_used"],
        [
          sequelize.fn(
            "COALESCE",
            sequelize.fn(
              "SUM",
              Sequelize.literal('CAST("qty_purchased" AS DOUBLE PRECISION)')
            ),
            0
          ),
          "estimated_qty",
        ],
        [Sequelize.col("farmer.id"), "frmr_id"],
        [Sequelize.col("season.id"), "season_id"], // Include season ID in attributes
      ],
      include: [
        { model: Farmer, as: "farmer" },
        { model: Program, as: "program" },
        { model: Season, as: "season" },
      ],
      where: whereCondition,
      group: ["frmr_id", "program.id", "transactions.id", "season.id"],
      order: [
        ["id", "DESC"],
        [Sequelize.col("accept_date"), "DESC"],
      ],
    });
    const summedData: any = {};

    results.forEach((result: any) => {
      const frmrId = result.dataValues.frmr_id;
      const seasonId = result.dataValues.season_id; // Get season ID from the result
      const key = `${frmrId}_${seasonId}`; // Combine farmer ID and season ID as the key

      if (summedData[key]) {
        summedData[key].qty_stock += result.dataValues.qty_stock;
        summedData[key].qty_used += result.dataValues.qty_used;
        summedData[key].estimated_qty += result.dataValues.estimated_qty;
      } else {
        summedData[key] = {
          qty_stock: result.dataValues.qty_stock,
          qty_used: result.dataValues.qty_used,
          estimated_qty: result.dataValues.estimated_qty,
          frmr_id: frmrId,
          season_id: seasonId,
          farmer: result.farmer,
          program: result.program,
          season: result.season,
        };
      }
    });

    const finalResult = Object.values(summedData);
    res.sendSuccess(res, finalResult);
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

const updateTransactionStatus = async (req: Request, res: Response) => {
  try {
    let trans: any = [];
    for await (let obj of req.body.items) {
      const data: any = {
        status: obj.status,
        accept_date: obj.status === "Sold" ? new Date().toISOString() : null,
      };

      const transaction = await Transaction.update(data, {
        where: {
          id: obj.id,
        },
      });
      trans.push(transaction);
    }

    res.sendSuccess(res, trans);
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

//Export the Ginner Sales details through excel file
const exportMandiSales = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "bag-sale.xlsx");
  const searchTerm = req.query.search || "";
  const { mandiId, seasonId, programId }: any = req.query;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type
        { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
        { bag_press_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$buyerdata.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { rate: { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (mandiId) {
      whereCondition.mandi_id = mandiId;
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
    worksheet.mergeCells("A1:J1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Lint Sale";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Date",
      "Season",
      "Invoice No",
      "Sold To",
      "No of Bags",
      "Bag Lot",
      "Bag No",
      "REEL Lot No",
      "Program",
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
      },
      {
        model: Mill,
        as: "buyerdata",
      },
    ];
    const gin = await MandiSales.findAll({
      where: whereCondition,
      include: include,
    });
    // Append data to worksheet
    for await (const [index, item] of gin.entries()) {
      const rowValues = Object.values({
        index: index + 1,
        date: item.date ? item.date : "",
        season: item.season ? item.season.name : "",
        invoice: item.invoice_no ? item.invoice_no : "",
        buyer: item.buyerdata ? item.buyerdata.name : "",
        no_of_bags: item.no_of_bags ? item.no_of_bags : "",
        lot_no: item.lot_no ? item.lot_no : "",
        bag_press_no: item.bag_press_no ? item.bag_press_no : "",
        reel_lot_no: item.reel_lot_no ? item.reel_lot_no : "",
        program: item.program ? item.program.program_name : "",
      });
      worksheet.addRow(rowValues);
    }
    // Auto-adjust column widths based on content
    worksheet.columns.forEach((column: any) => {
      let maxCellLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const cellLength = (cell.value ? cell.value.toString() : "").length;
        maxCellLength = Math.max(maxCellLength, cellLength);
      });
      column.width = Math.min(25, maxCellLength + 2); // Limit width to 30 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "bag-sale.xlsx",
    });
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

// create Ginner Sale
const createMandiSales = async (req: Request, res: Response) => {
  try {
    const data = {
      mandi_id: req.body.mandiId,
      program_id: req.body.programId,
      season_id: req.body.seasonId,
      date: req.body.date,
      total_qty: req.body.totalQty,
      no_of_bags: req.body.noOfBags,
      chosen_bag: req.body.choosenBag,
      lot_no: req.body.lotNo,
      buyer: req.body.buyer,
      shipping_address: req.body.shippingAddress,
      transaction_via_trader: req.body.transactionViaTrader,
      transaction_agent: req.body.transactionAgent,
      candy_rate: req.body.candyRate,
      rate: req.body.rate,
      reel_lot_no: req.body.reelLotNno ? req.body.reelLotNno : null,
      despatch_from: req.body.despatchFrom,
      bag_press_no: req.body.pressNo,
      status: "To be Submitted",
      // qty_stock: req.body.totalQty,
    };
    const mindiSales = await MandiSales.create(data);
    let uniqueFilename = `mandi_sales_qrcode_${Date.now()}.png`;
    let da = encrypt("Mandi,Sale," + mindiSales.id);
    let aa = await generateOnlyQrCode(da, uniqueFilename);
    const mandi = await MandiSales.update(
      { qr: uniqueFilename },
      {
        where: {
          id: mindiSales.id,
        },
      }
    );
    for await (const bag of req.body.bags) {
      let bagData = {
        sales_id: mindiSales.id,
        bag_id: bag,
      };
      const bags = await BagSelection.create(bagData); 
      const mandibagSatus = await MandiBag.update(
        { sold_status: true },
        { where: { id: bag } }
      );
    }
    res.sendSuccess(res, { mindiSales });
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.message);
  }
};

// update Ginner Sale
const updateMandiSales = async (req: Request, res: Response) => {
  try {
    const data = {
      status: "Pending for QR scanning",
      weight_loss: req.body.weightLoss,
      sale_value: req.body.saleValue,
      invoice_no: req.body.invoiceNo,
      tc_file: req.body.tcFile,
      contract_file: req.body.contractFile,
      invoice_file: req.body.invoiceFile,
      delivery_notes: req.body.deliveryNotes,
      transporter_name: req.body.transporterName,
      vehicle_no: req.body.vehicleNo,
      lrbl_no: req.body.lrblNo,
    };
    const mandiSales = await MandiSales.update(data, {
      where: { id: req.body.id },
    });
    if (req.body.weightLoss) {
      for await (let obj of req.body.lossData) {
        let bag = await MandiBag.findOne({
          where: {
            "$mandiprocess.reel_lot_no$": String(obj.reelLotNo),
            bag_no: String(obj.bagNo),
          },
          include: [{ model: MandiProcess, as: "mandiprocess" }],
        });
        if (bag) {
          await MandiBag.update(
            { 
              old_weight: Sequelize.literal('weight'),  
              weight: obj.newWeight 
            },
            { where: { id: bag.dataValues.id } }
          );
        }
      }
    }

    if (mandiSales && mandiSales[0] === 1) {
      // await send_mandi_mail(req.body.id);
    }
    res.sendSuccess(res, { mandiSales });
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.message);
  }
};

const updateMandiSalesField = async (req: Request, res: Response) => {
  try {
    if (!req.body.id) {
      return res.sendError(res, "Need Sale Id");
    }
    const data = {
      invoice_no: req.body.invoiceNo,
      date: req.body.date,
      vehicle_no: req.body.vehicleNo,
    };
    const mandiSales = await MandiSales.update(data, {
      where: { id: req.body.id },
    });

    res.sendSuccess(res, { mandiSales });
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.message);
  }
};

//fetch Ginner Process with filters
const fetchMandiSalesPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { mandiId, seasonId, programId }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type
        { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
        { bag_press_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$buyerdata.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { rate: { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (mandiId) {
      whereCondition.mandi_id = mandiId;
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
      },
      {
        model: Mill,
        as: "buyerdata",
      },
    ];
    //fetch data with pagination
    if (req.query.pagination === "true") {
      const { count, rows } = await MandiSales.findAndCountAll({
        where: whereCondition,
        include: include,
        offset: offset,
        limit: limit,
        order: [["id", "desc"]],
      });
      return res.sendPaginationSuccess(res, rows, count);
    } else {
      const mandi = await MandiSales.findAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
      });
      return res.sendSuccess(res, mandi);
    }
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.message);
  }
};

const deleteMandiSales = async (req: Request, res: Response) => {
  try {
    const res1 = await MandiBag.update(
      { sold_status: false },
      {
        where: {
          id: {
            [Op.in]: sequelize.literal(
              `(SELECT bag_id FROM bag_selections WHERE sales_id = ${req.body.id})`
            ),
          },
        },
      }
    );

    const res2 = await BagSelection.destroy({
      where: {
        sales_id: req.body.id,
      },
    });

    const res3 = await MandiSales.destroy({
      where: {
        id: req.body.id,
      },
    });
    return res.sendSuccess(res, {
      message: "Successfully deleted this process",
    });
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.message);
  }
};

const fetchMandiSale = async (req: Request, res: Response) => {
  const whereCondition: any = { id: req.query.id };
  try {
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
      },
      {
        model: Mill,
        as: "buyerdata",
      },
    ];
    //fetch data with pagination

    const mandi = await MandiSales.findOne({
      where: whereCondition,
      include: include,
    });

    const bagData = await BagSelection.findAll({
      where:  {
        sales_id: mandi.id,
      },
      include: [{ model: MandiBag,  as: "bag" }],    
    });

    const response = {
      mandi,
      bag: bagData?.map((item:any)=> item.bag),
    };
    return res.sendSuccess(res, response);
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.message);
  }
};

//fetch Ginner Bag
const fetchMandiSaleBag = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$bag.bag_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$bag.weight$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$bag.staple$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$bag.mic$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$bag.strength$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$bag.trash$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$bag.color_grade$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    whereCondition.sales_id = req.query.saleId;
    //fetch data with process id
    const { count, rows } = await BagSelection.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: MandiBag,
          as: "bag",
        },
        {
          model: MandiSales,
          as: "sales",
          include: [
            {
              model: Mandi,
              as: "mandi",
              attributes: ["id", "name", "address", "brand"],
            },
          ],
        },
      ],
      order: [["id", "DESC"]],
      offset: offset,
      limit: limit,
    });
    let data = [];
    for await (let obj of rows) {
      if (obj.dataValues.sales.mandi) {
        let brands = await Brand.findAll({
          where: { id: obj.dataValues.sales.mandi.brand },
        });
        data.push({ ...obj.dataValues, brands });
      }
    }
    return res.sendPaginationSuccess(res, data, count);
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.message);
  }
};

const updateMandiSaleBag = async (req: Request, res: Response) => {
  try {
    //fetch data with process id
    let mandis: any = [];
    for await (let obj of req.body.printData) {
      const mandi = await BagSelection.update(
        {
          print: obj.print,
        },
        {
          where: {
            id: obj.id,
          },
        }
      );
      mandis.push(mandi);
    }

    return res.sendSuccess(res, mandis);
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.message);
  }
};

const dashboardGraphWithProgram = async (req: Request, res: Response) => {
  try {
    let whereCondition: any = {};

    let result = await Mandi.findOne({ where: { id: req.query.mandiId } });
    if (!result) {
      res.sendError(res, "No mandi found");
    }
    let data = await Program.findAll({
      where: {
        id: { [Op.in]: result.program_id },
      },
      attributes: ["id", "program_name"],
    });
    let transaction: any = [];
    let mandi: any = [];

    for await (let obj of data) {
      whereCondition.mandi_id = req.query.mandiId;
      whereCondition.status = "Sold";
      whereCondition.program_id = obj.id;
      const trans = await Transaction.findOne({
        where: {
          mapped_mandi: req.query.mandiId,
          status: "Sold",
          program_id: obj.id,
        },
        attributes: [
          [
            Sequelize.fn(
              "SUM",
              Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")
            ),
            "totalPurchased",
          ],
          [Sequelize.fn("SUM", Sequelize.col("qty_stock")), "totalQuantity"],
        ],
        include: [
          {
            model: Program,
            as: "program",
            attributes: [],
          },
        ],
        group: ["program.id"],
      });
      transaction.push({ data: trans, program: obj });
      const mndi = await MandiSales.findOne({
        where: whereCondition,
        attributes: [
          [Sequelize.fn("SUM", Sequelize.col("no_of_bags")), "totalBags"],
          [Sequelize.fn("SUM", Sequelize.col("qty_stock")), "totalQuantity"],
        ],
        include: [
          {
            model: Program,
            as: "program",
            attributes: [],
          },
        ],
        group: ["program.id"],
      });
      mandi.push({ data: mndi, program: obj });
    }

    res.sendSuccess(res, { transaction, mandi });
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.message);
  }
};

const getReelBagId = async (req: Request, res: Response) => {
  try {
    let whereCondition: any = {};
    let mandiId = req.query.mandiId;
    whereCondition.status = "Sold";
    const bagCount = await MandiBag.count({
      distinct: true,
      col: "process_id",
      include: [
        {
          model: MandiProcess,
          as: "mandiprocess",
          where: {
            mandi_id: req.query.mandiId,
            program_id: req.query.programId,
          },
        },
      ],
      where: {
        sold_status: false,
      },
    });
    const result = await Mandi.findOne({
      attributes: [
        [
          Sequelize.fn(
            "concat",
            "PD-REE",
            Sequelize.fn(
              "upper",
              Sequelize.fn("left", Sequelize.col("country.county_name"), 2)
            ),
            Sequelize.fn(
              "upper",
              Sequelize.fn("left", Sequelize.col("state.state_name"), 2)
            ),
            Sequelize.fn("upper", Sequelize.col("short_name"))
          ),
          "idprefix",
        ],
      ],
      include: [
        {
          model: State,
          as: "state",
        },
        {
          model: Country,
          as: "country",
        },
      ],
      where: { id: mandiId }, // Assuming prscr_id is a variable with the desired ID
    });
    var bagid_prefix = result.dataValues.idprefix
      ? result.dataValues.idprefix
      : "";
    let currentDate = new Date();
    let day = String(currentDate.getUTCDate()).padStart(2, "0");
    let month = String(currentDate.getUTCMonth() + 1).padStart(2, "0"); // UTC months are zero-indexed, so we add 1
    let year = String(currentDate.getUTCFullYear());

    let prcs_date = day + month + year;
    const random_number = +performance.now().toString().replace('.', '7').substring(0,4)
    var bag_no = bagCount ? Number(bagCount ?? 0) + 1 : 1;
    var reelbag_id = bagid_prefix + prcs_date + "/" + String(random_number);
    res.sendSuccess(res, { id: reelbag_id });
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.message);
  }
};

const getProgram = async (req: Request, res: Response) => {
  try {
    if (!req.query.mandiId) {
      return res.sendError(res, "Need Mandi Id");
    }

    let mandiId = req.query.mandiId;
    let result = await Mandi.findOne({ where: { id: mandiId } });
    if (!result) {
      res.sendError(res, "No mandi found");
    }
    let data = await Program.findAll({
      where: {
        id: { [Op.in]: result.program_id },
      },
    });
    res.sendSuccess(res, data);
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.message);
  }
};

const getMill = async (req: Request, res: Response) => {
  let mandiId = req.query.mandiId;
  if (!mandiId) {
    return res.sendError(res, "Need Mandi Id ");
  }
  let mandi = await Mandi.findOne({ where: { id: mandiId } });
  if (!mandi) {
    return res.sendError(res, "No Mandi Found ");
  }
  let result = await Mill.findAll({
    attributes: ["id", "name"],
    where: { brand: { [Op.overlap]: mandi.dataValues.brand } },
  });
  res.sendSuccess(res, result);
};
const getVillageAndFarmer = async (req: Request, res: Response) => {
  let mandiId = req.query.mandiId;
  if (!mandiId) {
    return res.sendError(res, "Need Mandi Id ");
  }
  let whereCondition = {
    status: "Sold",
    mapped_mandi: mandiId,
  };
  const farmers = await Transaction.findAll({
    include: [
      {
        model: Farmer,
        as: "farmer",
        attributes: [],
      },
    ],
    attributes: [
      [Sequelize.literal("farmer.id"), "id"],
      [Sequelize.literal('"farmer"."firstName"'), "firstName"],
      [Sequelize.literal('"farmer"."lastName"'), "lastName"],
      [Sequelize.literal('"farmer"."code"'), "code"],
    ],
    where: whereCondition,
    group: ["farmer_id", "farmer.id"],
  });
  const village = await Transaction.findAll({
    include: [
      {
        model: Village,
        as: "village",
        attributes: [],
      },
    ],
    attributes: [
      [Sequelize.literal("village.id"), "id"],
      [Sequelize.literal('"village"."village_name"'), "village_name"],
    ],
    where: whereCondition,
    group: ["village_id", "village.id"],
  });
  res.sendSuccess(res, { farmers, village });
};

const getMandiProcessTracingChartData = async (
  req: Request,
  res: Response
) => {
  const { reelLotNo } = req.query;
  let include = [
    {
      model: Mandi,
      as: "mandi",
    },
  ];

  let transactionInclude = [
    {
      model: Village,
      as: "village",
    },
    {
      model: Farmer,
      as: "farmer",
      include: [
        {
          model: Village,
          as: "village",
        },
        {
          model: FarmGroup,
          as: "farmGroup",
        },
      ],
    },
  ];

  let whereCondition = {
    reel_lot_no: reelLotNo,
  };

  let mandi = await MandiProcess.findAll({
    where: whereCondition,
    include: include,
    order: [["id", "desc"]],
  });

  mandi = await Promise.all(
    mandi.map(async (el: any) => {
      el = el.toJSON();
      el.transaction = await Transaction.findAll({
        where: {
          mapped_mandi: el.mandi_id,
        },
        include: transactionInclude,
      });
      return el;
    })
  );

  let formattedData: any = {};

  mandi.forEach((el: any) => {
    el.transaction.forEach((el: any) => {
      if (!formattedData[el.farmer.farmGroup_id]) {
        formattedData[el.farmer.farmGroup_id] = {
          farm_name: el.farmer.farmGroup.name,
          villages: [],
        };
      }

      const village_name = el.farmer.village.village_name;
      if (
        !formattedData[el.farmer.farmGroup_id].villages.includes(village_name)
      ) {
        formattedData[el.farmer.farmGroup_id].villages.push(village_name);
      }
    });
  });

  formattedData = Object.keys(formattedData).map((el: any) => {
    return formattedData[el];
  });
  res.sendSuccess(res, formatDataForGinnerProcess(reelLotNo, formattedData));
};

// const checkReport = async (req: Request, res: Response) => {
//   try {
//     if (!req.query.mandiId) {
//       return res.sendError(res, "Need mandi Id");
//     }

//     let mandiId = req.query.mandiId;
//     let report = await QualityParameter.findOne({
//       where: { mandi_id: mandiId },
//       order: [["id", "desc"]],
//     });
//     if (!report) {
//       let data = await MandiProcess.findAll({
//         where: {
//           mandi_id: mandiId,
//         },
//       });
//       if (data.length >= 3) {
//         return res.sendSuccess(res, { show: true });
//       } else {
//         return res.sendSuccess(res, { show: false });
//       }
//     }
//     let data = await MandiProcess.findAll({
//       where: {
//         createdAt: { [Op.gt]: report.dataValues.createdAt },
//         mandi_id: mandiId,
//       },
//     });
//     if (data.length >= 3) {
//       res.sendSuccess(res, { show: true });
//     } else {
//       res.sendSuccess(res, { show: false });
//     }
//   } catch (error: any) {
//     console.error(error);
//     return res.sendError(res, error.message);
//   }
// };

export {
  createMandiProcess,
  fetchMandiProcessPagination,
  fetchMandiBag,
  deleteMandiProcess,
  createMandiSales,
  fetchMandiSalesPagination,
  fetchMandiSale,
  exportMandiSales,
  fetchMandiSaleBag,
  updateTransactionStatus,
  choosePaddy,
  getReelBagId,
  getProgram,
  chooseBag,
  updateMandiSalesField,
  updateMandiSales,
  updateMandiSaleBag,
  deleteMandiSales,
  getMill,
  getVillageAndFarmer,
  dashboardGraphWithProgram,
  getMandiProcessTracingChartData,
  updateMandiProcess,
  fetchMandiProcess,
  exportMandiProcess,
//   checkReport,
};
