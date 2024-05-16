import { Request, Response } from "express";
import { Op } from "sequelize";
import Mandi from "../../../models/mandi.model";
import User from "../../../models/user.model";
import hash from "../../../util/hash";
import UserRole from "../../../models/user-role.model";
import Mill from "../../../models/mills.model";
import ThirdPartyInspection from "../../../models/third-party-inspections.model";
import Lab from "../../../models/lab.model";
import ContainerManagementSystem from "../../../models/container-management-system.model";

const createProcessor = async (req: Request, res: Response) => {
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
                role: req.body.process_role[0],
                process_role: req.body.process_role,
                mobile: user.mobile
            };
            const result = await User.create(userData);
            userIds.push(result.id);
        }

        let mainData: any = [];
        let data = {
            name: req.body.name,
            short_name: req.body.shortName,
            address: req.body.address,
            country_id: req.body.countryId,
            state_id: req.body.stateId,
            district_id: req.body.districtId,
            program_id: req.body.programIds,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            website: req.body.website,
            org_logo: req.body.logo,
            org_photo: req.body.photo,
            unit_cert: req.body.unitCert,
            company_info: req.body.companyInfo,
            brand: req.body.brand,
            mobile: req.body.mobile,
            landline: req.body.landline,
            email: req.body.email,
            registration_document: req.body.registrationDocument,
            certs: req.body.certs,
            contact_person: req.body.contactPerson,
        }

        if (req.body.processType.includes('Mandi')) {
            let obj = {
                ...data,
                outturn_range_from: req.body.outturnRangeFrom,
                outturn_range_to: req.body.outturnRangeTo,
                bag_weight_from: req.body.bagWeightFrom,
                bag_weight_to: req.body.bagWeightTo,
                mandi_type: req.body.mandiType,
                mandiUser_id: userIds
            }

            const result = await Mandi.create(obj);
            mainData.push(result);
        }

        if (req.body.processType.includes('Mill')) {
            let obj = {
                ...data,
                rice_type: req.body.riceType ,
                realisation_range_from: req.body.rangeFrom,
                realisation_range_to: req.body.rangeTo,
                rice_variety: req.body.riceVariety,
                millUser_id: userIds,
            }

            const result = await Mill.create(obj);
            mainData.push(result);
        }

        if (req.body.processType.includes('Third_Party_Inspection')) {
            let obj = {
                ...data,
                ThirdPartyInspectionUser_id: userIds
            }

            const result = await ThirdPartyInspection.create(obj);
            mainData.push(result);
        }

        if (req.body.processType.includes('Lab')) {
            let obj = {
                ...data,
                LabUser_id: userIds
            }

            const result = await Lab.create(obj);
            mainData.push(result);
        }

        if (req.body.processType.includes('Container_Management_System')) {
            let obj = {
                ...data,
                containerManagmentUser_id: userIds
            }

            const result = await ContainerManagementSystem.create(obj);
            mainData.push(result);
        }

        res.sendSuccess(res, mainData);
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}

const fetchAllProcessor = async (req: Request, res: Response) => {
    try {
        if (!req.query.type) {
            return res.sendError(res, 'Need processor Type')
        }

        let userIds: any = [];
        let result;

        if (req.query.type === 'Mandi') {
            result = await Mandi.findOne({
                where: {
                    id: req.query.id
                }
            });
            if (result) {
                userIds = result.mandiUser_id;
            }
        }

        if (req.query.type === 'Mill') {
            result = await Mill.findOne({
                where: {
                    id: req.query.id
                }
            });
            if (result) {
                userIds = result.millUser_id;
            }
        }

        if (req.query.type === 'Third_Party_Inspection') {
            result = await ThirdPartyInspection.findOne({
                where: {
                    id: req.query.id
                }
            });
            if (result) {
                userIds = result.ThirdPartyInspectionUser_id;
            }
        }

        if (req.query.type === 'Lab') {

            result = await Lab.findOne({
                where: {
                    id: req.query.id
                }
            });
            if (result) {
                userIds = result.LabUser_id;
            }
        }

        if (req.query.type === 'Container_Management_System') {

            result = await ContainerManagementSystem.findOne({
                where: {
                    id: req.query.id
                }
            });
            if (result) {
                userIds = result.containerManagmentUser_id;
            }
        }

        let userData = [];
        // let [ginner, spinner, weaver, knitter, garment, trader, fabric, physical_partner] = await Promise.all([
            let [mandi, mill,lab, third_party_inspection, container_management_system] = await Promise.all([
            Mandi.findOne({ where: { mandiUser_id: { [Op.overlap]: userIds } } }),
            Mill.findOne({ where: { millUser_id: { [Op.overlap]: userIds } } }),
            Lab.findOne({ where: { LabUser_id: { [Op.overlap]: userIds } } }),
            ThirdPartyInspection.findOne({ where: { ThirdPartyInspectionUser_id: { [Op.overlap]: userIds } } }),
            ContainerManagementSystem.findOne({ where: { containerManagmentUser_id: { [Op.overlap]: userIds } } }),
        ]);

        if (result) {
            for await (let user of userIds) {
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
        }

        return res.sendSuccess(res, result ? { mandi, mill,lab, third_party_inspection,container_management_system, userData } : {});

    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}

const updateProcessor = async (req: Request, res: Response) => {
    try {
        let userIds = [];
        for await (let user of req.body.userData) {
            const userData = {
                firstname: user.firstname,
                lastname: user.lastname ? user.lastname : ' ',
                position: user.position,
                mobile: user.mobile,
                password: user.password ? await hash.generate(user.password) : undefined,
                status: user.status,
                role: req.body.process_role[0],
                process_role: req.body.process_role,
                id: user.id
            };
            if (user.id) {
                const result = await User.update(userData, { where: { id: user.id } });
                userIds.push(user.id);
            } else {
                const result = await User.create({ ...userData, username: user.username, email: user.email });
                userIds.push(result.id);
            }
        }

        let mainData: any = [];
        let data = {
            name: req.body.name,
            short_name: req.body.shortName,
            address: req.body.address,
            country_id: req.body.countryId,
            state_id: req.body.stateId,
            district_id: req.body.districtId,
            program_id: req.body.programIds,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            website: req.body.website,
            org_logo: req.body.logo,
            org_photo: req.body.photo,
            unit_cert: req.body.unitCert,
            company_info: req.body.companyInfo,
            brand: req.body.brand,
            mobile: req.body.mobile,
            landline: req.body.landline,
            email: req.body.email,
            registration_document: req.body.registrationDocument,
            certs: req.body.certs,
            contact_person: req.body.contactPerson,
        }

        if (req.body.processType.includes('Mandi')) {
            let obj = {
                ...data,
                outturn_range_from: req.body.outturnRangeFrom,
                outturn_range_to: req.body.outturnRangeTo,
                bag_weight_from: req.body.bagWeightFrom,
                bag_weight_to: req.body.bagWeightTo,
                mandi_type: req.body.mandiType,
                mandiUser_id: userIds
            }
            if (req.body.mandiId) {
                const result = await Mandi.update(obj, { where: { id: req.body.mandiId } });
                mainData.push(result);
            } else {
                const result = await Mandi.create(obj);
                mainData.push(result);
            }
        }

        if (req.body.processType.includes('Mill')) {
            let obj = {
                ...data,
                rice_type: req.body.riceType,
                realisation_range_from: req.body.rangeFrom,
                realisation_range_to: req.body.rangeTo,
                rice_variety: req.body.riceVariety,
                millUser_id: userIds,
            }
            if (req.body.millId) {
                const result = await Mill.update(obj, { where: { id: req.body.millId } });
                mainData.push(result);
            } else {
                const result = await Mill.create(obj);
                mainData.push(result);
            }
        }

        if (req.body.processType.includes('Third_Party_Inspection')) {
            let obj = {
                ...data,
                ThirdPartyInspectionUser_id: userIds
            }

            if (req.body.thirdPartyInspectionId) {
                const result = await ThirdPartyInspection.update(obj, { where: { id: req.body.thirdPartyInspectionId } });
                mainData.push(result);
            } else {
                const result = await ThirdPartyInspection.create(obj);
                mainData.push(result);
            }
        }

        if (req.body.processType.includes('Lab')) {
            let obj = {
                ...data,
                LabUser_id: userIds
            }

            if (req.body.labId) {
                const result = await Lab.update(obj, { where: { id: req.body.labId } });
                mainData.push(result);
            } else {
                const result = await Lab.create(obj);
                mainData.push(result);
            }
        }

        if (req.body.processType.includes('Container_Management_System')) {
            let obj = {
                ...data,
                containerManagmentUser_id: userIds
            }

            if (req.body.containerManagementSystemId) {
                const result = await ContainerManagementSystem.update(obj, { where: { id: req.body.containerManagementSystemId } });
                mainData.push(result);
            } else {
                const result = await ContainerManagementSystem.create(obj);
                mainData.push(result);
            }
        }

        if (req.body.deletedMandiId) {
            const result = await Mandi.update({ mandiUser_id: [] }, { where: { id: req.body.deletedMandiId } });
        }
        if (req.body.deletedMillId) {
            const result = await Mill.update({ millUser_id: [] }, { where: { id: req.body.deletedMillId } });
        }
        if (req.body.deletedThirtPartyInspectionId) {
            const result = await ThirdPartyInspection.update({ ThirdPartyInspectionUser_id: [] }, { where: { id: req.body.deletedThirtPartyInspectionId } });
        }
        if (req.body.deletedLabId) {
            const result = await Lab.update({ LabUser_id: [] }, { where: { id: req.body.deletedLabId } });
        }
        if (req.body.deletedContainerManagementSystemId) {
            const result = await ContainerManagementSystem.update({ knitterUser_id: [] }, { where: { id: req.body.deletedContainerManagementSystemId } });
        }

        res.sendSuccess(res, mainData);
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}

const checkProcessorName = async (req: Request, res: Response) => {
    try {
        let name = req.body.name;

        if (req.body.mandiId) {
            const result = await Mandi.findOne({ where: { name: { [Op.iLike]: name }, id: { [Op.ne]: req.body.mandiId } } });
            if (result) {
                return res.sendSuccess(res, { exist: true });
            }
        } else {
            const result = await Mandi.findOne({ where: { name: { [Op.iLike]: name } } });
            if (result) {
                return res.sendSuccess(res, { exist: true });
            }
        }

        if (req.body.millId) {
            const result = await Mill.findOne({ where: { name: { [Op.iLike]: name }, id: { [Op.ne]: req.body.millId } } });
            if (result) {
                return res.sendSuccess(res, { exist: true });
            }
        } else {
            const result = await Mill.findOne({ where: { name: { [Op.iLike]: name } } });
            if (result) {
                return res.sendSuccess(res, { exist: true });
            }
        }

        if (req.body.thirdPartyInspectionId) {
            const result = await ThirdPartyInspection.findOne({ where: { name: { [Op.iLike]: name }, id: { [Op.ne]: req.body.thirdPartyInspectionId } } });
            if (result) {
                return res.sendSuccess(res, { exist: true });
            }
        } else {
            const result = await ThirdPartyInspection.findOne({ where: { name: { [Op.iLike]: name } } });
            if (result) {
                return res.sendSuccess(res, { exist: true });
            }
        }

        if (req.body.LabId) {
            const result = await Lab.findOne({ where: { name: { [Op.iLike]: name }, id: { [Op.ne]: req.body.LabId } } });
            if (result) {
                return res.sendSuccess(res, { exist: true });
            }
        } else {
            const result = await Lab.findOne({ where: { name: { [Op.iLike]: name } } });
            if (result) {
                return res.sendSuccess(res, { exist: true });
            }
        }


        if (req.body.containerManagementSystemId) {
            const result = await ContainerManagementSystem.findOne({ where: { name: { [Op.iLike]: name }, id: { [Op.ne]: req.body.containerManagementSystemId } } });
            if (result) {
                return res.sendSuccess(res, { exist: true });
            }
        } else {
            const result = await ContainerManagementSystem.findOne({ where: { name: { [Op.iLike]: name } } });
            if (result) {
                return res.sendSuccess(res, { exist: true });
            }
        }


        res.sendSuccess(res, { exist: false });
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}

export {
    createProcessor,
    fetchAllProcessor,
    updateProcessor,
    checkProcessorName
}