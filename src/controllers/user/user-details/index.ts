import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import UserRole from "../../../models/user-role.model";
import UserPrivilege from "../../../models/userprivilege.model";
import UserCategory from "../../../models/user-category.model";
import MenuList from "../../../models/menu-list.model";
import User from "../../../models/user.model";
import { generateTokens } from "../../../util/auth";
import Brand from "../../../models/brand.model";
import Mandi from "../../../models/mandi.model";
import Mill from "../../../models/mills.model";
import ThirdPartyInspection from "../../../models/third-party-inspections.model";
import Lab from "../../../models/lab.model";
import ContainerManagementSystem from "../../../models/container-management-system.model";
// import PhysicalPartner from "../../../models/physical-partner.model";

const getUserInfo = async (req: Request, res: Response) => {
    try {
        const authenticatedReq = req as any;

        const user = await User.findByPk(authenticatedReq.user._id,
            { attributes: { exclude: ['password', 'createdAt', 'updatedAt'] } }
        );

        let role;
        role = await UserRole.findByPk(authenticatedReq.user.role, {
            include: [
                {
                    model: UserCategory,
                    as: 'userCategory',
                    attributes: ['id', 'category_name'], // Include only the name attribute of the category
                },
            ],
        });

        if (req.query.mandiId) {
            role = await UserRole.findOne({
                where: { user_role: 'Mandi' },
                include: [
                    {
                        model: UserCategory,
                        as: 'userCategory',
                        attributes: ['id', 'category_name'], // Include only the name attribute of the category
                    },
                ],
            });
            role = role.dataValues;
        }

        if (req.query.millId) {
            role = await UserRole.findOne({
                where: { user_role: 'Mill' },
                include: [
                    {
                        model: UserCategory,
                        as: 'userCategory',
                        attributes: ['id', 'category_name'], // Include only the name attribute of the category
                    },
                ],
            });
            role = role.dataValues;
        }

        if (req.query.containerManagementId) {
            role = await UserRole.findOne({
                where: { user_role: 'Container_Management_System' },
                include: [
                    {
                        model: UserCategory,
                        as: 'userCategory',
                        attributes: ['id', 'category_name'], // Include only the name attribute of the category
                    },
                ],
            });
            role = role.dataValues;
        }

        if (req.query.ThirdPartyInspectionId) {
            role = await UserRole.findOne({
                where: { user_role: 'Third_Party_Inspection' },
                include: [
                    {
                        model: UserCategory,
                        as: 'userCategory',
                        attributes: ['id', 'category_name'], // Include only the name attribute of the category
                    },
                ],
            });
            role = role.dataValues;
        }
            if (req.query.LabId) {
                role = await UserRole.findOne({
                    where: { user_role: 'Lab' },
                    include: [
                        {
                            model: UserCategory,
                            as: 'userCategory',
                            attributes: ['id', 'category_name'], // Include only the name attribute of the category
                        },
                    ],
                });
                role = role.dataValues;
            }

        let menuList = await MenuList.findAll(
            {
                where: {
                    categories_allowed: {
                        [Op.contains]: [role.userCategory.id],
                    },
                },
                order: [
                    ["id", 'asc'], // Sort the results based on the 'name' field and the specified order
                ],
                attributes: ['id', 'menu_name'],
            }
        );

        let privileges = await UserPrivilege.findAll({
            where: {
                userRole_id: role.id,
            },
            include: [
                {
                    model: MenuList,
                    as: 'menu',
                    attributes: ['menu_name'], // Include only the name attribute of the category
                },
            ],
        });

            let [mandi, mill, brand,lab, thirdPartyInspection, containerManagementSystem] = await Promise.all([
                Mandi.findOne({ where: { mandiUser_id: { [Op.contains]: [user.dataValues.id] } } }),
                Mill.findOne({ where: { millUser_id: { [Op.contains]: [user.dataValues.id] } } }),
                Brand.findOne({ where: { brandUser_id: { [Op.contains]: [user.dataValues.id] } } }),
                Lab.findOne({ where: { LabUser_id: { [Op.contains]: [user.dataValues.id] } } }),
                ThirdPartyInspection.findOne({ where: { ThirdPartyInspectionUser_id: { [Op.contains]: [user.dataValues.id] } } }),
                ContainerManagementSystem.findOne({ where: { containerManagmentUser_id: { [Op.contains]: [user.dataValues.id] } } }),
        ]);

        let processor = [];
        mandi ? processor.push('Mandi') : "";
        mill ? processor.push('Mill') : "";
        brand ? processor.push('Brand') : "";
        lab ? processor.push('Lab') : "";
        thirdPartyInspection ? processor.push('Third_Party_Inspection') : "";
        containerManagementSystem ? processor.push('Container_Management_System') : "";

        if (req.query.mandiId) {
            mandi = await Mandi.findOne({ where: { id: req.query.mandiId } })
        }
        if (req.query.millId) {
            mill = await Mill.findOne({ where: { id: req.query.millId } })
        }
        if (req.query.thirdPartyInspectionId) {
            thirdPartyInspection = await ThirdPartyInspection.findOne({ where: { id: req.query.thirdPartyInspectionId } })
        }
        if (req.query.labId) {
            lab = await Lab.findOne({ where: { id: req.query.labId } })
        }

        if (req.query.containerManagementId) {
            containerManagementSystem = await ContainerManagementSystem.findOne({ where: { id: req.query.containerManagementId } })
        }

        return res.sendSuccess(res, { user, role, menuList, privileges, brand,processor,mandi,mill,thirdPartyInspection,lab, containerManagementSystem });
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
    }
}

const processorLoginAdmin = async (req: Request, res: Response) => {
    try {
        let userId: any;
        let name = "Mandi"
        if (req.query.type === 'mandi') {
            name = "Mandi"
            let mandi = await Mandi.findOne({ where: { id: req.query.mandiId } });
            userId = mandi.dataValues.mandiUser_id
        }
        if (req.query.type === 'mill') {
            name = "Mill"
            let mill = await Mill.findOne({ where: { id: req.query.millId } });
            userId = mill.dataValues.millUser_id;
        }
        if (req.query.type === 'third-party-inspection') {
            name = "Third_Party_Inspection";
            let thirdPartyInspection = await ThirdPartyInspection.findOne({ where: { id: req.query.thirdPartyInspectionId } });
            userId = thirdPartyInspection.dataValues.ThirdPartyInspectionUser_id;
        }
        if (req.query.type === 'lab') {
            name = "Lab";
            let lab = await Lab.findOne({ where: { id: req.query.labId } });
            userId = lab.dataValues.LabUser_id
        }

        if (req.query.type === 'container-management-system') {
            name = "Container_Management_System";
            let containerManagementSystem = await ContainerManagementSystem.findOne({ where: { id: req.query.containerManagementSystemId } });
            userId = containerManagementSystem.dataValues.containerManagmentUser_id
        }

        if (req.query.type === 'brand') {
            let brand = await Brand.findOne({ where: { id: req.query.brandId } });
            userId = brand.dataValues.brandUser_id;
        }
        if (req.query.type !== 'brand') {
            let role = await UserRole.findOne({ where: { user_role: { [Op.iLike]: name } } });
            if (role) {
                const userupdate = await User.update({ role: role.dataValues.id }, { where: { id: userId } });
            }
        }

        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
            return res.sendError(res, "user not found");
        }
        if (user) {
            console.log(user.dataValues)
            var { accessToken } = await generateTokens(user.dataValues.id, user.dataValues.role);

            return res.sendSuccess(res, { accessToken: accessToken, user: user.dataValues });
        }
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
    }
}

export { getUserInfo, processorLoginAdmin }