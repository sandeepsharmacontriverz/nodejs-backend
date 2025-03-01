import { Request, Response } from "express";
import { Op, Sequelize } from "sequelize";
import ThirdPartyInspection from "../../../models/third-party-inspections.model";
import Country from "../../../models/country.model";
import District from "../../../models/district.model";
import State from "../../../models/state.model";
import User from "../../../models/user.model";
import UserRole from "../../../models/user-role.model";
import Program from "../../../models/program.model";
import UnitCertification from "../../../models/unit-certification.model";
import Brand from "../../../models/brand.model";

const fetchThirdPartyInspectionPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'asc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const countryId: any = req.query.countryId as string;
    const brandId: any = req.query.brandId;
    const stateId: any = req.query.stateId as string;
    const districtId: any = req.query.districtId as string;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};

    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { name: { [Op.iLike]: `%${searchTerm}%` } }, // Search by name
                { address: { [Op.iLike]: `%${searchTerm}%` } }, // Search by address
                { '$country.county_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by country name
                { '$state.state_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by state name
                { '$district.district_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by district name
                { website: { [Op.iLike]: `%${searchTerm}%` } }, // Search by address
                { contact_person: { [Op.iLike]: `%${searchTerm}%` } }, // Search by address
                { email: { [Op.iLike]: `%${searchTerm}%` } }, // Search by email
                { mobile: { [Op.iLike]: `%${searchTerm}%` } },// Search by mobile
                { landline: { [Op.iLike]: `%${searchTerm}%` } }// Search by landline
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
        if (districtId) {
            const idArray: number[] = districtId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.district_id = { [Op.in]: idArray };
        }
        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.brand = { [Op.overlap]: idArray }
        }

        if (req.query.pagination === "true") {
            let data: any = [];
            const { count, rows } = await ThirdPartyInspection.findAndCountAll({
                where: whereCondition,
                order: [
                    ['id', 'desc']
                ],
                include: [
                    { model: Country, as: 'country' },
                    { model: State, as: 'state' },
                    { model: District, as: 'district' }
                ],
                offset: offset,
                limit: limit
            });
            for await (let item of rows){
                let users = await User.findAll({
                    where: {
                        id: item?.dataValues?.ThirdPartyInspectionUser_id
                    }
                });

                let newStatus = users.some((user: any) => user.status === true);

                data.push({
                    ...item?.dataValues,
                    status: newStatus ? 'Active' : 'Inactive'
                });
            }
            return res.sendPaginationSuccess(res, data, count);
        } else {
            const result = await ThirdPartyInspection.findAll({
                where: whereCondition,
                include: [
                    { model: Country, as: 'country' },
                    { model: State, as: 'state' },
                    { model: District, as: 'district' }
                ],
                order: [
                    ['id', 'desc']
                ]
            });
            return res.sendSuccess(res, result);
        }
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}

const fetchThirdPartyInspection = async (req: Request, res: Response) => {
    try {
        const result = await ThirdPartyInspection.findOne({
            where: {
                id: req.query.id
            },
            include: [
                { model: Country, as: 'country' },
                { model: State, as: 'state' },
                { model: District, as: 'district' }
            ]
        });

        let userData = [];
        let programs;
        let unitCerts;
        let brands;

        if (result) {
            for await (let user of result.ThirdPartyInspectionUser_id) {
                let us = await User.findOne({
                    where: { id: user }, attributes: {
                        exclude: ["password", "createdAt", "updatedAt"]
                    },
                    include: [
                        {
                            model: UserRole,
                            as: "user_role",
                        }
                    ]
                });
                userData.push(us);
            }

            programs = await Program.findAll({
                where: { id: result.program_id }
            });

            unitCerts = await UnitCertification.findAll({
                where: { id: result.unit_cert }
            });

            brands = await Brand.findAll({
                where: { id: result.brand },
            });
        }

        return res.sendSuccess(res, result ? { ...result.dataValues, userData, programs, unitCerts, brands } : null);
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
      }
}

const deleteThirdPartyInspection = async (req: Request, res: Response) => {
    try {
        const partner = await ThirdPartyInspection.findOne({
            where: {
                id: req.body.id
            },
        });

        const user = await User.findOne({
            where: {
                id: partner.ThirdPartyInspectionUser_id
            },
        });

        const userRole = await UserRole.findOne({
            where: Sequelize.where(
                Sequelize.fn('LOWER', Sequelize.col('user_role')),
                'third_party_inspection'
            )
        });


        const updatedProcessRole = user.process_role.filter((roleId: any) => roleId !== userRole.id);

        if (updatedProcessRole.length > 0) {
            const updatedUser = await await user.update({
                process_role: updatedProcessRole,
                role: updatedProcessRole[0]
            });
        } else {
            await user.destroy();
        }
        const third_party_inspection = await ThirdPartyInspection.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { third_party_inspection });
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
      }
}

const checkThirdPartyInspection = async (req: Request, res: Response) => {
    try {
        let whereCondition = {};
        if (req.body.id) {
            whereCondition = {
                name: { [Op.iLike]: req.body.name },
                id: { [Op.ne]: req.body.id }
            }
        } else {
            whereCondition = {
                name: { [Op.iLike]: req.body.name },
            }
        }
        const result = await ThirdPartyInspection.findOne({
            where: whereCondition
        });
        res.sendSuccess(res, result ? { exist: true } : { exist: false });
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
      }
}

export {
    fetchThirdPartyInspectionPagination,
    fetchThirdPartyInspection,
    deleteThirdPartyInspection,
    checkThirdPartyInspection
}