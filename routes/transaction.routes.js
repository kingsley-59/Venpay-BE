const { sendMoneyController } = require('../controllers/transaction.controller');
const { jwtVerifyToken } = require('../middlewares/jwtVerify');

const router = require('express').Router();

router.post('/send-money', jwtVerifyToken, sendMoneyController);


const TransactionRoutes = router;
module.exports = TransactionRoutes;