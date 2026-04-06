const Joi = require('joi');

const createAdSchema = Joi.object({
  title: Joi.string().min(5).max(100).required(),
  description: Joi.string().min(10).required(),
  category: Joi.string().required(),
  city: Joi.string().required(),
  mediaURL: Joi.string().uri().allow('', null),
  package: Joi.string().valid('Basic', 'Standard', 'Premium').required(),
  publish_at: Joi.date().iso().allow(null).optional(),
});

module.exports = {
  createAdSchema
};
