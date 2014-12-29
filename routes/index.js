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



function sharedRender(req,res) {
  var current2 = req.params.id;
  if (!current2) { current2 = 0; }
  current2 = Number(current2);

  if (!subj_list[current2]) {
    res.render('error');  // todo - we should render something that says 'still loading'.
  }

  console.log('current2:' + current2);
  var sUrl = subj_list[current2].href;
  var itemUrl = url.parse(sUrl);

  var options = {
    host: itemUrl.hostname,
    path: itemUrl.pathname,
    port: 80
  };

  
  function makeMyFunction(req,res, current2) {
    console.log('making my function.., cur2 was:' + current2);

    function anon(resp) { // , current2) {
      var body = '';
      console.log('arriving in anon.., cur2 was:' + current2);

      resp.on('data', function(chunk) { 
        // console.log('getting chunks..');
        body += chunk; 
      }); 

      resp.on('end', function() { 
        console.log('got article!, cur2 was:' + current2); 
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

        console.log('current2:' + current2);
        console.log('subj_list:' + subj_list);
        console.log('length:' + subj_list.length);
        res.render('index', 
          { 
            item: subj_list[current2], 
            current2: current2,
            comments: comments
          }
        );  

      }); // resp-end.    

      // res.render('index', { item: subj_list[current], current: current });  
    } // anon-f.

    console.log('returning my function.');
    return anon; // in makeMyFunction.
  } // end makeMyFunction.

  console.log('trying to get my function.., cur2 was:' + current2);
  myClosure = makeMyFunction(req,res,current2);
  console.log('gotten function..');

  // I need req,res in there..
  console.log('passing function to http-get..');
  http.get(options, myClosure); // http.get.

} // end sharedRender.





/* GET home page. */
router.get('/', function(req, res) {
  console.log("handler for / root");
  sharedRender(req,res);
});

router.get('/page/:id', function(req, res) {
  sharedRender(req,res);
});

router.get('/next/:id', function(req, res) {
  current += 1;
  if (current >= subj_list.length) { current = 0; }
  sharedRender(req,res);
});

router.get('/prev/:id', function(req, res) {
  current -= 1;
  if (current < 0) { current = subj_list.length - 1; }
  sharedRender(req,res);
});

router.get('/reset', function(req, res) {
  console.log("trying reset..");
  current = 0;
  implReset(req,res);
  //console.log("reset completed, now trying render..");
  // We can't do this here:
  //sharedRender(req,res);
});

module.exports = router;
