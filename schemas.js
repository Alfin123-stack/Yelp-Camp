const Joi = require("joi");

const imageSchema = Joi.object({
  url: Joi.string().uri().required(),
  filename: Joi.string().required(),
});

module.exports.campgroundSchema = Joi.object({
  title: Joi.string().required(),
  price: Joi.number().required().min(0),
  //   image: Joi.array().items(imageSchema).required(),
  location: Joi.string().required(),
  description: Joi.string().required(),
  deleteImages: Joi.array(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required(),
  }).required(),
});
