var express = require('express');
var router = express.Router();


var localAccountList = {
  'a@a.com': { password: 'abcd'},
  'b@b.com': { password: 'bcde'}
}

function findAccount(email) {
  if (email in localAccountList) { // .has_key(email)) {
    return localAccountList[email];
  }
  return null;
}

function validateAccount(account, pwdCandidate) {
  return (account.password == pwdCandidate);
}



/* GET users listing. */
router.get('/', function(req, res) {  
  // var thePassword = req.query.password;
  var badLogin = 0;     //(req.query.loggedIn == 2);
  var unknownLogin = 0; // (req.query.loggedIn == 3);
  var accountCreationFailed = 0;
  var accountCreationOK = 0;
  console.log('user route');

  // Clear the logged in user in all cases, to start off..!
  req.session.loggedInUser = null;

  if (!req.query.username || !req.query.password) {
    console.log('no uname or no pwd.'); // fall-through to render below.
  } else { // We have both username and a non-empty password.
    var account = findAccount(req.query.username);
    if (!account) {
      if (req.query.password2) { // Attempt at account creation.
        console.log('second password specified..');
        if (req.query.password2 == req.query.password) {
          console.log('double-verified matching passwords for account creation.');
          localAccountList[req.query.username] =  { password: req.query.password };
          req.query.password = ''; // User has to log in again, to check that new account has been created correctly..
          // thePassword = '';
          accountCreationOK = 1;
        } else {
          console.log('failed match on double password:' + req.query.password2 + '/' + req.query.password);
          accountCreationFailed = 1;
        }
      } else {
        console.log('account not found:' + req.query.username);
        unknownLogin = 1; // fall-through to render below.
      }
    } else { // The account exists.
      if (!validateAccount(account, req.query.password)) {
        console.log('wrong pwd for account.' + req.query.password );
        req.session.loggedInUser = null;
        badLogin = 1; // fall-through to render below.
      } else { // Password was correct.
        console.log('correct pwd for account.');
        req.session.loggedInUser = req.query.username;
        res.redirect('/page/0'); // root-slash-prefix required, otherwise it's relative..    
        return;
        /// res.render('index', { 
        ///  item: {title: 'Welcome!'},
        ///  comments: []
        ///} );
      }    
    } 
  }

  // params, we'd get from the path.
  //console.log('user', req.params.username);
  // console.log('user', req.query.username);  
  res.render('users', 
    { 
      username: req.query.username,
      password: req.query.password, // thePassword, // ,
      loggedIn: (req.session ? (req.session.loggedInUser ? 1:0) : 0), // (req.query.loggedIn==1),
      loggedInUser: (req.session ? (req.session.loggedInUser || 'no user in session') : 'no session'),
      badLogin: badLogin,
      unknownLogin: unknownLogin,
      accountCreationFailed: accountCreationFailed,
      accountCreationOK: accountCreationOK
    }
  );  

});

module.exports = router;
