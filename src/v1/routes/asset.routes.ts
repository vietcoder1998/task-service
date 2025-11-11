import { Router } from 'express';
import * as assetController from '../controllers/asset.controller';
import { attachAssetOnCreate, addHistoryOnUpdate } from '../middlewares/asset.middleware';

const router = Router();

router.get('/', assetController.getAssets);
router.get('/:id', assetController.getAssetById);
router.post('/', attachAssetOnCreate, assetController.createAsset);
router.put('/:id', addHistoryOnUpdate, assetController.updateAsset);
router.patch('/:id', addHistoryOnUpdate, assetController.updateAsset);
router.delete('/:id', assetController.deleteAsset);

export default router;
