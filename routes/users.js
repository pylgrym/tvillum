var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  console.log('user route');
  res.render('users', 
    { 
      username: 'john@funnyfield.com',
      password: '***not',
      loggedIn: false
      //item: subj_list[curPage_cl], 
      //curPage_jd: curPage_cl,
      //comments: comments
    }
  );  

});

module.exports = router;
