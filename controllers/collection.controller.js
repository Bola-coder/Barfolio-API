const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { createCollectionValidation } = require("../validations/collection");
const {
  createNewCollection,
  getCollections,
  getCollectionById,
  getCollectionByUserAndId,
  updateCollectionById,
} = require("../repositories/collection");
const { uploader } = require("../utils/cloudinary");
const { dataUri } = require("../utils/multer");

const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = uploader.upload_stream(
      { folder, secure: true },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    stream.end(buffer); // Pass the buffer as the file content
  });
};
const createCollection = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { error } = createCollectionValidation.validate(req.body);

  if (error) {
    return next(new AppError(error.message, 400));
  }

  if (req.files && req.files.length > 0) {
    // Iterate through the linkCollection and associate each file with the corresponding item
    for (let i = 0; i < req.body.linkCollection.length; i++) {
      const fileKey = `linkCollection[${i}][image]`;
      const file = req.files.find((f) => f.fieldname === fileKey);

      if (file) {
        try {
          // Upload the file and assign the returned secure URL to the correct linkCollection image field
          const imageUrl = await uploadToCloudinary(
            file.buffer,
            `Barfolio/collections/${userId}`
          );
          req.body.linkCollection[i].image = imageUrl;
        } catch (error) {
          console.error("Cloudinary upload error:", error);
          return res
            .status(500)
            .json({ message: "Error uploading image to Cloudinary" });
        }
      }
    }
  }

  const data = {
    ...req.body,
    user: userId,
  };

  // Create the collection
  const collection = await createNewCollection(data);

  res.status(201).json({
    status: "success",
    data: {
      collection,
    },
  });
});

const getAllCollections = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const collections = await getCollections(userId);
  res.status(200).json({
    status: "success",
    data: {
      collections,
    },
  });
});

const getCollectionDetails = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const collection = await getCollectionByUserAndId(userId, id);

  if (!collection) {
    return next(new AppError("Collection not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      collection,
    },
  });
});

const getPublicPublicCollectionDetails = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const collection = await getCollectionById(id);

  if (!collection) {
    return next(new AppError("Collection not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      collection,
    },
  });
});

const updateCollection = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const collection = await getCollectionByUserAndId(userId, id);

  if (!collection) {
    return next(new AppError("Collection not found", 404));
  }

  const updatedCollection = await updateCollectionById(id, req.body);

  if (!updatedCollection) {
    return next(new AppError("Failed to update the collection", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      collection: updatedCollection,
    },
  });
});

const uploadImageForACollectionLink = catchAsync(async (req, res, next) => {
  const { id, sectionId } = req.params; // Assuming linkIndex is the index of the item in linkCollection
  const userId = req.user.id;

  // Fetch the collection belonging to the user
  const collection = await getCollectionByUserAndId(userId, id);

  if (!collection) {
    return next(new AppError("Collection not found", 404));
  }

  if (!req.file) {
    return next(new AppError("Please upload an image", 400));
  }

  const imageData = dataUri(req).content;

  // Upload the file to Cloudinary or any storage service
  const result = await uploader.upload(imageData, {
    folder: `Barfolio/collections/${collection._id}`,
    secure: true,
  });

  // // Ensure the linkIndex is valid
  // if (!collection.linkCollection[sectionId]) {
  //   return next(new AppError("Invalid link collection index", 400));
  // }

  const section = collection.linkCollection.find(
    (section) => section._id === sectionId
  );

  if (!section) {
    return next(new AppError("Invalid link collection index", 400));
  }

  section.image = result.secure_url;

  // Replace the section in the collection

  await collection.save();

  res.status(200).json({
    status: "success",
    data: {
      collection,
    },
  });
});

module.exports = {
  createCollection,
  getAllCollections,
  getCollectionDetails,
  updateCollection,
  getPublicPublicCollectionDetails,
  uploadImageForACollectionLink,
};
