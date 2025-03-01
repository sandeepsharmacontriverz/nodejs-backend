import { Request, Response } from "express";
import UserRegistrations from "../../models/user-registrations.model";
import UserApp from "../../models/users-app.model";
import { Sequelize, Op } from "sequelize";
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import Village from "../../models/village.model";
import Block from "../../models/block.model";
import District from "../../models/district.model";
import State from "../../models/state.model";
import Country from "../../models/country.model";
import Farmer from "../../models/farmer.model";
import Program from "../../models/program.model";
import Brand from "../../models/brand.model";
import Mandi from "../../models/mandi.model";
import CropGrade from "../../models/crop-grade.model";
import Farm from "../../models/farm.model";
import Season from "../../models/season.model";
import Transaction from "../../models/transaction.model";
import { generateTokens } from "../../util/auth";
import hash from "../../util/hash";
import sequelize from "../../util/dbConn";
import { decrypt, encrypt } from "../../provider/qrcode";
import Mill from "../../models/mills.model";
import CMS from "../../models/container-management-system.model";
// import Weaver from "../../models/weaver.model";
// import Garment from "../../models/garment.model";
import moment from "moment";

const getRegisteredDevices = async (req: Request, res: Response) => {
    try {
        const searchTerm = req.query.search || "";
        const sortOrder = req.query.sort || "desc";
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const whereCondition: any = {}
        if (searchTerm) {
            whereCondition[Op.or] = [
                { username: { [Op.iLike]: `%${searchTerm}%` } },
                { firstName: { [Op.iLike]: `%${searchTerm}%` } },
                { lastName: { [Op.iLike]: `%${searchTerm}%` } },
                { mobile_no: { [Op.iLike]: `%${searchTerm}%` } },
                { email: { [Op.iLike]: `%${searchTerm}%` } },
                { access_level: { [Op.iLike]: `%${searchTerm}%` } },
                { "$registrations.device_id$": { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }
        if (req.query.pagination === "true") {
            const { count, rows } = await UserApp.findAndCountAll({
                attributes: [
                    'id', 'username', 'firstName',
                    'lastName', 'mobile_no', 'email', 'access_level', 'status',
                    [Sequelize.col('registrations.device_id'), 'device_id']
                ],
                where: whereCondition,
                include: [{
                    model: UserRegistrations,
                    as: 'registrations',
                    attributes: []
                }],
                order: [
                    ['id', 'desc']
                ],
                limit: limit,
                offset: offset
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const data = await UserApp.findAll({
                attributes: [
                    'id', 'username', 'firstName',
                    'lastName', 'mobile_no', 'email', 'access_level', 'status',
                    [Sequelize.col('registrations.device_id'), 'device_id']
                ],
                where: whereCondition,
                order: [
                    ['id', 'desc']
                ],
                include: [{
                    model: UserRegistrations,
                    as: 'registrations',
                    attributes: []
                }]
            });
            res.sendSuccess(res, data)
        }

    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
    }
}

const getRegisteredOne = async (req: Request, res: Response) => {
    try {
        const data = await UserApp.findOne({
            include: [{
                model: UserRegistrations,
                as: 'registrations'
            },
            {
                model: Program,
                as: 'programs'
            },
            {
                model: Mandi,
                as: 'mandi'
            },
            {
                model: Mill,
                as: 'mill'
            },
            {
                model: CMS,
                as: 'cms'
            },
            // {
            //     model: Weaver,
            //     as: 'weaver'
            // },
            // {
            //     model: Garment,
            //     as: 'garment'
            // },
            {
                model: Brand,
                as: 'acsbrand'
            },
            {
                model: Country,
                as: 'acscountry'
            },
            {
                model: State,
                as: 'acsstate'
            },
            ],
            where: { id: req.query.id }
        });
        res.sendSuccess(res, data)
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
    }
}

const getUnRegisteredDevices = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { firstName: { [Op.iLike]: `%${searchTerm}%` } },
                { lastName: { [Op.iLike]: `%${searchTerm}%` } },
                { mobile_no: { [Op.iLike]: `%${searchTerm}%` } },
                { device_id: { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }
        whereCondition.status = false;
        if (req.query.pagination === "true") {
            const { count, rows } = await UserRegistrations.findAndCountAll({
                where: whereCondition,
                order: [
                    ['id', 'desc']
                ],
                limit: limit,
                offset: offset
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const data = await UserRegistrations.findAll({
                where: whereCondition,
                order: [
                    ['id', 'desc']
                ],
            });
            return res.sendSuccess(res, data)
        }
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
}

const getUnRegisteredOne = async (req: Request, res: Response) => {
    try {
        const data = await UserRegistrations.findOne({
            where: { id: req.query.id }
        });
        res.sendSuccess(res, data)
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
    }
}

const agentLogin = async (req: Request, res: Response) => {
    try {
        if (!req.body.username) {
            return res.sendError(res, 'Please enter a user name')
        } else if (!req.body.password) {
            return res.sendError(res, 'Please enter a password')
        } else if (!req.body.deviceId) {
            return res.sendError(res, 'Please enter a device Id')
        }
        const user = await UserApp.findOne({
            include: [{
                model: UserRegistrations,
                as: 'registrations',
                attributes: [],
                where: {
                    status: true,
                    device_id: req.body.username !== 'admin' ? req.body.deviceId : null
                }
            }],
            where: {
                username: req.body.username,
            }
        });
        if (!user) {
            return res.sendError(res, "Invalid username or deviceId");
        }
        let verifyPassword = await hash.compare(req.body.password, user.dataValues.password)
        if (!verifyPassword) { return res.sendError(res, "Invalid Password"); };
        var { accessToken } = await generateTokens(user.dataValues.id, user.dataValues.access_level);
        return res.sendSuccess(res, { accessToken, user })
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }

}

const profile = async (req: Request, res: Response) => {
    try {
        if (!req.query.id) {
            return res.sendError(res, 'Please send user id')
        }
        const data = await UserApp.findOne({
            include: [{
                model: UserRegistrations,
                as: 'registrations'
            }],
            where: { id: req.query.id }
        });
        res.sendSuccess(res, data)
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
}

const fetchAgentTransactions = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const sortOrder = req.query.sort || "desc";
    //   const sortField = req.query.sortBy || '';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status: string = req.query.status as string;
    const countryId: string = req.query.countryId as string;
    const brandId: string = req.query.brandId as string;
    const farmGroupId: string = req.query.farmGroupId as string;
    const seasonId: string = req.query.seasonId as string;
    const programId: string = req.query.programId as string;
    const mandiId: string = req.query.mandiId as string;
    const farmerId: string = req.query.farmerId as string;
    const villageId: string = req.query.villageId as string;
    const agentId: string = req.query.agentId as string;
    const { endDate, startDate, transactionVia }: any = req.query;
    const whereCondition: any = {};

    try {
        // apply filters
        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id) => parseInt(id, 10));
            whereCondition.country_id = { [Op.in]: idArray };
        }

        if (villageId) {
            const idArray: number[] = villageId
                .split(",")
                .map((id) => parseInt(id, 10));
            whereCondition.village_id = { [Op.in]: idArray };
        }

        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id) => parseInt(id, 10));
            whereCondition.brand_id = { [Op.in]: idArray };
        }
        if (farmGroupId) {
            const idArray: number[] = farmGroupId
                .split(",")
                .map((id) => parseInt(id, 10));
            whereCondition["$farmer.farmGroup_id$"] = { [Op.in]: idArray };
        }
        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id) => parseInt(id, 10));
            whereCondition.season_id = { [Op.in]: idArray };
        }

        if (farmerId) {
            const idArray: number[] = farmerId
                .split(",")
                .map((id) => parseInt(id, 10));
            whereCondition.farmer_id = { [Op.in]: idArray };
        }

        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id) => parseInt(id, 10));
            whereCondition.program_id = { [Op.in]: idArray };
        }

        if (mandiId) {
            const idArray: number[] = mandiId
                .split(",")
                .map((id) => parseInt(id, 10));
            whereCondition.mapped_mandi = { [Op.in]: idArray };
        }
        whereCondition.agent_id = { [Op.not]: null };

        if (agentId) {
            const idArray: number[] = agentId
                .split(",")
                .map((id) => parseInt(id, 10));
            whereCondition.agent_id = { [Op.in]: idArray };
        }

        if (startDate && endDate) {
            const startOfDay = new Date(startDate);
            startOfDay.setUTCHours(0, 0, 0, 0);
            const endOfDay = new Date(endDate);
            endOfDay.setUTCHours(23, 59, 59, 999);
            whereCondition.date = { [Op.between]: [startOfDay, endOfDay] }
        }

        if (status) {
            whereCondition.status = status;
        }

        // apply search
        if (searchTerm) {
            whereCondition[Op.or] = [
                { farmer_code: { [Op.iLike]: `%${searchTerm}%` } },
                { farmer_name: { [Op.iLike]: `%${searchTerm}%` } },
                { total_amount: { [Op.iLike]: `%${searchTerm}%` } },
                { rate: { [Op.iLike]: `%${searchTerm}%` } },
                { qty_purchased: { [Op.iLike]: `%${searchTerm}%` } },
                { vehicle: { [Op.iLike]: `%${searchTerm}%` } },
                { payment_method: { [Op.iLike]: `%${searchTerm}%` } },
                { "$block.block_name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$country.county_name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$state.state_name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$village.village_name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$district.district_name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$farmer.firstName$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$mandi.name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$agent.firstName$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }

        let queryOptions: any = {
            where: whereCondition,
            include: [
                {
                    model: Village,
                    as: "village",
                    attributes: ['id', 'village_name']
                },
                {
                    model: Block,
                    as: "block",
                    attributes: ['id', 'block_name']
                },
                {
                    model: District,
                    as: "district",
                    attributes: ['id', 'district_name']
                },
                {
                    model: State,
                    as: "state",
                    attributes: ['id', 'state_name']
                },
                {
                    model: Country,
                    as: "country",
                    attributes: ['id', 'county_name']
                },
                {
                    model: Farmer,
                    as: "farmer",
                },
                {
                    model: Program,
                    as: "program",
                    attributes: ['id', 'program_name']
                },
                {
                    model: Brand,
                    as: "brand",
                    attributes: ['id', 'brand_name']
                },
                {
                    model: Mandi,
                    as: "mandi",
                    attributes: ['id', 'name', 'address']
                },
                {
                    model: CropGrade,
                    as: "grade",
                    attributes: ['id', 'cropGrade']
                },
                {
                    model: Season,
                    as: "season",
                    attributes: ['id', 'name']
                },
                {
                    model: Farm,
                    as: "farm"
                },
                {
                    model: UserApp,
                    as: "agent"
                },
            ],
        };

        if (sortOrder === "asc" || sortOrder === "desc") {
            queryOptions.order = [["id", sortOrder]];
        }

        // apply pagination
        if (req.query.pagination === "true") {
            queryOptions.offset = offset;
            queryOptions.limit = limit;

            const { count, rows } = await Transaction.findAndCountAll(queryOptions);

            return res.sendPaginationSuccess(res, rows, count);
        } else {
            // fetch without filters
            const transaction = await Transaction.findAll(queryOptions);
            return res.sendSuccess(res, transaction);
        }
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
};

//Export the agent transactions details through excel file
const exportAgentTransactions = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "excel-agent-transactions.xlsx");

    try {
        const searchTerm = req.query.search || "";
        const sortOrder = req.query.sort || "desc";
        //   const sortField = req.query.sortBy || '';
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const status: string = req.query.status as string;
        const countryId: string = req.query.countryId as string;
        const brandId: string = req.query.brandId as string;
        const farmGroupId: string = req.query.farmGroupId as string;
        const seasonId: string = req.query.seasonId as string;
        const programId: string = req.query.programId as string;
        const mandiId: string = req.query.mandiId as string;
        const farmerId: string = req.query.farmerId as string;
        const villageId: string = req.query.villageId as string;
        const agentId: string = req.query.agentId as string;
        const { endDate, startDate, transactionVia, exportType }: any = req.query;

        if (exportType === "all") {

            return res.status(200).send({
                success: true,
                messgage: "File successfully Generated",
                data: process.env.BASE_URL + "agent-transactions.xlsx",
            });

        } else {
            // Create the excel workbook file
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Sheet1");
            worksheet.mergeCells('A1:S1');
            const mergedCell = worksheet.getCell('A1');
            mergedCell.value = 'Cotton Connect | QR App Procurement Report';
            mergedCell.font = { bold: true };
            mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
            // Set bold font for header row
            const headerRow = worksheet.addRow([
                "Sr No.", 'Date', 'Farmer Code', 'Farmer Name', 'Season', 'Country',
                'State', 'District', 'Block', 'Village', 'Transaction Id', 'Quantity Purchased (Kgs)',
                'Available Paddy (Kgs)', 'Price/KG(Local Currency)', 'Program', 'Transport Vehicle No', 'Payment Method', 'Mandi Name', 'Agent'
            ]);
            headerRow.font = { bold: true };
            const whereCondition: any = {}
            if (searchTerm) {
                whereCondition[Op.or] = [
                    { farmer_code: { [Op.iLike]: `%${searchTerm}%` } },
                    { farmer_name: { [Op.iLike]: `%${searchTerm}%` } },
                    { total_amount: { [Op.iLike]: `%${searchTerm}%` } },
                    { rate: { [Op.iLike]: `%${searchTerm}%` } },
                    { qty_purchased: { [Op.iLike]: `%${searchTerm}%` } },
                    { vehicle: { [Op.iLike]: `%${searchTerm}%` } },
                    { payment_method: { [Op.iLike]: `%${searchTerm}%` } },
                    { "$block.block_name$": { [Op.iLike]: `%${searchTerm}%` } },
                    { "$country.county_name$": { [Op.iLike]: `%${searchTerm}%` } },
                    { "$state.state_name$": { [Op.iLike]: `%${searchTerm}%` } },
                    { "$village.village_name$": { [Op.iLike]: `%${searchTerm}%` } },
                    { "$district.district_name$": { [Op.iLike]: `%${searchTerm}%` } },
                    { "$farmer.firstName$": { [Op.iLike]: `%${searchTerm}%` } },
                    { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
                    { "$mandi.name$": { [Op.iLike]: `%${searchTerm}%` } },
                    { "$agent.firstName$": { [Op.iLike]: `%${searchTerm}%` } },
                    { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
                ];
            }
            // apply filters
            if (countryId) {
                const idArray: number[] = countryId
                    .split(",")
                    .map((id) => parseInt(id, 10));
                whereCondition.country_id = { [Op.in]: idArray };
            }

            if (villageId) {
                const idArray: number[] = villageId
                    .split(",")
                    .map((id) => parseInt(id, 10));
                whereCondition.village_id = { [Op.in]: idArray };
            }

            if (brandId) {
                const idArray: number[] = brandId
                    .split(",")
                    .map((id) => parseInt(id, 10));
                whereCondition.brand_id = { [Op.in]: idArray };
            }
            if (farmGroupId) {
                const idArray: number[] = farmGroupId
                    .split(",")
                    .map((id) => parseInt(id, 10));
                whereCondition["$farmer.farmGroup_id$"] = { [Op.in]: idArray };
            }
            if (seasonId) {
                const idArray: number[] = seasonId
                    .split(",")
                    .map((id) => parseInt(id, 10));
                whereCondition.season_id = { [Op.in]: idArray };
            }

            if (farmerId) {
                const idArray: number[] = farmerId
                    .split(",")
                    .map((id) => parseInt(id, 10));
                whereCondition.farmer_id = { [Op.in]: idArray };
            }

            if (programId) {
                const idArray: number[] = programId
                    .split(",")
                    .map((id) => parseInt(id, 10));
                whereCondition.program_id = { [Op.in]: idArray };
            }

            if (mandiId) {
                const idArray: number[] = mandiId
                    .split(",")
                    .map((id) => parseInt(id, 10));
                whereCondition.mapped_mandi = { [Op.in]: idArray };
            }
            whereCondition.agent_id = { [Op.not]: null };


            if (agentId) {
                const idArray: number[] = agentId
                    .split(",")
                    .map((id) => parseInt(id, 10));
                whereCondition.agent_id = { [Op.in]: idArray };
            }
            if (startDate && endDate) {
                const startOfDay = new Date(startDate);
                startOfDay.setUTCHours(0, 0, 0, 0);
                const endOfDay = new Date(endDate);
                endOfDay.setUTCHours(23, 59, 59, 999);
                whereCondition.date = { [Op.between]: [startOfDay, endOfDay] }
            }

            if (status) {
                whereCondition.status = status;
            }

            let queryOptions: any = {
                where: whereCondition,
                include: [
                    {
                        model: Village,
                        as: "village",
                        attributes: ['id', 'village_name']
                    },
                    {
                        model: Block,
                        as: "block",
                        attributes: ['id', 'block_name']
                    },
                    {
                        model: District,
                        as: "district",
                        attributes: ['id', 'district_name']
                    },
                    {
                        model: State,
                        as: "state",
                        attributes: ['id', 'state_name']
                    },
                    {
                        model: Country,
                        as: "country",
                        attributes: ['id', 'county_name']
                    },
                    {
                        model: Farmer,
                        as: "farmer",
                    },
                    {
                        model: Program,
                        as: "program",
                        attributes: ['id', 'program_name']
                    },
                    {
                        model: Brand,
                        as: "brand",
                        attributes: ['id', 'brand_name']
                    },
                    {
                        model: Mandi,
                        as: "mandi",
                        attributes: ['id', 'name', 'address']
                    },
                    {
                        model: CropGrade,
                        as: "grade",
                        attributes: ['id', 'cropGrade']
                    },
                    {
                        model: Season,
                        as: "season",
                        attributes: ['id', 'name']
                    },
                    {
                        model: Farm,
                        as: "farm"
                    },
                    {
                        model: UserApp,
                        as: "agent"
                    },
                ],
            };

            if (sortOrder === "asc" || sortOrder === "desc") {
                queryOptions.order = [["id", sortOrder]];
            }

            let transactions: any;

            if (req.query.pagination === "true") {
                queryOptions.offset = offset;
                queryOptions.limit = limit;

                const { count, rows } = await Transaction.findAndCountAll(queryOptions);

                transactions = rows;
            } else {
                // fetch without filters
                transactions = await Transaction.findAll(queryOptions);
            }

            // Append data to worksheet
            for await (const [index, item] of transactions.entries()) {
                const rowValues = Object.values({
                    index: index + 1,
                    date: moment(item.date).format('DD/MM/YYYY'),
                    farmerCode: item.farmer ? item.farmer?.code : "",
                    farmerName: item.farmer ? item.farmer?.firstName + ' ' + item.farmer?.lastName : "",
                    season: item.season ? item.season.name : "",
                    country: item.country ? item.country.county_name : "",
                    state: item.state ? item.state.state_name : "",
                    district: item.district ? item.district.district_name : "",
                    block: item.block ? item.block.block_name : "",
                    village: item.village ? item.village.village_name : "",
                    transactionId: item.id,
                    qty_purchased: item.qty_purchased,
                    available_paddy: item.farm ? (Number(item.farm.total_estimated_paddy) > Number(item.farm.paddy_transacted) ? Number(item.farm.total_estimated_paddy) - Number(item.farm.paddy_transacted) : 0) : 0,
                    rate: item.rate,
                    program: item.program ? item.program.program_name : "",
                    vehicle: item.vehicle ? item.vehicle : "",
                    payment_method: item.payment_method ? item.payment_method : "",
                    mandi: item.mandi ? item.mandi.name : "",
                    agent: item.agent ? item.agent.firstName : "",
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
                data: process.env.BASE_URL + "excel-agent-transactions.xlsx",
            });
        }
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};

function buildWhereClause(conditions: any, tableAlias: string = 'farmers'): string {
    const clauses: string[] = [];
    for (const key in conditions) {
        if (conditions.hasOwnProperty(key)) {
            const columnName = tableAlias === 'transactions' ? `${tableAlias}.${key}` : key;
            // clauses.push(`${columnName} IN ${JSON.stringify(conditions[key])}`);
            // Check if the condition value is an array
            if (Array.isArray(conditions[key])) {
                // If it's an array, use the IN clause
                const values = conditions[key].map((value: any) => JSON.stringify(value)).join(', ');
                clauses.push(`${columnName} IN (${values})`);
            } else {
                // If it's not an array, use a simple equality check
                clauses.push(`${columnName} = ${JSON.stringify(conditions[key])}`);
            }
        }
    }
    return clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
}

const fetchQrDashboard = async (req: Request, res: Response) => {
    const { villageId, programId, seasonId, brandId, countryId, stateId, blockId, districtId }: any = req.query;
    const whereCondition: any = {};

    try {
        // apply filters
        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.country_id = idArray;
        }
        if (stateId) {
            const idArray: number[] = stateId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.state_id = idArray;
        }
        if (districtId) {
            const idArray: number[] = districtId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.district_id = idArray;
        }
        if (blockId) {
            const idArray: number[] = blockId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.block_id = idArray;
        }

        if (villageId) {
            const idArray: number[] = villageId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.village_id = idArray;
        }

        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.brand_id = idArray;
        }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.season_id = idArray;
        }

        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.program_id = idArray;
        }

        let [data, qty_purchased, first, second, third, fourth, fifth]: any = await Promise.all([sequelize.query(
            `SELECT sum(estimated_paddy) as estimatedPaddy
            FROM transactions 
            INNER JOIN farmers ON transactions.farmer_id=farmers.id
            INNER JOIN farms ON transactions.farm_id=farms.id
            ${buildWhereClause(whereCondition, "transactions") ? buildWhereClause(whereCondition, "transactions") : ""}`,
        ),
        sequelize.query(
            `SELECT sum(CAST(qty_purchased AS DOUBLE PRECISION)) as seedPaddy
            FROM transactions 
            INNER JOIN farmers ON transactions.farmer_id=farmers.id
            INNER JOIN farms ON transactions.farm_id=farms.id
            ${buildWhereClause(whereCondition, "transactions") ? buildWhereClause(whereCondition, "transactions") + " AND transactions.agent_id IS NOT NULL" : "where transactions.agent_id IS NOT NULL"}`,
        ),
        sequelize.query(`SELECT count(*) as totalfarmer
        FROM farmers
        LEFT JOIN transactions  ON transactions.farmer_id=farmers.id
        LEFT JOIN farms ON transactions.farm_id=farms.id
        ${buildWhereClause(whereCondition, "transactions") ? buildWhereClause(whereCondition, "transactions") : ""}`),
        sequelize.query(`SELECT count(*) as second
        FROM farmers
        LEFT JOIN transactions ON transactions.farmer_id=farmers.id
        LEFT JOIN farms ON transactions.farm_id=farms.id
        ${buildWhereClause(whereCondition, "transactions") ? buildWhereClause(whereCondition, "transactions") + " AND transactions.agent_id IS NOT NULL" : "where transactions.agent_id IS NOT NULL"}`),
        sequelize.query(`SELECT COUNT(*) as third FROM (
            SELECT transactions.district_id, transactions.block_id, transactions.village_id, transactions.program_id, transactions.farmer_id, COUNT(transactions.farmer_id), farmers.brand_id, farms.season_id 
            FROM transactions
            LEFT JOIN farmers ON transactions.farmer_id=farmers.id
            LEFT JOIN farms ON transactions.farm_id=farms.id
            ${buildWhereClause(whereCondition, "transactions") ? buildWhereClause(whereCondition, "transactions") + " AND transactions.agent_id IS NOT NULL" : "where transactions.agent_id IS NOT NULL"}
            group by transactions.district_id, transactions.block_id, transactions.village_id, transactions.program_id, transactions.farmer_id, farmers.brand_id, farms.season_id having COUNT(transactions.farmer_id)=1 ) AS DerivedTableAlias`),
        sequelize.query(`SELECT COUNT(*) as fourth FROM (
                SELECT transactions.district_id, transactions.block_id, transactions.village_id, transactions.program_id, transactions.farmer_id, COUNT(transactions.farmer_id), farmers.brand_id, farms.season_id 
                FROM transactions
                LEFT JOIN farmers ON transactions.farmer_id=farmers.id
                LEFT JOIN farms ON transactions.farm_id=farms.id
                ${buildWhereClause(whereCondition, "transactions") ? buildWhereClause(whereCondition, "transactions") + " AND transactions.agent_id IS NOT NULL" : "where transactions.agent_id IS NOT NULL"}
                group by transactions.district_id, transactions.block_id, transactions.village_id, transactions.program_id, transactions.farmer_id, farmers.brand_id, farms.season_id having COUNT(transactions.farmer_id)=2 ) AS DerivedTableAlias`),
        sequelize.query(`SELECT COUNT(*) as fifth FROM (
                    SELECT transactions.district_id, transactions.block_id, transactions.village_id, transactions.program_id, transactions.farmer_id, COUNT(transactions.farmer_id), farmers.brand_id, farms.season_id 
                    FROM transactions
                    LEFT JOIN farmers ON transactions.farmer_id=farmers.id
                    LEFT JOIN farms ON transactions.farm_id=farms.id
                    ${buildWhereClause(whereCondition, "transactions") ? buildWhereClause(whereCondition, "transactions") + " AND transactions.agent_id IS NOT NULL" : "where transactions.agent_id IS NOT NULL"}
                    group by transactions.district_id, transactions.block_id, transactions.village_id, transactions.program_id, transactions.farmer_id, farmers.brand_id, farms.season_id having COUNT(transactions.farmer_id)=3 ) AS DerivedTableAlias`)
        ])
        
        res.sendSuccess(res, {
            ...data[0][0], ...qty_purchased[0][0],
            ...first[0][0], ...second[0][0],
            ...third[0][0], ...fourth[0][0],
            ...fifth[0][0]
        })

    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
};

const farmerByQrCode = async (req: Request, res: Response) => {
    try {
        if (!req.query.text) {
            return res.sendError(res, "Need query text");
        }
        let data: any = decrypt(req.query.text);
        let farmer = await Farmer.findOne({
            where: { id: data },
            include: [
                {
                    model: Program,
                    as: "program",
                    attributes: ["id", "program_name"],
                },
                {
                    model: Brand,
                    as: "brand",
                    attributes: ["id", "brand_name", "address"],
                },
                {
                    model: Country,
                    as: "country",
                    attributes: ["id", "county_name"],
                },
                {
                    model: Village,
                    as: "village",
                    attributes: ["id", "village_name"],
                },
                {
                    model: State,
                    as: "state",
                    attributes: ["id", "state_name"],
                },
                {
                    model: District,
                    as: "district",
                    attributes: ["id", "district_name"],
                },
                {
                    model: Block,
                    as: "block",
                    attributes: ["id", "block_name"]
                }
            ]
        });
        if (!farmer) {
            return res.sendError(res, "NO_FARMER_FOUND");
        }
        let farm = await Farm.findAll({ where: { farmer_id: farmer.dataValues.id } })
        return res.sendSuccess(res, { ...farmer.dataValues, farm });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
}

const createUserApp = async (req: Request, res: Response) => {
    try {
        const data = {
            username: req.body.username,
            password: await hash.generate(req.body.password),
            firstName: req.body.firstName || "",
            lastName: req.body.lastName || "",
            mobile_no: req.body.mobile,
            access_level: req.body.accessLevel,
            user_reg_id: req.body.userRegId,
            email: req.body.email,
            program: req.body.programId,
            agent_id: req.body.agentId ? req.body.agentId : null,
            mandi_id: req.body.mandiId ? req.body.mandiId : null,
            mill_id: req.body.millId ? req.body.millId : null,
            // weaver_id: req.body.weaverId ? req.body.weaverId : null,
            cms_id: req.body.cmsId ? req.body.cmsId : null,
            // garment_id: req.body.garmentId ? req.body.garmentId : null,
            acs_country_id: req.body.countryId ? req.body.countryId : null,
            acs_state_id: req.body.stateId ? req.body.stateId : null,
            acs_district: req.body.districtsId ? req.body.districtsId : null,
            acs_block: req.body.blocksId ? req.body.blocksId : null,
            acs_village: req.body.villagesId ? req.body.villagesId : null,
            acs_all_village: req.body.allVillage ? req.body.allVillage : false,
            acs_mandi: req.body.acsMandi ? req.body.acsMandi : null,
            acs_brand: req.body.brandId ? req.body.brandId : null,
            platform: req.body.platform,
            status: req.body.status,
        }

        const userApp = await UserApp.create(data);

        if (userApp) {
            const userRegis = await UserRegistrations.update({ status: true }, {
                where: {
                    id: req.body.userRegId
                }
            });
        }
        return res.sendSuccess(res, userApp)
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
}

const updateUserApp = async (req: Request, res: Response) => {
    try {
        const userExist = await UserApp.findByPk(req.body.id);

        if (!userExist) {
            return res.sendError(res, "APP USER NOT EXIST");
        }

        const data = {
            username: req.body.username,
            password: req.body.password !== "" ? await hash.generate(req.body.password) : userExist.password,
            firstName: req.body.firstName || "",
            lastName: req.body.lastName || "",
            mobile_no: req.body.mobile,
            access_level: req.body.accessLevel,
            user_reg_id: req.body.userRegId,
            email: req.body.email,
            program: req.body.programId,
            agent_id: req.body.agentId ? req.body.agentId : null,
            mandi_id: req.body.mandiId ? req.body.mandiId : null,
            mill_id: req.body.millId ? req.body.millId : null,
            // weaver_id: req.body.weaverId ? req.body.weaverId : null,
            cms_id: req.body.cmsId ? req.body.cmsId : null,
            // garment_id: req.body.garmentId ? req.body.garmentId : null,
            acs_country_id: req.body.countryId ? req.body.countryId : null,
            acs_state_id: req.body.stateId ? req.body.stateId : null,
            acs_district: req.body.districtsId ? req.body.districtsId : null,
            acs_block: req.body.blocksId ? req.body.blocksId : null,
            acs_village: req.body.villagesId ? req.body.villagesId : null,
            acs_all_village: req.body.allVillage ? req.body.allVillage : false,
            acs_mandi: req.body.acsMandi ? req.body.acsMandi : null,
            acs_brand: req.body.brandId ? req.body.brandId : null,
            platform: req.body.platform,
            status: req.body.status,
        }

        const userApp = await UserApp.update(data, { where: { id: req.body.id } });
        return res.sendSuccess(res, userApp)
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
}


const deleteUserApp = async (req: Request, res: Response) => {
    try {
        const userExist = await UserApp.findByPk(req.body.id);

        if (!userExist) {
            return res.sendError(res, "APP USER NOT EXIST");
        }
        
        const userApp = await UserApp.destroy({ where: { id: req.body.id } });

        if (userExist) {
            const userRegis = await UserRegistrations.destroy({
                where: {
                    id: userExist?.dataValues?.user_reg_id
                }
            });
        }

        return res.sendSuccess(res, userApp)
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
}

const findUser = async (req: Request, res: Response) => {
    try {
        let user
        if (req.body.username) {
            if (req.body.id) {
                user = await UserApp.findOne({ where: { username: { [Op.iLike]: req.body.username }, id: { [Op.ne]: req.body.id } } })
            } else {
                user = await UserApp.findOne({ where: { username: { [Op.iLike]: req.body.username } } })
            }

        } else {
            if (req.body.id) {
                user = await UserApp.findOne({ where: { email: req.body.email, id: { [Op.ne]: req.body.id } } })
            } else {
                user = await UserApp.findOne({ where: { email: req.body.email } })
            }
        }
        return res.sendSuccess(res, { user: user ? true : false });
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}

const fetchAgentList = async (req: Request, res: Response) => {
    const { program }: any = req.query;
    const whereCondition: any = {};
    try {
        if (program === 'REEL') {
            whereCondition.program_name = "REEL"
        }

        const data = await UserApp.findAll({
            include: [
                {
                    model: UserRegistrations,
                    as: "registrations",
                },
                {
                    model: Program,
                    as: "programs",
                    where: whereCondition,
                },
            ],
            where: { access_level: "Agent" },
        });
        return res.sendSuccess(res, data);
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}



export {
    getRegisteredDevices,
    getUnRegisteredDevices,
    getRegisteredOne,
    getUnRegisteredOne,
    fetchAgentTransactions,
    exportAgentTransactions,
    agentLogin,
    profile,
    fetchQrDashboard,
    farmerByQrCode,
    createUserApp,
    updateUserApp,
    deleteUserApp,
    findUser,
    fetchAgentList
}