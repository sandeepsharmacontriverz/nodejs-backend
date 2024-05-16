import {
//     countCottonBaleWithProgram,
    createMillProcess,
    exportMillProcess,
    fetchMillSalesDashBoard,
    fetchMillProcessPagination,
    updateStatusSales,
//     exportSpinnerTransaction,
    getProgram,
//     fetchComberNoilPagination,
//     getYarnCount,
    deleteMillProcess,
//     deleteSpinnerSales,
    fetchMillProcess,
    chooseLint,
//     getSalesInvoice,
    chooseRice,
//     getInvoiceAndReelLotNo,
//     getYarnReelLotNo,
//     getSpinnerProcessTracingChartData,
    updateMillProcess,
//     updateSpinnerSales,
//     fetchSpinnerSale
    getRiceType,
    getRiceVariety,
    getMillDashboard,
    createMillSales,
    fetchMillSalesPagination,
    exportMillSale,
    updateMillSales,
    fetchMillSale,
    getCMS,
    getRiceTypeAndVariety,
    exportMillTransaction
} from "../../controllers/mill"
import accessControl from "../../middleware/access-control";
import { Router } from "express";

const router = Router();

// router.use(accessControl);

// // Spinner Routes
router.get('/', fetchMillProcessPagination);
router.post('/', createMillProcess);
router.put('/', updateMillProcess);
router.get('/get-process', fetchMillProcess);
router.delete('/', deleteMillProcess);
router.get('/export', exportMillProcess);
router.post('/sales', createMillSales);
router.get('/sales', fetchMillSalesPagination);
router.put('/sales', updateMillSales);
router.get('/sales/get-sale', fetchMillSale);
// router.delete('/sales', deleteSpinnerSales);
// router.get('/comber-noil', fetchComberNoilPagination);
router.get('/sales/export', exportMillSale);
router.get('/transaction', fetchMillSalesDashBoard);
router.put('/transaction', updateStatusSales);
// router.get('/transaction/count', countCottonBaleWithProgram);
router.get('/transaction/export', exportMillTransaction);
router.get('/get-program', getProgram);
router.get('/get-rice-type', getRiceType);
router.get('/get-rice-variety', getRiceVariety);
router.get('/get-cms', getCMS);
router.get('/get-filter-mill', getMillDashboard);
router.get('/choose-lint', chooseLint);
router.get('/choose-rice', chooseRice);
// router.get('/sales-invoice', getSalesInvoice);
// router.get('/lint-invoice', getInvoiceAndReelLotNo);
router.get('/choose-rice-filters', getRiceTypeAndVariety);
// router.get('/tracing/chart', getSpinnerProcessTracingChartData);

export default router;