import { Router } from 'express';
import * as locationController from '../controllers/location.controller';

const router = Router();
// Location CRUD (by projectId)
router.get('', locationController.getLocations); // index by projectId
router.post('', locationController.createLocation); // create location for project
router.get('/:locationId', locationController.getLocationById); // get single location by id & projectId
router.put('/:locationId', locationController.updateLocation); // update location by id & projectId
router.delete('/:locationId', locationController.deleteLocation); // delete location by id & projectId

export default router;
