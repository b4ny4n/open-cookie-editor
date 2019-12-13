function onload() {

  // prepopulate the filter with the current domain
  populateCurrentDomain()

  // run lookup

}

document.addEventListener('DOMContentLoaded', function() {
  onload();
  document.querySelector('#lookup').addEventListener('click', function() { onChangeState() });
});