require('dotenv').load();


console.log('app starting')

var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('express-flash');
var dbConfig = require('./db');
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt-nodejs');
var async = require('async');

// Connect to DB
mongoose.connect(dbConfig.url);

var app = express();
var timeline = require('./routes/timeline')
var tech_support = require('./routes/tech_support')
var tech_support_public = require('./routes/tech_support_public')
var shopify_transactions = require('./routes/shopify_transaction')
var shopify_product = require('./routes/shopify_product')
var shopify_order = require('./routes/shopify_order')
var shopify_product_status_app = require('./routes/shopify_product_status_app')
var shopify_aggregate = require('./routes/shopify_aggregate')
var logging_messages = require('./routes/logging_messages')
var check_ticket_file = require('./routes/check_csv_ticket_file')
var check_ticket_database = require('./routes/check_ticket_database')
var turnstiles_logging = require('./routes/remote/turnstiles_logging')
var kpi_aggregate = require('./routes/kpi_aggregate')	
	

//PERFORMANCE KPIS	
var raw_visits = require('./routes/raw_visits')
var retail_sales = require('./routes/performance/retail_sales')
var donations = require('./routes/performance/donations')
var giftaid = require('./routes/performance/giftaid')
var welcomedesk = require('./routes/performance/welcomedesk')
var learning = require('./routes/performance/learning')
var exhibitions_pwyt =  require('./routes/performance/exhibitions_pwyt')
var gallery_visits =  require('./routes/performance/gallery_visits')
var events =  require('./routes/performance/site_events.js')
var operations =  require('./routes/performance/operations.js')


var shopify = require('./routes/shopify')
var team = require('./routes/team')
var leave = require('./routes/leave')
var timeline_data_settings = require('./routes/timeline_data_settings')
var user_data = require('./routes/user_data')
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/lib', express.static(__dirname + '/lib/'));
app.use('/scripts', express.static(__dirname + '/node_modules/'));

// Configuring Passport
var passport = require('passport');
var expressSession = require('express-session');
// TODO - Why Do we need this key ?
app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());

 // Using the flash middleware provided by connect-flash to store messages in session
 // and displaying in templates
//var flash = require('connect-flash');
var flash = require('express-flash');
app.use(flash());

// Initialize Passport
var initPassport = require('./passport/init');
initPassport(passport);

var routes = require('./routes/index')(passport);
app.use('/', routes);
app.use('/timeline', timeline);
app.use('/tech_support', tech_support);
app.use('/tech_support_public', tech_support_public);
app.use('/turnstiles_logging', turnstiles_logging);

app.use('/shopify', shopify);
app.use('/team', team);
app.use('/leave', leave);
app.use('/timeline_data_settings', timeline_data_settings);
app.use('/user_data', user_data);
app.use('/shopify_transactions', shopify_transactions);
app.use('/shopify_product', shopify_product);
app.use('/shopify_order', shopify_order);

app.use('/shopify_product_status_app', shopify_product_status_app);
app.use('/logging_messages', logging_messages);
app.use('/shopify_aggregate', shopify_aggregate);
app.use('/check_ticket_file', check_ticket_file);
app.use('/check_ticket_database', check_ticket_database);

app.use('/raw_visits', raw_visits);
app.use('/kpi_aggregate', kpi_aggregate);

app.use('/retail_sales', retail_sales);
app.use('/donations', donations);
app.use('/giftaid', giftaid);
app.use('/welcomedesk', welcomedesk);
app.use('/learning', learning);
app.use('/exhibitions_pwyt', exhibitions_pwyt);
app.use('/gallery_visits', gallery_visits);
app.use('/events', events);
app.use('/operations', operations);


if(process.env.machine=="turnstile"){
	console.log('loading turnstile files')
	
	var Port_control= require('./data_loader/turnstiles/serialport-terminal')
		port_control=new Port_control()
		
	
	var Turnstile_control= require('./data_loader/turnstiles/turnstile-controller')
		turnstile_control = new Turnstile_control()
		var valid_tickets = turnstile_control.connect() 
		var port = port_control.open_port(valid_tickets)
		

	//from web app
	var check_com_port = require('./routes/check_com_port')
	var open_turnstile = require('./routes/open_turnstile')
	
	// open errors will be emitted as an error event
	global.port=port
	global.port_controller = port_control
	port_control.listen_data(valid_tickets)
	
	port_control.simulate("j488rm8sey9dt8fwhu935q5zz7usu2um")
	
	
	app.use('/check_com_port', check_com_port)
	app.use('/open_turnstile', open_turnstile);
	/*
	port.on('open', function() {
    port.write('main screen turn on', function(err) {
    
	if (err) {
      return console.log('Error on write: ', err.message);
    }
    console.log('message written');
  });
});

// open errors will be emitted as an error event
port.on('error', function(err) {
  console.log('Error: ', err.message);
})
	*/
}
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
module.exports = app;



