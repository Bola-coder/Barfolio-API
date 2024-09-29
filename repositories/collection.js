const Collections = require("../models/collection.model");

const createNewCollection = (values) => {
  return new Collections(values)
    .save()
    .then((collection) => collection.toObject());
};

const getCollections = (userId) =>
  Collections.find({ active: true, user: userId })
    // .populate("user")
    .then((collections) =>
      collections.map((collection) => collection.toObject())
    );

const getCollectionById = (id) => Collections.findById(id);

const getCollectionByUserAndId = (userId, id) =>
  Collections.findOne({ _id: id, user: userId });

const getCollectionBySlug = (slug) =>
  Collections.findOne({ slug }).then((collection) => collection?.toObject());

const updateCollectionById = (id, values) =>
  Collections.findByIdAndUpdate(id, values, {
    new: true,
    runValidators: true,
    select: "-password -__v",
  }).then((collection) => collection?.toObject());

const deleteCollection = (id) => Collections.findByIdAndDelete(id);

module.exports = {
  createNewCollection,
  getCollections,
  getCollectionById,
  getCollectionByUserAndId,
  getCollectionBySlug,
  updateCollectionById,
  deleteCollection,
};
