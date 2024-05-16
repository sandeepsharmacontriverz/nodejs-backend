import {
    createRiceType,
    checkRiceTypes,
    createRiceTypes,
    fetchRiceTypePagination,
    updateRiceType,
    updateRiceTypeStatus,
    deleteRiceType
} from "../../controllers/rice-type";
import accessControl from "../../middleware/access-control";
import { Router } from "express";
const router = Router();

router.use(accessControl);

// Department Routes
router.get('/', fetchRiceTypePagination);
router.post('/check-rice_types', checkRiceTypes);
router.post('/', createRiceType);
router.post('/multiple', createRiceTypes);
router.put('/', updateRiceType);
router.put('/status', updateRiceTypeStatus);
router.delete('/', deleteRiceType);


export default router;