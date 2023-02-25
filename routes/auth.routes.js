const router = require('express').Router();
const { googleVerify, register, login, generateOtp, verifyOtp } = require('../controllers/auth.controller');
const { RegisterSchema } = require('../middlewares/validator');
require('dotenv').config();
const validator = require('express-joi-validation').createValidator({});


router.get('/generate-otp', generateOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register', validator.body(RegisterSchema), register);
router.post('/login', login);
router.post('/google/verify', googleVerify);

const authRoutes = router;
module.exports = authRoutes;