const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html'); //provides a simple HTML sanitizer

/*自定义extension, 用于构造一个方法去组织html端 乱输入 html or js语句*/
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});
const Joi = BaseJoi.extend(extension)
/**用于 add new campground server端验证**/
module.exports.campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required().escapeHTML(),
    price: Joi.number().required().min(0),
    location: Joi.string().required().escapeHTML(),
    //image: Joi.string(),
    description: Joi.string().escapeHTML()
  }).required(),
  deleteImage: Joi.array()
});
/**用于 add new review of a campground server端验证**/
module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required(),
    body: Joi.string().required().escapeHTML()
  }).required()
});
