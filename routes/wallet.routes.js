const { generateVirtualAccount } = require('../controllers/transaction.controller');
const { jwtVerifyToken } = require('../middlewares/jwtVerify');

const router = require('express').Router();

router.get('/generate/virtual-acct', jwtVerifyToken, generateVirtualAccount);


const WalletRoutes = router;
module.exports = TransactionRoutes;