const { getUsers, getUserById, updateProfile, deleteUser } = require('../controllers/users.controller');
const { jwtVerifyToken } = require('../middlewares/jwtVerify');
const router = require('express').Router();
require('dotenv').config();

router.get('/', jwtVerifyToken, getUsers);
router.get('/:id', jwtVerifyToken, getUserById);
router.put('/update/:id', jwtVerifyToken, updateProfile);
router.delete('/:id', jwtVerifyToken, deleteUser);

const userRoutes = router;
module.exports = userRoutes;