var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();

const indexRouter = require('./routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const TransactionRoutes = require('./routes/transaction.routes');
const WalletRoutes = require('./routes/wallet.routes');
const BankRoutes = require('./routes/bank.routes');

// DB connection
const MONGODB_URL = process.env.MONGODB_URL;
const mongoose = require('mongoose');

mongoose
  .connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((conn) => {
    //don't show the log when it is test
    if (process.env.NODE_ENV !== 'test') {
      console.log('\nConnected to %s', mongoose.connection.host);
      console.log('App is running ... \n');
      console.log('Press CTRL + C to stop the process. \n');
    }
  })
  .catch((err) => {
    console.error('App starting error:', err.message);
    process.exit(1);
  });


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/transactions', TransactionRoutes);
app.use('/api/v1/wallet', WalletRoutes);
app.use('/api/v1/banks', BankRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
