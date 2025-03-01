// import {
//     fetchDyingTransactions,
//     fetchDyingTransactionsAll,
//     fetchWashingTransactionsAll,
//     updateTransactionStatus,
//     chooseDyingFabric,
//     createDyingProcess,
//     fetchDyingSalesPagination,
//     getProgram,
//     getFabrics,
//     getGarments,
//     exportDyingProcess,
//     updateWashingTransactionStatus,
//     createWashingProcess,
//     fetchWashingSalesPagination,
//     exportWashingProcess,
//     chooseWashingFabric,
//     fetchPrintingTransactions,
//     fetchPrintingTransactionSold,
//     updatePrintingTransactionStatus,
//     createPrintingProcess,
//     fetchPrintingSalesPagination,
//     exportPrintingProcess,
//     choosePrintingFabric,
//     fetchWashingTransactions,
//     fetchCompactingTransactions,
//     fetchCompactingTransactionSold,
//     updateCompactingTransactionStatus,
//     chooseCompactingFabric,
//     createCompactingProcess,
//     fetchCompactingSalesPagination,
//     exportCompactingProcess,
//     deleteDyingProcess,
//     deleteWashingProcess,
//     deletePrintingProcess,
//     deleteCompactingProcess,
//     getProcessName,
//     getBatchLot,
//     getFabricProcessTracingChartData
// } from "../../controllers/fabric";
// import accessControl from "../../middleware/access-control";
// import { Router } from "express";

// const router = Router();

// router.use(accessControl);

// router.get('/dying-dashboard', fetchDyingTransactions);
// router.get('/dying-dashboard-all', fetchDyingTransactionsAll);
// router.get('/washing-dashboard-all', fetchWashingTransactionsAll);
// router.get('/washing-dashboard', fetchWashingTransactions);
// router.put('/update-transaction', updateTransactionStatus);
// router.get('/choose-dying-fabric', chooseDyingFabric);
// router.post('/dying-process', createDyingProcess);
// router.get('/export-dying-process', exportDyingProcess);
// router.get('/dying-process', fetchDyingSalesPagination);
// router.delete('/delete-dying-process', deleteDyingProcess);
// router.get('/get-program', getProgram);
// router.get('/get-fabrics', getFabrics);
// router.get('/get-garments', getGarments);

// router.put('/update-transaction-washing', updateWashingTransactionStatus);
// router.get('/choose-washing-fabric', chooseWashingFabric);
// router.post('/washing-process', createWashingProcess);
// router.get('/export-washing-process', exportWashingProcess);
// router.get('/washing-process', fetchWashingSalesPagination);
// router.delete('/delete-washing-process', deleteWashingProcess);


// router.get('/printing-dashboard-all', fetchPrintingTransactions);
// router.get('/printing-dashboard', fetchPrintingTransactionSold);
// router.put('/update-transaction-printing', updatePrintingTransactionStatus);
// router.get('/choose-printing-fabric', choosePrintingFabric);
// router.post('/printing-process', createPrintingProcess);
// router.get('/printing-process', fetchPrintingSalesPagination);
// router.get('/export-printing-process', exportPrintingProcess);
// router.delete('/delete-printing-process', deletePrintingProcess);


// router.get('/compacting-dashboard-all', fetchCompactingTransactions);
// router.get('/compacting-dashboard', fetchCompactingTransactionSold);
// router.put('/update-transaction-compacting', updateCompactingTransactionStatus);
// router.get('/choose-compacting-fabric', chooseCompactingFabric);
// router.post('/compacting-process', createCompactingProcess);
// router.get('/compacting-process', fetchCompactingSalesPagination);
// router.get('/export-compacting-process', exportCompactingProcess);
// router.delete('/delete-compacting-process', deleteCompactingProcess);

// router.get('/get-processors', getProcessName);
// router.get('/get-batch-lot', getBatchLot);
// router.get('/tracing/chart', getFabricProcessTracingChartData);


// export default router;