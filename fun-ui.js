function onload() {

  // prepopulate the filter with the current domain
  populateCurrentDomain()

  // run lookup

}

document.addEventListener('DOMContentLoaded', function() {
  onload();
  document.querySelector('#search').addEventListener('click', function() { onChangeState() });
  document.querySelector('#search').innerText = '\u{1f50d}';
});