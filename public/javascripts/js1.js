

window.addEventListener( "resize", function(e) {
  // var mv = document.getElementById('theviewport');
  // mv.setAttribute('content','width='+window.innerWidth);

  var mv2 = document.getElementById('the_body');
  mv2.setAttribute('style', 'width: ' + window.innerWidth + 'px;');
});
