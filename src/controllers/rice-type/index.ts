import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";

import RiceType from "../../models/rice-type.model";


const createRiceType = async (req: Request, res: Response) => {
    try {
        const data = {
            riceType_name: req.body.riceTypeName,
            riceType_status: true
        };
        const ricetype = await RiceType.create(data);
        res.sendSuccess(res, ricetype);
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const createRiceTypes = async (req: Request, res: Response) => {
    try {
        // create multiple RiceTypes at the time
        let pass = [];
        let fail = [];
        for await (const obj of req.body.riceTypeName) {
            let result = await RiceType.findOne({ where: { riceType_name: { [Op.iLike]: obj } } })
            if (result) {
                fail.push({ data: result });
            } else {
                const result = await RiceType.create({ riceType_name: obj, riceType_status: true });
                pass.push({ data: result });
            }
        }
        res.sendSuccess(res, { pass, fail });
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const fetchRiceTypePagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status || '';
    const whereCondition: any = {};
    try {

        if (status === 'true') {
            whereCondition.riceType_status = true;
        }
        if (searchTerm) {
            whereCondition.riceType_name = { [Op.iLike]: `%${searchTerm}%` }
        }
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await RiceType.findAndCountAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const department = await RiceType.findAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
            });
            return res.sendSuccess(res, department);
        }

    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}


const updateRiceType = async (req: Request, res: Response) => {
    try {
        let result = await RiceType.findOne({ where: { riceType_name: { [Op.iLike]: req.body.riceTypeName }, id: { [Op.ne]: req.body.id } } })
        if (result) {
            return res.sendError(res, "ALREADY_EXITS");
        }
        const ricetype = await RiceType.update({
            riceType_name: req.body.riceTypeName
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { ricetype });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const updateRiceTypeStatus = async (req: Request, res: Response) => {
    try {

        const ricetype = await RiceType.update({ riceType_status: req.body.status }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { ricetype });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteRiceType = async (req: Request, res: Response) => {
    try {
        const ricetype = await RiceType.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { ricetype });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const checkRiceTypes = async (req: Request, res: Response) => {
    try {
        let whereCondition: any = {}
        if (req.body.id) {
            whereCondition = { riceType_name: { [Op.iLike]: req.body.riceTypeName }, id: { [Op.ne]: req.body.id } }
        } else {
            whereCondition = { riceType_name: { [Op.iLike]: req.body.riceTypeName } }
        }
        let result = await RiceType.findOne({ where: whereCondition })

        res.sendSuccess(res, result ? { exist: true } : { exist: false });
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
    }
}


export {
    createRiceType,
    checkRiceTypes,
    createRiceTypes,
    fetchRiceTypePagination,
    updateRiceType,
    updateRiceTypeStatus,
    deleteRiceType
};