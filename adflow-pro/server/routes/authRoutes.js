const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { registerSchema, loginSchema } = require('../validators/authValidator');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, getMe);

module.exports = router;
