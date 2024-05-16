import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import Mill from "../../../models/mills.model";
import User from "../../../models/user.model";
import hash from "../../../util/hash";
import Country from "../../../models/country.model";
import State from "../../../models/state.model";
import Program from "../../../models/program.model";
import UnitCertification from "../../../models/unit-certification.model";
import Brand from "../../../models/brand.model";
// import YarnCount from "../../../models/yarn-count.model";
import UserRole from "../../../models/user-role.model";
import District from "../../../models/district.model";
import RiceType from "../../../models/rice-type.model";
import RiceVariety from "../../../models/rice-variety.model";


const createMIllProcess = async (req: Request, res: Response) => {
    try {
        let userIds = [];
        for await (let user of req.body.userData) {
            const userData = {
                firstname: user.firstname,
                lastname: user.lastname ? user.lastname : ' ',
                position: user.position,
                email: user.email,
                password: await hash.generate(user.password),
                status: user.status,
                username: user.username,
                process_role: user.process_role ? user.process_role : [],
                mobile: user.mobile
            };
            const result = await User.create(userData);
            userIds.push(result.id);
        }
        const brandData = {
            name: req.body.name,
            short_name: req.body.shortName,
            address: req.body.address,
            country_id: req.body.countryId,
            state_id: req.body.stateId,
            district_id: req.body.districtId,
            program_id: req.body.programIds,
            latitude: req.body.latitude,
            longitude: req.body.latitude,
            website: req.body.website,
            contact_person: req.body.contactPerson,
            unit_cert: req.body.unitCert,
            company_info: req.body.companyInfo,
            org_logo: req.body.logo,
            org_photo: req.body.photo,
            certs: req.body.certs,
            brand: req.body.brand,
            mobile: req.body.mobile,
            landline: req.body.landline,
            email: req.body.email,
            registration_document: req.body.registrationDocument,
            rice_type: req.body.riceType,
            realisation_range_from: req.body.rangeFrom,
            realisation_range_to: req.body.rangeTo,
            rice_variety: req.body.riceVariety,
            millUser_id: userIds,
        }
        const mill = await Mill.create(brandData);
        res.sendSuccess(res, mill);
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}

const fetchMIllProcessPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'asc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const countryId: any = req.query.countryId;
    const stateId: any = req.query.stateId;
    const brandId: any = req.query.brandId;
    const offset = (page - 1) * limit;
    const whereCondition: any = {}
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { name: { [Op.iLike]: `%${searchTerm}%` } }, // Search by name 
                { address: { [Op.iLike]: `%${searchTerm}%` } }, // Search by address
                { '$country.county_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by country name
                { '$state.state_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by state name
                { '$district.district_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by district name 
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
        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.brand = { [Op.overlap]: idArray }
        }
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await Mill.findAndCountAll({
                where: whereCondition,
                order: [
                    ['id', 'desc'], // Sort the results based on the 'name' field and the specified order
                ],
                include: [
                    {
                        model: Country, as: 'country'
                    },
                    {
                        model: State, as: 'state'
                    },
                    {
                        model: District, as: 'district'
                    },
                ],
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const cooperative = await Mill.findAll({
                where: whereCondition,
                include: [
                    {
                        model: Country, as: 'country'
                    },
                    {
                        model: State, as: 'state'
                    },
                    {
                        model: District, as: 'district'
                    },
                ],
                order: [
                    ['id', 'desc'], // Sort the results based on the 'name' field and the specified order
                ]
            });
            return res.sendSuccess(res, cooperative);
        }
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}

const fetchMIllProcess = async (req: Request, res: Response) => {
    try {
        const result = await Mill.findOne({
            where: {
                id: req.query.id
            },
            include: [
                {
                    model: Country, as: 'country'
                },
                {
                    model: State, as: 'state'
                },
                {
                    model: District, as: 'district'
                },
            ]
        });
        let userData = [];
        let programs;
        let unitCerts;
        let brands;
        let riceType;
        let riceVariety;
        // let yarnCount;
        if (result) {
            for await (let user of result.millUser_id) {
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
                userData.push(us)
            }
            programs = await Program.findAll({
                where: { id: result.program_id },
            });

            unitCerts = await UnitCertification.findAll({
                where: { id: result.unit_cert },
            });

            brands = await Brand.findAll({
                where: { id: result.brand },
            });

            if (result.rice_type) {
                const idArray: number[] = result.rice_type
                    .split(",")
                    .map((id: any) => parseInt(id, 10));
                riceType = await RiceType.findAll({
                    where: { id: { [Op.in]: idArray } },
                });
            }
            
            if (result.rice_variety) {
                const idArray: number[] = result.rice_variety
                    .split(",")
                    .map((id: any) => parseInt(id, 10));
                console.log("idArray-------->",idArray)
                riceVariety = await RiceVariety.findAll({
                    where: { id: { [Op.in]: idArray } },
                });
                console.log("riceVariety-------->",riceVariety)

            }

            // if (result.yarn_count_range) {
            //     const idArray: number[] = result.yarn_count_range
            //         .split(",")
            //         .map((id: any) => parseInt(id, 10));
            //     yarnCount = await YarnCount.findAll({
            //         where: { id: { [Op.in]: idArray } },
            //     });
            // }
        }
        return res.sendSuccess(res, result ? { ...result.dataValues, userData, programs, unitCerts, brands, riceType, riceVariety } : null);

    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}


const updateMIllProcess = async (req: Request, res: Response) => {
    try {
        let userIds = [];
        for await (let user of req.body.userData) {
            const userData = {
                firstname: user.firstname,
                lastname: user.lastname,
                position: user.position,
                mobile: user.mobile,
                password: user.password ? await hash.generate(user.password) : undefined,
                status: user.status,
                role: user.role
            };
            if (user.id) {
                const result = await User.update(userData, { where: { id: user.id } });
                userIds.push(user.id);
            } else {
                const result = await User.create({ ...userData, username: user.username, email: user.email });
                userIds.push(result.id);
            }
        }
        const brandData = {
            name: req.body.name,
            short_name: req.body.shortName,
            address: req.body.address,
            country_id: req.body.countryId,
            state_id: req.body.stateId,
            program_id: req.body.programIds,
            latitude: req.body.latitude,
            longitude: req.body.latitude,
            website: req.body.website,
            contact_person: req.body.contactPerson,
            rice_type: req.body.riceType,
            realisation_range_from: req.body.rangeFrom,
            realisation_range_to: req.body.rangeTo,
            unit_cert: req.body.unitCert,
            company_info: req.body.companyInfo,
            org_logo: req.body.logo,
            org_photo: req.body.photo,
            certs: req.body.certs,
            brand: req.body.brand,
            mobile: req.body.mobile,
            landline: req.body.landline,
            email: req.body.email,
            rice_variety: req.body.riceVariety,
            millUser_id: userIds
        }
        const mill = await Mill.update(brandData, { where: { id: req.body.id } });
        res.sendSuccess(res, mill);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteMIllProcess = async (req: Request, res: Response) => {
    try {
        const mill = await Mill.findOne({
            where: {
                id: req.body.id
            },
        });

        const user = await User.findOne({
            where: {
                id: mill.millUser_id
            },
        });

        const userRole = await UserRole.findOne({
            where: Sequelize.where(
                Sequelize.fn('LOWER', Sequelize.col('user_role')),
                'mill'
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
        const mill_user = await Mill.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { mill_user });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const checkMIllProcess = async (req: Request, res: Response) => {
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
        const result = await Mill.findOne({
            where: whereCondition
        });
        res.sendSuccess(res, result ? { exist: true } : { exist: false });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


export {
    createMIllProcess,
    fetchMIllProcessPagination,
    updateMIllProcess,
    deleteMIllProcess,
    fetchMIllProcess,
    checkMIllProcess
};