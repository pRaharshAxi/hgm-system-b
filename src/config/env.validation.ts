import Joi from 'joi';

// Define a safe configuration template to avoid unsafe member access warnings
const validationSchemaMap = {
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  MONGODB_URI: Joi.string().required(),
  ELASTICSEARCH_NODE: Joi.string().required(),
  ELASTICSEARCH_USERNAME: Joi.string().required(),
  ELASTICSEARCH_PASSWORD: Joi.string().required(),
  RABBITMQ_URL: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),
  STRIPE_SECRET_KEY: Joi.string().required(),
  STRIPE_WEBHOOK_SECRET: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
};

export const envValidationSchema: Joi.ObjectSchema =
  Joi.object(validationSchemaMap);
