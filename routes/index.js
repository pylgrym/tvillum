var express = require('express');
var http = require('http');
var cheerio = require('cheerio');
var url = require('url');

var router = express.Router();

// var current = 1; 
var subj_list = [];


function implReset(req,res) {
  // Clear global variables:
  console.log("implReset: getting subject list from reddit..");
  // a placeholder until we've retrieved the list..
  subj_list = [
    { title: "still reading subjects..", href: "www.google.com" }
  ];

  var options = {
    host: 'www.reddit.com',
    path: '/r/wow',
    port: 80
  };

  http.get(options, function(resp) {
    var body = '';

    resp.on('data', function(chunk) { body += chunk; });
    
    resp.on('end', function() { 
      console.log('done getting subject list! now scanning it.'); 
      var subj_list_tmp = [];

      var $ = cheerio.load(body);
      $('div.entry').each( function(ix,elm) {        
        subj_list_tmp.push({ 
          title: $('a.title', this).text(), 
          href:  $('a.comments', this).attr('href')
        });
      });

      // Now substitute the completed list:
      subj_list = subj_list_tmp;
      console.log('nr of subj items:' + subj_list.length);

      if (res) {
        sharedRender(req,res);
      } else {
        console.log('cant render atm');
      }
      console.log("implReset callback has finished.");
      console.log(" "); // spacing.
    });

  }).on("error", function(e) {
    console.log("Got error: " + e.message);
  });

} // end implreset.



implReset();







function sharedRender(req,res, fromUrl, fromForm) {
  var curPage_pa; // Just 'pa_rameter'.

  if (fromUrl) { // If page-nr is specified in URL, it wins:
    curPage_pa = fromUrl;
  } else {
    curPage_pa = fromForm;
  }

  curPage_pa = Number(curPage_pa); // We do this to make +1, -1 work.

  if (!subj_list[curPage_pa]) {
    res.render('error');  // todo - we should render something that says 'still loading'.
  }

  console.log('curPage:' + curPage_pa);
  var sUrl = subj_list[curPage_pa].href;
  var itemUrl = url.parse(sUrl);

  var options = {
    host: itemUrl.hostname,
    path: itemUrl.pathname,
    port: 80
  };

  
  function makeMyFunction(req,res, curPage_cl) {
    console.log('making my function..'); //, cur was:' + curPage);
    // JG: the only purpose of 'makemyfunction' is to provide a scope for function 'anon',
    // where it can see the original parameter '..cl' (closure).

    function anon(resp) { // (Is in scope of makeMyFunction, and can see parameter curPage_cl.)
      var body = '';
      console.log('arriving in anon..'); //, cur2 was:' + curPage_cl);

      resp.on('data', function(chunk) { body += chunk; }); 

      resp.on('end', function() { 
        console.log('got article!'); //, cur2 was:' + curPage); 
        var $ = cheerio.load(body);
        var comments = [];

        $('.entry').each( function(ix,elm) {

          var a1 = $('.author', this); // author.
          var author = a1.text();

          var t1 = $('.md', this); // COMMENT.
          var comment = t1.html(); // attr('href');

          // now do something..
          // console.log('author:' + author);
          comments.push( { author: author, comment: comment} );
        }); // each-loop.

        //console.log('curPage just before render:' + curPage);
        console.log('length:' + subj_list.length);
        res.render('index', 
          { 
            item: subj_list[curPage_cl], 
            curPage_jd: curPage_cl,
            comments: comments
          }
        );  

      }); // resp-end.    

    } // anon-f.

    console.log('returning my function.');
    return anon; // in makeMyFunction.
  } // end makeMyFunction.

  console.log('trying to get my function..'); //, cur2 was:' + curPage);
  myClosure = makeMyFunction(req,res,curPage_pa);
  console.log('gotten function..');

  // I need req,res in there..
  console.log('passing function to http-get..');
  http.get(options, myClosure); // http.get.

} // end sharedRender.





/* GET home page. */
router.get('/', function(req, res) {
  sharedRender(req, res, 0, null);
});

router.get('/page/:id', function(req, res) { // REST style query, page nr is in url path:
  sharedRender(req, res, req.params.id, null);
});

router.get('/page', function(req, res) { // req.querystring.
  sharedRender(req, res, null, req.query.curPage_fm);  // For this case, we assume edit-nr-form
});


router.get('/reset', function(req, res) {
  console.log("trying reset..");
  current = 0;
  implReset(req,res);
  console.log("reset completed..");
});

module.exports = router;
