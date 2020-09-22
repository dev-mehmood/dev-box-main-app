const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const app = express();
const UserModel = require('./model/model');
const {ImportMapModel, seed} = require('./model/import-maps.model');
const favicon = require('serve-favicon');
const cache = require('./services/cache');
// seed import-map.json on restart
seed(); 
const path = require('path');
const cors = require('cors')
app.use(cors());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use(favicon(path.join(__dirname, 'public', 'images', 'box.png')));


require('./auth/auth');

app.get('/', function (req, res) {
  //https://devcenter.heroku.com/articles/config-vars
  let URL = 'https://dev-box-spa-staging.herokuapp.com/import-maps/import-map.json/?&timestamp=' + new Date().getTime();
  const mode = process.env.MODE ;
  
  switch (mode) {
    case 'production':
      URL = URL + '&mode=prod';
      break;
    case 'staging':
      URL = URL + '&mode=stage';
      break
    case 'review':
      if (process.env.HEROKU_APP_NAME) {
        URL = `https://${process.env.HEROKU_APP_NAME}.herokuapp.com/import-maps/import-map.json/?mode=stage&timestamp=` + new Date().getTime();
      }
      break;
    default:
      URL = 'http://localhost:3000/import-maps/import-map.json/?&mode=prod&timestamp=' + new Date().getTime();
      break
  }

  return res.render('index', {
    isLocal: process.env.IS_LOCAL === undefined ? false : true, 
    URL, 
    staging: process.env.MODE === 'staging',
    review: process.env.MODE === 'review'

  }); 

});

app.use( bodyParser.urlencoded({ extended : false }) );
app.use(bodyParser.json()); // support json encoded bodies
const routes = require('./routes/routes');
const import_maps = require('./routes/import-map.mongodb.routes');
const secureRoute = require('./routes/secure-routes');

app.use('/auth', routes);
app.use('/import-maps', import_maps );

//We plugin our jwt strategy as a middleware so only verified users can access this route
app.use('/user', passport.authenticate('jwt', { session : false }), secureRoute );

//Handle errors
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({ error : err });
});

app.listen(3000, () => {
  console.log('Server started')
});