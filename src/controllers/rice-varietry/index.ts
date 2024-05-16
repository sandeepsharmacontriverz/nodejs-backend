import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";

import RiceVariety from "../../models/rice-variety.model";


const createVariety = async (req: Request, res: Response) => {
    try {
        const data = {
            variety_name: req.body.varietyName,
            variety_status: true
        };
        const variety = await RiceVariety.create(data);
        res.sendSuccess(res, variety);
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const createVarieties = async (req: Request, res: Response) => {
    try {
        // create multiple Varieties at the time
        let pass = [];
        let fail = [];
        for await (const obj of req.body.varietyName) {
            let result = await RiceVariety.findOne({ where: { variety_name: { [Op.iLike]: obj } } })
            if (result) {
                fail.push({ data: result });
            } else {
                const result = await RiceVariety.create({ variety_name: obj, variety_status: true });
                pass.push({ data: result });
            }
        }
        res.sendSuccess(res, { pass, fail });
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const fetchVarietyPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status || '';
    const whereCondition: any = {};
    try {

        if (status === 'true') {
            whereCondition.variety_status = true;
        }
        if (searchTerm) {
            whereCondition.variety_name = { [Op.iLike]: `%${searchTerm}%` }
        }
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await RiceVariety.findAndCountAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const ricevariety = await RiceVariety.findAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
            });
            return res.sendSuccess(res, ricevariety);
        }

    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}


const updateVariety = async (req: Request, res: Response) => {
    try {
        let result = await RiceVariety.findOne({ where: { variety_name: { [Op.iLike]: req.body.varietyName }, id: { [Op.ne]: req.body.id } } })
        if (result) {
            return res.sendError(res, "ALREADY_EXITS");
        }
        const ricevariety = await RiceVariety.update({
            variety_name: req.body.varietyName
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { ricevariety });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const updateVarietyStatus = async (req: Request, res: Response) => {
    try {

        const ricevariety = await RiceVariety.update({ variety_status: req.body.status }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { ricevariety });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteVariety = async (req: Request, res: Response) => {
    try {
        const ricevariety= await RiceVariety.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { ricevariety });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const checkVarieties = async (req: Request, res: Response) => {
    try {
        let whereCondition: any = {}
        if (req.body.id) {
            whereCondition = { variety_name: { [Op.iLike]: req.body.varietyName }, id: { [Op.ne]: req.body.id } }
        } else {
            whereCondition = { variety_name: { [Op.iLike]: req.body.varietyName } }
        }
        let result = await RiceVariety.findOne({ where: whereCondition })

        res.sendSuccess(res, result ? { exist: true } : { exist: false });
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
    }
}


export {
    createVariety,
    checkVarieties,
    createVarieties,
    fetchVarietyPagination,
    updateVariety,
    updateVarietyStatus,
    deleteVariety
};