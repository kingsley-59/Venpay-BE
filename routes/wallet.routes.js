const { getUserWallet, getAllUserWallets, changeTransactionPin, setTransactionPin } = require('../controllers/wallet.controller');
const { jwtVerifyToken, onlyAdmins } = require('../middlewares/jwtVerify');
const { ChangePinSchema } = require('../middlewares/validator');

const validator = require('express-joi-validation').createValidator({});
const router = require('express').Router();

router.get('/', jwtVerifyToken, getUserWallet);
router.get('/all', jwtVerifyToken, onlyAdmins, getAllUserWallets);
router.post('/set-pin', jwtVerifyToken, setTransactionPin);
router.put('/change-pin', jwtVerifyToken, validator.body(ChangePinSchema), changeTransactionPin);


const WalletRoutes = router;
module.exports = WalletRoutes;