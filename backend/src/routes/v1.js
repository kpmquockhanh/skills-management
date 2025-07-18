import { Router } from 'express';
import responseHelper from '../utils/helpers/response-helper.js';
import chatRoute from './v1/chat.route.js';
import attachmentRoute from './v1/attachment.route.js';
import permissionRoute from './v1/permissions.route.js';
import userManagementRoute from './v1/user-management.route.js';
import classRoute from './v1/class.route.js';
import skillRoute from './v1/skill.route.js';
import skillTreeRoute from './v1/skillTree.route.js';
import skillRatingRoute from './v1/skillRating.route.js';
import configRoute from './v1/config.route.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(responseHelper(200, 'Welcome to the API'));
});

router.use('/chat', chatRoute);
router.use('/attachments', attachmentRoute);
router.use('/permissions', permissionRoute);
router.use('/user-management', userManagementRoute);
router.use('/classes', classRoute);
router.use('/skills', skillRoute);
router.use('/skill-trees', skillTreeRoute);
router.use('/skill-ratings', skillRatingRoute);
router.use('/config', configRoute);

export default router;
