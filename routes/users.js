var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  var badLogin     = (req.query.loggedIn == 2);
  var unknownLogin = (req.query.loggedIn == 3);
  console.log('user route');
  // params, we'd get from the path.
  //console.log('user', req.params.username);
  console.log('user', req.query.username);  
  res.render('users', 
    { 
      username: req.query.username,
      password: req.query.password,
      loggedIn: (req.query.loggedIn==1),
      badLogin: badLogin,
      unknownLogin: unknownLogin
    }
  );  

});

module.exports = router;
