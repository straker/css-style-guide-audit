/*jshint -W084 */
var popoverMaxWidth = 300;
var popoverBuffer = 30;

/**
 * Open the audit popover and fill the data.
 * @param {Element} el - DOM element with the data-style-audit attribute.
 */
function openPopover(el) {
  debugger;

  popover.style.display = 'block';

  // remove all previous results
  while (popover.firstChild) {
    popover.removeChild(el.firstChild);
  }

  // add audit results to popover
  var frag = document.createDocumentFragment();
  var ul = document.createElement('ul');
  var li;
  for (var i = 0, result; result = el.problems[i]; i++) {
    li = document.createElement('li');
    li.textContent = result;
    frag.appendChild(li);
  }
  ul.appendChild(frag);
  popover.appendChild(ul);

  // determine where we can open the popover. defaults: right, bottom, top, left
  var rect = el.getBoundingClientRect();

  // open the popover to the right
  if (rect.left + rect.width + popoverMaxWidth + popoverBuffer < window.innerWidth) {
    popover.setAttribute('data-opened', 'right');
  }
  // open the popover to the bottom
  // else if (rect.top + rect.height + )
}

// setup a click handler on all audit elements to bring up a nice popover to display
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
      openPopover(el);
      return;
    }
  } while (el = el.parentElement);
});

// append the popover to body
var popover = document.createElement('div');
popover.setAttribute('class', 'audit-popover');
document.body.appendChild(popover);

// append a styles for the popover to body
var popoverStyle = document.createElement('style');
var popoverCss = '' +
  '.audit-popover {' +
    'position: absolute;' +
    'max-width: ' + popoverMaxWidth + 'px;' +
    'z-index: 100000;' +
    'box-shadow: 0 5px 10px rgba(0,0,0,.2);' +
    'border-radius: 6px;' +
    'background-clip: padding-box;' +
    'border: 1px solid #ccc;' +
    'border: 1px solid rgba(0,0,0,.2);' +
    'font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;' +
    'font-size: 14px;' +
    'font-weight: 400;' +
    'line-height: 1.42857143;' +
    'text-align: left;' +
    'white-space: normal;' +
    'background-color: #fff;' +
  '}' +
  '.audit-popover:before, .audit-popover:after {' +
    'content: "";' +
    'position: absolute;' +
    'width: 0;' +
    'height: 0;' +
    'border: 10px transparent solid;' +
  '}' +
  '.audit-popover:before {' +
    'border-width: 11px;' +
  '}' +
  '.audit-popover[data-opened="right"]:before {' +
    'top: 50%;' +
    'left: -12px;' +
    'margin-top: -11px;' +
    'border-right-color: #999;' +
    'border-right-color: rgba(0,0,0,.25);' +
    'border-left-width: 0;' +
  '}' +
  '.audit-popover[data-opened="right"]:after {' +
    'top: 50%;' +
    'left: -10px;' +
    'margin-top: -11px;' +
    'border-right-color: #fff;' +
    'border-left-width: 0;' +
  '}';
popoverStyle.appendChild(document.createTextNode(popoverCss));
document.head.appendChild(popoverStyle);