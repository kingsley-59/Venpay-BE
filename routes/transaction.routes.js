const { sendMoneyController, generateVirtualAccount, fundVirtualAccountWebhook, withdrawController } = require('../controllers/transaction.controller');
const { jwtVerifyToken } = require('../middlewares/jwtVerify');

const router = require('express').Router();

router.get('/id/:id', jwtVerifyToken);
router.get('/ref/:reference', jwtVerifyToken);
router.post('/send-money', jwtVerifyToken, sendMoneyController);
router.post('/receive-money', jwtVerifyToken);
router.post('/top-up/generate-acct', jwtVerifyToken, generateVirtualAccount);
router.post('/withdraw', jwtVerifyToken, withdrawController);

/** Webhook/Callback routes */
router.post('/webhook', fundVirtualAccountWebhook);


const TransactionRoutes = router;
module.exports = TransactionRoutes;