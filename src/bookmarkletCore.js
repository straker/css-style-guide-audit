// by bringing in the audit code from Dropbox, we can change the code at any time
// and not have to force everyone to update their bookmarklet
var script = document.createElement('script');

script.onload = function() {
  var push = document.querySelector('.audit-push-results');
  push.removeAttribute('style');
  push.firstChild.removeAttribute('style');
  parseStyleSheets();
}

script.src = 'https://db.tt/yx4ODEVh';
document.head.appendChild(script);