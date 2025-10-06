const Joi = require("joi");
const { password } = require("./custom.validation");

const changePassword = {
  body: Joi.object().keys({
    old: Joi.custom(password).required(),
    new: Joi.custom(password).required(),
  }),
};

const updateUserProfile = {
  body: Joi.object().keys({
    full_name: Joi.string().optional(),
    phone: Joi.string().optional(),
    id_number: Joi.string().optional(),
    address: Joi.string().optional(),
    company_name: Joi.string().optional(),
    onboarding_completed: Joi.boolean().optional(),
    onboarding_completed_at: Joi.string().optional(),
    user_type: Joi.string().optional(),
    business_type: Joi.string().optional(),
    industry: Joi.string().optional(),
    company_size: Joi.string().optional(),
    primary_use_case: Joi.string().optional(),
    preferred_language: Joi.string().optional(),
    marketing_consent: Joi.boolean().optional(),
    profile_completion_percentage: Joi.number().optional(),
    contract_frequency: Joi.string().optional(),
  }),
};

module.exports = {
  changePassword,
  updateUserProfile,
};
