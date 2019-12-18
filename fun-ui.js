function onload() {

  // prepopulate the filter with the current domain
  populateCurrentDomain()
  var ENTER = 13;

  window.onkeydown = function(event) {
    if (event.keyCode == ENTER) {
      onChangeState();
    } 
  } 
  // run lookup

}

document.addEventListener('DOMContentLoaded', function() {
  onload();
  document.querySelector('#search').addEventListener('click', function() { onChangeState() });
  document.querySelector('#makecookiebutton').addEventListener('click', function() { newCookieVisible(); });
  document.querySelector('#createcookiebutton').addEventListener('click', function() { createNewCookie(); });
  document.querySelector('#deleteall').addEventListener('click', function() { deleteAllCookies(); });
  document.querySelector('#search').innerText = '\u{1f50d}';
  document.querySelector('#cookieFilter').onkeyup =function() {  console.log("received keyup");  renderCookiesFromCache(document.querySelector('#cookieFilter').value); };
  document.querySelector('#cancelcookiebutton').addEventListener('click',function() {  document.querySelector('#cookiecreatediv').hidden=true; });

});