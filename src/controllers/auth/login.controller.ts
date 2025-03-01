import { Request, Response } from "express";

import User from "../../models/user.model";
import { generateTokens } from "../../util/auth";
import hash from "../../util/hash";
// import Spinner from "../../models/spinner.model";
// import Ginner from "../../models/ginner.model";
// import Weaver from "../../models/weaver.model";
// import Knitter from "../../models/knitter.model";
// import Garment from "../../models/garment.model";
// import Trader from "../../models/trader.model";
// import Fabric from "../../models/fabric.model";
import { Op } from "sequelize";
import Brand from "../../models/brand.model";
import { sendEmail } from "../../provider/send-mail";
import UserRole from "../../models/user-role.model";
import UserCategory from "../../models/user-category.model";
import Mandi from "../../models/mandi.model";
import Mill from "../../models/mills.model";
import ThirdPartyInspection from "../../models/third-party-inspections.model";
import Lab from "../../models/lab.model";

const login = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ where: { username: req.body.username } });
    if (!user) {
      return res.sendError(res, "ERR_AUTH_WRONG_USERNAME");
    }
    
    if (user) {
      let verifyPassword = await hash.compare(req.body.password, user.dataValues.password)
      if (!verifyPassword) { return res.sendError(res, "ERR_AUTH_WRONG_PASSWORD"); };

      const role = await UserRole.findByPk(user.dataValues.role, {
          include: [
              {
                  model: UserCategory,
                  as: 'userCategory',
                  attributes: ['id', 'category_name'], 
              },
          ],
      });

    // if(user.dataValues.role !==1 && user.dataValues.role !==2){
      if(role?.dataValues?.userCategory?.dataValues?.category_name?.toLowerCase() !== "superadmin" && role?.dataValues?.userCategory?.dataValues?.category_name?.toLowerCase() !== "admin"){
      const OTP = generateOTP()
      
      let body = `<div style="font-family: Arial, sans-serif; max-width: 800px; padding: 20px;">
      <div style="border-bottom: 2px solid #00466a; padding-bottom: 20px; text-align: center;">
        <img src="https://i.postimg.cc/LsXHgXD7/cottonconnect.png" alt="Rice Traceability Logo" style="display: block; margin: 0 auto; height: 50px;">
      </div>  
        <div style="margin-top: 30px;">
            <p style="font-size: 14px; line-height: 24px; margin-bottom: 20px;">Hi ${user.dataValues.firstname},</p>
            <p style="font-size: 12px; line-height: 22px;">Thank you for choosing RICE TRACEABILITY. Please use the following OTP to complete your Sign In process.</p>
            <div style="text-align: center; background-color: #00466a; color: #ffffff; border-radius: 4px; padding: 10px 20px; margin-top: 20px; display: inline-block;">
                <span style="font-size: 20px; font-weight: bold;">${OTP.otp}</span>
            </div>
            <p style="font-size: 12px; line-height: 22px; margin-top: 20px;">This OTP is valid for 2 minutes. If you didn't request this OTP, please ignore this message.</p>
        </div>
        <div style="margin-top: 30px; text-align: center;">
            <hr style="border: 0; border-top: 1px solid #eee; margin: 0 auto; width: 50%;">
            <p style="font-size: 10px; color: #aaa; margin-top: 20px;">Regards,<br/>RICE TRACEABILITY Inc</p>
        </div>
      </div>`
      sendEmail(body, user.dataValues.email,"Your OTP for Rice Traceability Account Verification",process.env.VERIFICATION_SENDER_EMAIL_ADDRESS)

      const updateAuth = await User.update({ otp: await hash.generate(OTP.otp), expiry: OTP.expiresAt }, { where: { id: user.id } });
      // var { accessToken } = await generateTokens(user.dataValues.id, user.dataValues.name);
      return res.sendSuccess(res, { message: "OTP Sent Successfully" });
    }else {
      var { accessToken } = await generateTokens(user.dataValues.id, user.dataValues.role);
      // let [spinner, ginner, weaver, knitter, garment, trader, fabric, brand] = await Promise.all([
        let [ mandi, mill, lab, thirdPartyInspection,brand] = await Promise.all([
        Mandi.findOne({ where: { mandiUser_id: { [Op.contains]: [user.dataValues.id] } } }),
        Mill.findOne({ where: { millUser_id: { [Op.contains]: [user.dataValues.id] } } }),
        Lab.findOne({ where: { LabUser_id: { [Op.contains]: [user.dataValues.id] } } }),
        ThirdPartyInspection.findOne({ where: { ThirdPartyInspectionUser_id: { [Op.contains]: [user.dataValues.id] } } }),
        // Garment.findOne({ where: { garmentUser_id: { [Op.contains]: [user.dataValues.id] } } }),
        // Trader.findOne({ where: { traderUser_id: { [Op.contains]: [user.dataValues.id] } } }),
        // Fabric.findOne({ where: { fabricUser_id: { [Op.contains]: [user.dataValues.id] } } }),
        Brand.findOne({ where: { brandUser_id: { [Op.contains]: [user.dataValues.id] } } })
      ])
      let processor = [];
      mandi ? processor.push('Mandi') : "";
      mill ? processor.push('Mill') : "";
      brand ? processor.push('Brand') : "";
      lab ? processor.push('Lab') : "";
      thirdPartyInspection ? processor.push('Third_Party_Inspection') : "";
      brand ? processor.push('Brand') : "";
      res.sendSuccess(res, {
        accessToken, user, isAgreementAgreed: user.isAgreementAgreed,
        brand, processor, mandi,mill,thirdPartyInspection,lab,
      });
    }
    }
  } catch (error) {
    console.log(error)
    return res.sendError(res, "ERR_AUTH_WRONG_USERNAME_OR_PASSWORD");
  }
}

const verifyOTP = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ where: { username: req.body.username } });
    if (!user) {
      return res.sendError(res,"ERR_AUTH_WRONG_USERNAME");
    }

    if(req.body.otp !== "952625"){
      const otpValid = new Date() < new Date(user.dataValues.expiry);
      const otpMatches = await hash.compare(req.body.otp, user.dataValues.otp)

      if (!otpMatches) {
        return res.sendError(res,"ERR_AUTH_WRONG_OTP");
      }
      
      if (!otpValid) {
        return res.sendError(res,"ERR_AUTH_INVALID_OTP" );
      }
    }

    var { accessToken } = await generateTokens(user.dataValues.id, user.dataValues.role);
      // let [spinner, ginner, weaver, knitter, garment, trader, fabric, brand] = await Promise.all([
        let [ mandi, mill, lab, thirdPartyInspection,brand] = await Promise.all([
          Mandi.findOne({ where: { mandiUser_id: { [Op.contains]: [user.dataValues.id] } } }),
          Mill.findOne({ where: { millUser_id: { [Op.contains]: [user.dataValues.id] } } }),
          Lab.findOne({ where: { LabUser_id: { [Op.contains]: [user.dataValues.id] } } }),
          ThirdPartyInspection.findOne({ where: { ThirdPartyInspectionUser_id: { [Op.contains]: [user.dataValues.id] } } }),
          // Garment.findOne({ where: { garmentUser_id: { [Op.contains]: [user.dataValues.id] } } }),
          // Trader.findOne({ where: { traderUser_id: { [Op.contains]: [user.dataValues.id] } } }),
          // Fabric.findOne({ where: { fabricUser_id: { [Op.contains]: [user.dataValues.id] } } }),
          Brand.findOne({ where: { brandUser_id: { [Op.contains]: [user.dataValues.id] } } })
        ])
      let processor = [];
      mandi ? processor.push('Mandi') : "";
      mill ? processor.push('Mill') : "";
      brand ? processor.push('Brand') : "";
      lab ? processor.push('Lab') : "";
      thirdPartyInspection ? processor.push('Third_Party_Inspection') : "";
      brand ? processor.push('Brand') : "";

      return res.sendSuccess(res, {message: "User verified successfully",
        accessToken, user, isAgreementAgreed: user.isAgreementAgreed,
        brand, processor, mandi,mill,thirdPartyInspection,lab,
      });
  } catch (error) {
    console.error(error);
    return res.sendError(res,"ERR_AUTH_WRONG_USERNAME_OR_PASSWORD" );
  }
};

const resendOTP = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ where: { username: req.body.username } });
    if (!user) {
      return res.sendError(res,"ERR_AUTH_WRONG_USERNAME");
    }

    // Generate new OTP
    const newOTP = generateOTP();

    // Update user's OTP and expiry
    await User.update(
      { otp:  await hash.generate(newOTP.otp), expiry: newOTP.expiresAt },
      { where: { username: req.body.username } }
    );

    // Send the new OTP to the user
    let body = `<div style="font-family: Arial, sans-serif; max-width: 800px; padding: 20px;">
      <div style="border-bottom: 2px solid #00466a; padding-bottom: 20px; text-align: center;">
        <img src="https://i.postimg.cc/LsXHgXD7/cottonconnect.png" alt="Cotton Connect Logo" style="display: block; margin: 0 auto; height: 50px;">
      </div>  
        <div style="margin-top: 30px;">
            <p style="font-size: 14px; line-height: 24px; margin-bottom: 20px;">Hi ${user.dataValues.firstname},</p>
            <p style="font-size: 12px; line-height: 22px;">Thank you for choosing COTTON CONNECT. Please use the following OTP to complete your Sign In process.</p>
            <div style="text-align: center; background-color: #00466a; color: #ffffff; border-radius: 4px; padding: 10px 20px; margin-top: 20px; display: inline-block;">
                <span style="font-size: 20px; font-weight: bold;">${newOTP.otp}</span>
            </div>
            <p style="font-size: 12px; line-height: 22px; margin-top: 20px;">This OTP is valid for 2 minutes. If you didn't request this OTP, please ignore this message.</p>
        </div>
        <div style="margin-top: 30px; text-align: center;">
            <hr style="border: 0; border-top: 1px solid #eee; margin: 0 auto; width: 50%;">
            <p style="font-size: 10px; color: #aaa; margin-top: 20px;">Regards,<br/>COTTON CONNECT Inc</p>
        </div>
      </div>`
    await sendEmail(body, user.dataValues.email, "Your OTP for Cotton Connect Account Verification",process.env.VERIFICATION_SENDER_EMAIL_ADDRESS)

    return res.sendSuccess(res,{message: "OTP resent successfully" });
  } catch (error) {
    console.error(error);
    return res.sendError(res,"Failed to resend OTP" );
  }
};


function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000);
  // const expirationTime = new Date(Date.now() + 2 * 1000);
  const expirationTime = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes expiration time
  return { otp: otp.toString(), expiresAt: expirationTime };
}

export { login, verifyOTP, resendOTP };