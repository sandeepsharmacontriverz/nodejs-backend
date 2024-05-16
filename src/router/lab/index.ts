import { addRiceSampleResults, fetchRiceSamplePagination, fetchRiceSamplesDetailsPagination } from "../../controllers/lab";
import accessControl from "../../middleware/access-control";
import { Router } from "express";
    
const router = Router();
    
// router.use(accessControl);
    
// // Spinner Routes
router.get('/', fetchRiceSamplePagination);
router.post('/', addRiceSampleResults);
router.get('/rice-samples', fetchRiceSamplesDetailsPagination);

export default router;