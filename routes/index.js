var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api/v1', function(req, res) {
  res.send({message: "Request processed successfully."});
})


module.exports = router;
