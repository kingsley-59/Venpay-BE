const { getUserWallet } = require('../controllers/wallet.controller');
const { jwtVerifyToken } = require('../middlewares/jwtVerify');

const router = require('express').Router();

router.get('/', jwtVerifyToken, getUserWallet);
router.get('/all');


const WalletRoutes = router;
module.exports = WalletRoutes;