const express = require("express");
const { multerUploads } = require("./../utils/multer");
const router = express.Router();

const collectionController = require("../controllers/collection.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router
  .route("/")
  .get(authMiddleware.protectRoute, collectionController.getAllCollections)
  .post(
    authMiddleware.protectRoute,
    multerUploads,
    collectionController.createCollection
  );

router
  .route("/:id")
  .get(authMiddleware.protectRoute, collectionController.getCollectionDetails)
  .patch(authMiddleware.protectRoute, collectionController.updateCollection)
  .delete(
    authMiddleware.protectRoute,
    collectionController.deleteCollectionByOwner
  );

router
  .route("/public/:id")
  .get(collectionController.getPublicPublicCollectionDetails);

router
  .route("/image/:id/:sectionId")
  .patch(
    authMiddleware.protectRoute,
    multerUploads,
    collectionController.uploadImageForACollectionLink
  );
module.exports = router;
