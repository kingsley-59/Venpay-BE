const router = require('express').Router();
const { googleVerify, register, login } = require('../controllers/auth.controller');
require('dotenv').config();


router.post('/register', register);
router.post('/login', login);
router.post('/google/verify', googleVerify);


module.exports = router;