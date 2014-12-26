var express = require('express');
var http = require('http');
var cheerio = require('cheerio');
var url = require('url');

var router = express.Router();

var current = 1; 
var subj_list = [];


function implReset(req,res) {
  // Clear global variables:
  console.log("implReset: getting subject list from reddit..");
  current = 0;    
  subj_list = [];

  var options = {
    host: 'www.reddit.com',
    path: '/r/wow',
    port: 80
  };

  http.get(options, function(resp) {
    var body = '';

    resp.on('data', function(chunk) { body += chunk; });
    
    resp.on('end', function() { 
      console.log('done getting subject list!'); 
      // console.log(body);
      var $ = cheerio.load(body);

      // var $out = cheerio.load('<div class="root1"></div>');

      $('div.entry').each( function(ix,elm) {

        var a1 = $('a.title', this); // TITLE:
        var title = a1.text();

        var t1 = $('a.comments', this); // COMMENTS LINK:
        var href = t1.attr('href');

        subj_list.push(
          { title: title, href: href }
        );

        /*
        $out('.root1').append('<div class="unit"></div>');

        $out('.unit').last().append('<div class="author"></div>');
        $out('.author').last().append(author);

        $out('.unit').last().append('<div class="comment"></div>');
        $out('.comment').last().append(comment);
        */

      });

      console.log('nr of subj items:' + subj_list.length);
      if (res) {
        sharedRender(req,res);
      } else {
        console.log('cant render atm');
      }
    });

  }).on("error", function(e) {
    console.log("Got error: " + e.message);
  });

}



implReset();



function sharedRender(req,res) {
  if (!subj_list[current]) {
    res.render('error');  // todo - we should render something that says 'still loading'.
  }

  var sUrl = subj_list[current].href;
  var itemUrl = url.parse(sUrl);

  var options = {
    host: itemUrl.hostname,
    path: itemUrl.pathname,
    port: 80
  };

  
  function makeMyFunction(req,res) {
    console.log('making my function..');

    function anon(resp) {
      var body = '';
      console.log('arriving in anon..');

      resp.on('data', function(chunk) { 
        console.log('getting chunks..');
        body += chunk; 
      }); 

      resp.on('end', function() { 
        console.log('got article!'); 
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

        res.render('index', 
          { 
            item: subj_list[current], 
            current: current,
            comments: comments
          }
        );  

      }); // resp-end.    

      // res.render('index', { item: subj_list[current], current: current });  
    } // anon-f.

    console.log('returning my function.');
    return anon;
  } 

  console.log('trying to get my function..');
  myClosure = makeMyFunction(req,res);
  console.log('gotten function..');

  // I need req,res in there..
  console.log('passing function to http-get..');
  http.get(options, myClosure); // http.get.

}





/* GET home page. */
router.get('/', function(req, res) {
  sharedRender(req,res);
});

router.get('/next', function(req, res) {
  current += 1;
  if (current >= subj_list.length) { current = 0; }
  sharedRender(req,res);
});

router.get('/prev', function(req, res) {
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
