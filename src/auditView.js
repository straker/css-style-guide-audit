/*jshint -W084 */
/* global console */

var trayHeight = 200;

// create a div that will push the content out of the way of the results tray
var push = document.createElement('div');
push.classList.add('audit-push-results');
document.body.appendChild(push);

// append the tray to body
var auditTool = document.createElement('div');
auditTool.setAttribute('class', 'audit-results');
document.body.appendChild(auditTool);

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
  '}';
trayStyle.appendChild(document.createTextNode(trayCss));
document.head.appendChild(trayStyle);

/**
 * Open the audit tool tray
 */
function openAuditTool(el) {
  console.log(el);
  document.body.classList.add('open-audit');

  // remove all previous results
  while (auditTool.firstChild) {
    auditTool.removeChild(el.firstChild);
  }

  // add audit results to popover
  var frag = document.createDocumentFragment();
  var ul = document.createElement('ul');
  var li;
  for (var i = 0, result; result = el.problems[i]; i++) {
    li = document.createElement('li');
    li.textContent = result.declaration + ' overridden by ' + result.styleSheet + '. Original value: ' + result.originalValue + '; Current value: ' + result.overriddenvalue;
    frag.appendChild(li);
  }
  ul.appendChild(frag);
  auditTool.appendChild(ul)
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
      console.log('click');
      e.preventDefault();
      openAuditTool(el);
      return;
    }
  } while (el = el.parentElement);

  // if no DOM found, close the tray
  try {
    document.body.classList.remove('open-audit');
  } catch (error) {}
});