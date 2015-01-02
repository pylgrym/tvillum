var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  console.log('user route');
  // params, we'd get from the path.
  //console.log('user', req.params.username);
  console.log('user', req.query.username);
  res.render('users', 
    { 
      username: req.query.username,
      password: req.query.password,
      loggedIn: req.query.loggedIn
    }
  );  

});

module.exports = router;
