import { createRiceSample, fetchRiceSample, fetchRiceSamplePagination, getMillProcessLot } from "../../controllers/third-party";
import accessControl from "../../middleware/access-control";
import { Router } from "express";
    
const router = Router();
    
// router.use(accessControl);
    
// // Spinner Routes
router.get('/', fetchRiceSamplePagination);
router.post('/', createRiceSample);
// router.put('/', updateMillProcess);
router.get('/get-rice-sample', fetchRiceSample);

router.get('/get-mill-process-lot', getMillProcessLot);

export default router;