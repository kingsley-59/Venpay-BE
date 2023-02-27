const { resolveBankDetails, getAllBanks } = require('../controllers/bank.controller');

const router = require('express').Router();

router.get('/all', getAllBanks);
router.post('/resolve', resolveBankDetails);


const BankRoutes = router;
module.exports = BankRoutes;