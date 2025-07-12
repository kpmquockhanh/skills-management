import { Router } from 'express';
import { getShopInfo } from '../../controllers/shopee/product.controller.js';
import { shopeeMiddleware } from '../../middlewares/index.js';

const router = Router();

router.get('/get_from_url', shopeeMiddleware, getShopInfo);

export default router;
