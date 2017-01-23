/* global parseStyleSheets */

// by bringing in the audit code from Dropbox, we can change the code at any time
// and not have to force everyone to update their bookmarklet
var script = document.createElement('script');

script.onload = function() {
  var push = document.querySelector('.audit-push-results');
  push.removeAttribute('style');
  push.firstChild.removeAttribute('style');
  parseStyleSheets();
};

script.src = 'https://dl.dropboxusercontent.com/u/22115399/index-1.0.1.min.js';
document.head.appendChild(script);