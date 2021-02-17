import Joi from 'joi';

const schema = Joi.object({
    description: Joi.string().trim().required(),
    amout: Joi.number().required(),
    date: Joi.date().required(),
})

export default schema;