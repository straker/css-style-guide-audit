/*jshint -W084 */
/* global console, preventParentScroll */

var trayHeight = 200;

// create a div that will push the content out of the way of the results tray
var push = document.createElement('div');
push.classList.add('audit-push-results');
document.body.appendChild(push);

// append the tray to body
var auditTool = document.createElement('div');
auditTool.setAttribute('class', 'audit-results');
document.body.appendChild(auditTool);
preventParentScroll(auditTool);

// create a title for the tray
var code = document.createElement('code');
code.setAttribute('class', 'language-markup');
var pre = document.createElement('pre');
pre.appendChild(code);

var title = document.createElement('div');
title.setAttribute('class', 'audit-results__title');
title.appendChild(pre);
auditTool.appendChild(title);

// create a container for the results
var container = document.createElement('div');
container.setAttribute('class', 'audit-results__body');
auditTool.appendChild(container);

// append a styles for the tray to body
var trayStyle = document.createElement('style');
var trayCss = '' +
  '.audit-results {' +
    'position: fixed;' +
    'bottom: -' + trayHeight + 'px;' +
    'left: 0;' +
    'right: 0;' +
    'height: ' + trayHeight + 'px;' +
    'background: white;' +
    'border-top: 0 solid black;' +
    'transition: bottom 300ms, border 300ms;' +
    'overflow-y: auto;' +
  '}' +
  'body.open-audit .audit-results {' +
    'bottom: 0;' +
    'border-top-width: 1px;' +
  '}' +
  '.audit-push-results {' +
    'height: 0;' +
    'transition: height 300ms;' +
  '}' +
  'body.open-audit .audit-push-results {' +
    'height: ' + trayHeight + 'px;' +
  '}' +
  '.audit-results__body {' +
    'padding: 1em;' +
  '}' +
  // override bootstrap and prism styles
  '.audit-results pre[class*=language-] {' +
    'border-radius: 0;' +
    'margin: 0;' +
  '}' +
  '.audit-results pre[class*=language-]>code[data-language]::before {' +
    'display: none;' +
  '}' +
  // make all audit elements a different color
  '[data-style-audit] {' +
    'background: salmon !important;' +
  '}';
trayStyle.appendChild(document.createTextNode(trayCss));
document.head.appendChild(trayStyle);

// load prism.js syntax highlighting
var prismJS = document.createElement('script');
prismJS.setAttribute('async', true);
prismJS.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/0.0.1/prism.js';
document.body.appendChild(prismJS);
var prismCSS = document.createElement('link');
prismCSS.setAttribute('rel', 'stylesheet');
prismCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/0.0.1/prism.min.css';
document.head.appendChild(prismCSS);

/**
 * Escape <, >, and "" for output.
 * @param {string} str - String of HTML to escape.
 * @returns {string}
 * @see http://stackoverflow.com/questions/5406373/how-can-i-display-html-tags-inside-and-html-document
 */
function escapeHTML(str) {
  return str.replace(/>/g,'&gt;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
}

/**
 * Open the audit tool tray
 * @param {Element} el - Element to view audit results on.
 */
function openAuditTool(el) {
  document.body.classList.add('open-audit');

  // remove all previous results
  container.innerHTML = '';

  // set the title
  var wrap = document.createElement('div');
  wrap.appendChild(el.cloneNode(false));
  wrap.firstChild.removeAttribute('data-style-audit');
  code.innerHTML = escapeHTML(wrap.innerHTML);
  Prism.highlightElement(code);

  // add audit results to container
  var frag = document.createDocumentFragment();
  var ul = document.createElement('ul');
  var li;
  for (var i = 0, result; result = el.problems[i]; i++) {
    li = document.createElement('li');
    li.innerHTML = '<label><input type="checkbox"/>' + result.description + '</label>';
    frag.appendChild(li);
  }
  ul.appendChild(frag);
  container.appendChild(ul);
}

// setup a click handler on all audit elements to bring up a nice tray to display
// the audit results
document.body.addEventListener('click', function(e) {
  var el = e.target;

  if (!el) {
    return;
  }

  // walk the DOM tree looking for an element with the data-style-audit attribute
  do {
    if (el.getAttribute('data-style-audit')) {
      e.preventDefault();
      openAuditTool(el);
      return;
    }
    // if we clicked inside the audit-tool, don't close
    else if (el.classList.contains('audit-results')) {
      return;
    }
  } while (el = el.parentElement);

  // if no DOM found, close the tray
  try {
    document.body.classList.remove('open-audit');
  } catch (error) {}
}, true);