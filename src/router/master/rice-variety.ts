import {
    createVariety,
    checkVarieties,
    createVarieties,
    fetchVarietyPagination,
    updateVariety,
    updateVarietyStatus,
    deleteVariety
} from "../../controllers/rice-varietry";
import accessControl from "../../middleware/access-control";
import { Router } from "express";
const router = Router();

router.use(accessControl);

// Department Routes
router.get('/', fetchVarietyPagination);
router.post('/check-varieties', checkVarieties);
router.post('/', createVariety);
router.post('/multiple', createVarieties);
router.put('/', updateVariety);
router.put('/status', updateVarietyStatus);
router.delete('/', deleteVariety);


export default router;