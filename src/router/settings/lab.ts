import { Router } from "express";
import accessControl from "../../middleware/access-control";
import {
    fetchLabPagination,
    fetchLab,
    deleteLab,
    checkLab
} from "../../controllers/process-registration/lab";

const router = Router();

router.use(accessControl);

router.get('/', fetchLabPagination);
router.get('/get-lab', fetchLab);
router.delete('/', deleteLab);
router.post('/check-lab', checkLab);

export default router;