/*jshint -W084 */
/* global container, auditTool, code, Prism */

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
  auditTool.scrollTop = 0;

  // set the title
  var wrap = document.createElement('div');
  wrap.appendChild(el.cloneNode(false));
  wrap.firstChild.removeAttribute('data-style-audit');
  wrap.firstChild.removeAttribute('data-style-computed');
  wrap.firstChild.removeAttribute('data-style-using');
  code.innerHTML = escapeHTML(wrap.innerHTML);
  Prism.highlightElement(code);

  // add audit results to container
  var frag = document.createDocumentFragment();
  var ul = document.createElement('ul');
  var li;
  for (var i = 0, result; result = el.problems[i]; i++) {
    li = document.createElement('li');
    li.innerHTML = ''+
      '<div>' +
        // TODO: add title "Don't show me again" when I have a way to ignore results
        '<input id="audit-result-' + i + '" type="checkbox"/>' +
      '</div>' +
      '<div>' +
        // TODO: add title "Don't show me again" when I have a way to ignore results
        /*'<label for="audit-result-' + i + '">' + */result.description/* + '</label>'*/ +
      '</div>';
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
    if (el.getAttribute('data-style-audit') !== null) {
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