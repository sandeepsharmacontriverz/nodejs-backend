import { exportMandiProcurement } from "../../controllers/procurement";
import accessControl from "../../middleware/access-control";
import { Router } from "express";
import { 
    createMandiProcess,
    fetchMandiProcessPagination,
    fetchMandiBag,
    deleteMandiProcess,
    createMandiSales,
    fetchMandiSalesPagination,
    fetchMandiSale,
    exportMandiSales,
    fetchMandiSaleBag,
    updateTransactionStatus,
    choosePaddy,
    getReelBagId,
    getProgram,
    chooseBag,
    updateMandiSalesField,
    updateMandiSales,
    updateMandiSaleBag,
    deleteMandiSales,
    getMill,
    getVillageAndFarmer,
    dashboardGraphWithProgram,
    getMandiProcessTracingChartData,
    updateMandiProcess,
    fetchMandiProcess,
    exportMandiProcess,
    //   checkReport,
 } from "../../controllers/mandi";

const router = Router();

router.use(accessControl);

// Mandi Routes
router.get('/', fetchMandiProcessPagination);
router.post('/', createMandiProcess);
router.put('/', updateMandiProcess);
router.get('/get-mandi-process', fetchMandiProcess);
router.get('/export', exportMandiProcess);
router.delete('/', deleteMandiProcess);
router.get('/choose-paddy', choosePaddy);
router.get('/fetch-bag', fetchMandiBag);
// router.get('/', fetchGinProcessPagination);

router.post('/sales', createMandiSales);
router.get('/sales', fetchMandiSalesPagination);
router.get('/sales/get-mandi-sale', fetchMandiSale);
router.put('/sales', updateMandiSales);
router.put('/sales/update', updateMandiSalesField);
router.delete('/sales', deleteMandiSales);
router.get('/sales/export', exportMandiSales);
router.get('/sales/bag', fetchMandiSaleBag);
// router.post('/sales/spinner', createSpinnerProcess);

router.put('/update-status-transaction', updateTransactionStatus);
router.get('/dashboard', dashboardGraphWithProgram);
router.get('/reel', getReelBagId);
router.get('/get-program', getProgram);
router.put('/sales/update-bag', updateMandiSaleBag);
router.get('/sales/choose-bag', chooseBag);
router.get('/get-mill', getMill);
router.get('/get-village-farmer', getVillageAndFarmer);
router.get('/export-mandi-transactions', exportMandiProcurement);
router.get('/tracing/chart', getMandiProcessTracingChartData);
// router.get('/check-report', checkReport);

export default router;