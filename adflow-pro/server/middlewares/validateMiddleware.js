const validate = (schema) => (req, res, next) => {
  console.log('[VALIDATE MIDDLEWARE] Validating request body:', req.body);
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    console.log('[VALIDATE MIDDLEWARE] Validation errors:', errorMessages);
    return res.status(400).json({ errors: errorMessages });
  }
  console.log('[VALIDATE MIDDLEWARE] Validation passed');
  next();
};

module.exports = validate;
