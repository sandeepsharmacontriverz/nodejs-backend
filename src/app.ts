/** Import .env */
import dotenv from "dotenv";
// dotenv.config({ path: '.env.local' });
dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });

console.log(process.env.NODE_ENV);

import express, { Request, Response } from "express";
import sequelize from "./util/dbConn";
import cors from "cors";

const fs = require("fs");
// const swaggerUi = require("swagger-ui-express");
// const swaggerDocument = require("../src/swagger/swagger.json");
// const customCss = fs.readFileSync((process.cwd() + "/src/swagger/swagger.css"), "utf8");

import authRouter from './router/auth';
import locationRouter from './router/master/location';
import cropRouter from './router/master/crop';
import farmRouter from './router/master/farm';
import unitRouter from './router/master/unit';
import deptRouter from './router/master/department';
import riceTypeRouter from './router/master/rice-type';
import riceVarietyRouter from './router/master/rice-variety';
import programRouter from './router/master/program';
// import fabricTypeRouter from './router/master/fabric-type';
import seasonRouter from './router/master/season';
// import loomTypeRouter from './router/master/loom-type';
// import garmentTypeRouter from './router/master/garment-type';
// import styleMarkRouter from './router/master/style-mark-no';
// import cottonmixRouter from './router/master/cottonmix';
// import yarnCountRouter from './router/master/yarn-count-range';
// import linenVarietyRouter from './router/master/linenvariety';
import productionCapacityRouter from './router/master/prod-capacity';
import farmGroupRouter from './router/master/farm-group';
import icsRouter from './router/master/ics-name';
import videoRouter from './router/master/video';
import fileRouter from './router/upload';
import brandRouter from './router/settings/brand';
import mandiRouter from './router/settings/mandi';
import mill_processRouter from './router/settings/mill-process'; 
import newProcessorRouter from './router/settings/new-process';
import ThirdPartyRouter from './router/settings/third-party-inspection';
import LabRouter from './router/settings/lab';
import ContainerManagementRouter from './router/settings/container_management_system';
// import physicalTraceabilityRouter from './router/physical-traceability';
// import deviceRouter from './router/settings/device';
import scopeCertRouter from './router/services/scope-cert';
import farmerRouter from './router/services/farmer';
import organicRouter from './router/services/organic-integrity';
import premiumValidationRouter from './router/services/premium-validation';
// import fabricRouter from './router/settings/fabric';
import entityLimitRouter from './router/settings/entity-limit';
import userRouter from './router/user/user';
import trainingRouter from './router/training/training';
// import linenRouter from './router/services/linen-details';
import procurementRouter from './router/services/procurement';
// import ticketingRouter from "./router/ticketing";
// import reportRouter from './router/reports/reports';
// import uploadDataBaseRouter from "./router/services/upload-databases";
import emailManagementRouter from "./router/settings/email-management";
// import garmentSalesRouter from "./router/garment";
import qualityParameterRouter from "./router/quality-parameter";
import mandiProcessRouter from "./router/mandi";
import millProcessRouter from "./router/mill";
import thirdPartySampleRouter from "./router/third-party";
import labReportRouter from "./router/lab";
import cmsRouter from "./router/container-management";
// import knitterProcessRouter from "./router/knitter";
// import traderProcessRouter from "./router/trader";
// import supplyChainRouter from "./router/supply-chain";
import brandProcessRouter from "./router/brand";
// import fabricProcessRouter from "./router/fabric";
import errorMiddleware from "./middleware/error";
import setInterface from "./middleware/interface";
import qrApp from "./router/qr-app";
// import DatamigrationRouter from './router/datamigration';
// import failedRouter from './router/failed-records';
// import oldsalesRouter from './router/oldsales';
import dashboardFarmerRouter from './router/dashboard/farmer';
// import dashboardGinnerRouter from './router/dashboard/ginner';
// import dashboardSpinnerRouter from './router/dashboard/spinner';
import dashboardProcurementRouter from './router/dashboard/procurement';
// import dashboardProcessorRouter from './router/dashboard/processor';
// import labMasterRouter from './router/master/lab-master';
// import seedCompanyRouter from './router/master/seed-company';
import cropCurrentSeasonRouter from './router/master/crop-current-season';
// import organicProgramDataDigitizationRouter from './router/services/organic-program-data-digitization';
// import { sendScheduledEmails } from "./controllers/email-management/scheduled-email.controller";
// import { exportReportsTameTaking, exportReportsOnebyOne } from "./controllers/reports/export-cron";


const app = express();

app.use(express.json({ limit: '2450mb' }));

app.use(express.urlencoded({ extended: true }));
var corsOptions = {
  origin: function (origin: any, callback: any) {
    callback(null, true);
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(setInterface);
//check connection to database
const connectToDb = async () => {
  await sequelize.sync({ force: false })
  try {
    await sequelize.authenticate();
    console.log("Database Connected successfully.");

  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};



app.use("/auth", authRouter);
app.use("/location", locationRouter);
app.use("/crop", cropRouter);
app.use("/farm", farmRouter);
app.use("/unit", unitRouter);
app.use("/department", deptRouter);
app.use("/rice-type", riceTypeRouter);
app.use("/rice-variety", riceVarietyRouter);
app.use("/program", programRouter);
app.use("/season", seasonRouter);
app.use("/production-capacity", productionCapacityRouter);
app.use("/user", userRouter);
app.use("/farm-group", farmGroupRouter);
app.use("/ics", icsRouter);
app.use("/video", videoRouter);
app.use("/file", fileRouter);
app.use("/scope-certificate", scopeCertRouter);
app.use("/brand", brandRouter);
app.use("/new-processor", newProcessorRouter);
// app.use("/spinner", spinnerRouter);
app.use("/mandi", mandiRouter);
app.use("/mill", mill_processRouter);
app.use("/third-party-inspection", ThirdPartyRouter);
app.use("/lab", LabRouter);
app.use("/container-management-system", ContainerManagementRouter);

app.use("/farmer", farmerRouter);
app.use("/organic-integrity", organicRouter);
// app.use("/device", deviceRouter);
// app.use("/fabric", fabricRouter);
app.use("/entity", entityLimitRouter);
app.use("/training", trainingRouter);
// app.use("/ticketing", ticketingRouter);
// app.use("/upload-database", uploadDataBaseRouter);
app.use("/premium-validation", premiumValidationRouter);
// app.use("/linen", linenRouter);
app.use("/procurement", procurementRouter);
// app.use("/reports", reportRouter);
app.use("/email", emailManagementRouter);
// app.use("/garment-sales", garmentSalesRouter);
app.use("/mandi-process", mandiProcessRouter);
app.use("/mill-process", millProcessRouter);
app.use("/third-party-sample", thirdPartySampleRouter);
app.use("/lab-report", labReportRouter);
app.use("/container-management", cmsRouter);
// app.use("/weaver-process", weaverProcessRouter);
// app.use("/knitter-process", knitterProcessRouter);
// app.use("/supply-chain", supplyChainRouter);
app.use("/quality-parameter", qualityParameterRouter);
// app.use("/trader-process", traderProcessRouter);
// app.use("/fabric-process", fabricProcessRouter);
app.use("/brand-interface", brandProcessRouter);
app.use("/qr-app", qrApp);
// app.use("/datamigration", DatamigrationRouter);
// app.use("/failed-records", failedRouter);
// app.use("/oldsales", oldsalesRouter);
// app.use("/garment-type", garmentTypeRouter);
// app.use("/style-mark", styleMarkRouter);
app.use("/dashboard/farmer", dashboardFarmerRouter)
// app.use("/dashboard/ginner", dashboardGinnerRouter)
// app.use("/dashboard/spinner", dashboardSpinnerRouter)
app.use("/dashboard/procurement", dashboardProcurementRouter)
// app.use("/dashboard/processor", dashboardProcessorRouter)
// app.use("/lab-master", labMasterRouter);
// app.use("/seed-company", seedCompanyRouter);
app.use("/crop-current-season", cropCurrentSeasonRouter);
// app.use("/organic-program-data-digitization", organicProgramDataDigitizationRouter);
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, { customCss }));

app.use(errorMiddleware);

app.listen(5000, () => {
  connectToDb();
  console.log(`[*] Server listening on Port ${5000}`);
});
