var LocalStrategy = require("passport-local").Strategy;

var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'target_database'
})

// connection.query('USE ' + dbconfig.database);


module.exports = function(passport) {
 passport.serializeUser(function(user, done){
  done(null, user.id);
 });

 passport.deserializeUser(function(id, done){
  connection.query("SELECT * FROM user WHERE id = ? ", [id],
   function(err, rows){
    done(err, rows[0]);
   });
 });

 passport.use(
  'business-signup',
  new LocalStrategy({
   usernameField : 'user_name',
   passwordField: 'password',
   passReqToCallback: true
  },
  function(req, user_name, password, done){
   connection.query("SELECT * FROM user WHERE user_name = ? ", 
   [user_name], function(err, rows){
    if(err)
     return done(err);
    if(rows.length){
     return done(null, false, req.flash('error', 'That is already taken'));
    }else{
     var newUserMysql = {
      user_name: user_name,
      password: bcrypt.hashSync(password, null, null)
     };

     var insertQuery = "INSERT INTO user (user_name, password) values (?, ?)";

     connection.query(insertQuery, [ 
       newUserMysql.user_name, 
       newUserMysql.password, 
      ],
      function(err, rows){
       newUserMysql.id = rows.insertId;

       return done(null, newUserMysql);
      });
    }
   });
  })
 );

 passport.use(
  'local-login',
  new LocalStrategy({
   usernameField : 'user_name',
   passwordField: 'password',
   passReqToCallback: true
  },
  function(req, user_name, password, done){
   connection.query("SELECT * FROM user WHERE user_name = ? ", [user_name],
   function(err, rows){
    if(err)
     return done(err);
    if(!rows.length){
     return done(null, false, req.flash('error', 'No User Found'));
    }
    if(!bcrypt.compareSync(password, rows[0].password))
     return done(null, false, req.flash('success', 'Wrong Password'));

    return done(null, rows[0]);
   });
  })
 );
};