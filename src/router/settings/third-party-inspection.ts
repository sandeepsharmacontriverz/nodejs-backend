import { Router } from "express";
import accessControl from "../../middleware/access-control";
import {
    fetchThirdPartyInspectionPagination,
    fetchThirdPartyInspection,
    deleteThirdPartyInspection,
    checkThirdPartyInspection
} from "../../controllers/process-registration/third-party-inspection";

const router = Router();

router.use(accessControl);

router.get('/', fetchThirdPartyInspectionPagination);
router.get('/get-third-party-inspection', fetchThirdPartyInspection);
router.delete('/', deleteThirdPartyInspection);
router.post('/check-third-party-inspection', checkThirdPartyInspection);

export default router;