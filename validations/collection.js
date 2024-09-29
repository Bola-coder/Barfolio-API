const joi = require("joi");

const createCollectionValidation = joi.object({
  title: joi.string().required().error(new Error("Please provide a title")),
  description: joi
    .string()
    .required()
    .error(new Error("Please provide a description")),
  logo: joi.string().error(new Error("Please provide a logo")),
  linkCollection: joi.array().items(
    joi.object({
      header: joi
        .string()
        .required()
        .error(new Error("Please provide a header")),
      contact: joi.string().error(new Error("Please provide a contact")),
      image: joi.string().error(new Error("Please provide an image")),
      links: joi.array().items(
        joi.object({
          title: joi
            .string()
            .required()
            .error(new Error("Please provide a title")),
          url: joi.string().required().error(new Error("Please provide a url")),
        })
      ),
    })
  ),
  user: joi.string(),
});

module.exports = {
  createCollectionValidation,
};
