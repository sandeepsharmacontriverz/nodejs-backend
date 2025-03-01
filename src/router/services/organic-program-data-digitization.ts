// import {
//     createFarmGroupEvaluationData,
//     fetchFarmGroupEvaluationDataPagination,
//     countFarmerByBrandAndFarmGroup,
//     fetchFarmGroupEvaluationData,
//     updateFarmGroupEvaluationData,
//     deleteFarmGroupEvaluationData
// } from "../../controllers/organic-program-data-digitization/farm-group-evaluation-data";
// import {
//     createIcsQuantityEstimation,
//     fetchIcsQuantityEstimationPagination,
//     fetchIcsQuantityEstimation,
//     updateIcsQuantityEstimation,
//     deleteIcsQuantityEstimation
// } from "../../controllers/organic-program-data-digitization/ics-quantity-estimation";
// import {
//     createSeedTestingLinkage,
//     fetchSeedTestingLinkagePagination,
//     fetchSeedTestingLinkage,
//     updateSeedTestingLinkage,
//     deleteSeedTestingLinkage,
//     createSeedTestingLinkageReport,
//     deleteSeedTestingLinkageReport
// } from "../../controllers/organic-program-data-digitization/seed-testing-linkage";
// import {
//     fetchSeedDemandPagination,
//     fetchSeedDemand,
//     updateSeedDemand,
//     deleteSeedDemand
// } from "../../controllers/organic-program-data-digitization/seed-demand";
// import {
//     fetchSeedAvailabilityPagination,
//     fetchSeedAvailability,
//     updateSeedAvailability,
//     deleteSeedAvailability
// } from "../../controllers/organic-program-data-digitization/seed-availability";

// import { Router } from "express";

// const router = Router();

// // farm-group-evaluation-data routes
// router.post("/farm-group-evaluation-data", createFarmGroupEvaluationData);
// router.get("/farm-group-evaluation-data", fetchFarmGroupEvaluationDataPagination);
// router.get("/farm-group-evaluation-data/farmer-count", countFarmerByBrandAndFarmGroup);
// router.get("/farm-group-evaluation-data/:id", fetchFarmGroupEvaluationData);
// router.put("/farm-group-evaluation-data", updateFarmGroupEvaluationData);
// router.delete("/farm-group-evaluation-data", deleteFarmGroupEvaluationData);

// // ics-quantity-estimation routes
// router.post("/ics-quantity-estimation", createIcsQuantityEstimation);
// router.get("/ics-quantity-estimation", fetchIcsQuantityEstimationPagination);
// router.get("/ics-quantity-estimation/:id", fetchIcsQuantityEstimation);
// router.put("/ics-quantity-estimation", updateIcsQuantityEstimation);
// router.delete("/ics-quantity-estimation", deleteIcsQuantityEstimation);

// // seed-testing-linkage routes
// router.post("/seed-testing-linkage", createSeedTestingLinkage);
// router.get("/seed-testing-linkage", fetchSeedTestingLinkagePagination);
// router.get("/seed-testing-linkage/:id", fetchSeedTestingLinkage);
// router.put("/seed-testing-linkage", updateSeedTestingLinkage);
// router.delete("/seed-testing-linkage", deleteSeedTestingLinkage);
// router.post("/seed-testing-linkage-report", createSeedTestingLinkageReport);
// router.delete("/seed-testing-linkage-report", deleteSeedTestingLinkageReport);

// // seed-demand routes
// router.get("/seed-demand", fetchSeedDemandPagination);
// router.get("/seed-demand/:id", fetchSeedDemand);
// router.put("/seed-demand", updateSeedDemand);
// router.delete("/seed-demand", deleteSeedDemand);

// // seed-availability routes
// router.get("/seed-availability", fetchSeedAvailabilityPagination);
// router.get("/seed-availability/:id", fetchSeedAvailability);
// router.put("/seed-availability", updateSeedAvailability);
// router.delete("/seed-availability", deleteSeedAvailability);

// export default router;