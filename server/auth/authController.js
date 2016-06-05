var connection = require('../db/connection.js');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');


//function that checks for existing email address within database- returns either true or false
//if false, there's nothing in the database corresponding to that email
var checkForExistingEmailInDatabase = function (req, res, callback) {
  const user = req.body;
  connection.query("select * from users where email = '" + user.email + "'", function(err, result) {
    console.log('result from querying users table in signup', result);
    if (err) { 
      console.log('error in querying users table');
    }
    // if the email already exists         
    if (result.rows.length) {
      console.log('That email is already taken');
    } else {
      callback(req, res);     
    } 
  });
};

var generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};


var insertIntoFarmsTable = function(req, res, token) {
  connection.query(
    `INSERT INTO farms (farm_name, location, phone)\
    VALUES ('${req.body.farmName}', '${req.body.farmLocation}', '${req.body.farmPhone}')`, 

    (err, result) => {
      if (err) {
        console.error('error in inserting into farms table:', err);
      } else {
        console.log('farm added!');
        res.status(201).json({
          user: req.body,
          token: token
        });
      }
    }
  );
};

var insertIntoUsersTable = function (req, res) {
  const user = req.body;
  const hash = generateHash(user.password);
  req.body.password = hash;

  const insertQuery = `INSERT INTO users (email, password, farmer) VALUES ('${user.email}', '${hash}', '${user.isFarmer}') RETURNING id`;
  connection.query(insertQuery, function(err, result) {
    if (err) { console.log('error in inserting user into users table'); }
    user.id = result.rows[0].id;
    const token = jwt.sign({
        id: user.id
      }, 'server secret', {
        expiresIn: '2h'
      });
    
    if (user.isFarmer == 'true') {
      insertIntoFarmsTable(req, res, token);
    } else {
      res.status(201).json({
        user: user,
        token: token
      });
    }
  });
};


exports.signup = function(req, res) {
  checkForExistingEmailInDatabase(req, res, insertIntoUsersTable);
};

exports.signin = function(req, res) {
  const email = req.body.email;
  // the password entered by the user
  const userPW = req.body.password;

  connection.query("select * from users where email = '" + email + "'", function(err, result) {
    console.log('result in signin of authcontroller', result);
    if (err) { 
      // return done(err); 
      console.log('error in querying users table');
    } else {
    // if email exists in db, compare user's entered PW to the one stored in the db
    const dbPassword = result.rows[0].password;
    bcrypt.compare(userPW, dbPassword, function(err, match) {
        if (err) { console.log('wrong password!'); }
        res.status(200).json({
          user: result.rows[0]
        });
    });
    } 
  });
};

