/*jshint -W083 */
/*jshint -W084 */
/*jshint unused:false */
/* global console, getStyleSheetRules, forEachRule */

var audit = {elms: []};

/**
 * Produce a JSON audit.
 * @param {string|string[]} patternLibrary - href substring that uniquely identifies the pattern library styleSheet(s)
 * @param {string|string[]} ignoreSheet - href substring that uniquely identifies any styleSheets that should be ignored in the audit
 * @example
 *  // references any styleSheet that contains the text 'pattern-lib'
 *  // e.g. localhost/css/pattern-lib.css
 *  // e.g. http://myDomain/styles/pattern-lib-17D8401NDL.css
 *  auditResults('pattern-lib');
 */
function auditResults(patternLibrary, ignoreSheet) {
  if (!Array.isArray(patternLibrary)) {
    patternLibrary = [patternLibrary];
  }

  if (!Array.isArray(ignoreSheet)) {
    ignoreSheet = [ignoreSheet];
  }

  // reset previous audit
  for (var z = 0, elm; elm = audit.elms[z]; z++) {
    elm.style.background = '';
    elm.title = '';
    elm.problems = [];
  }
  audit = {elms: []};

  // loop through each provided pattern library
  var link, sheet, elms, el, declaration, value, elStyle;
  for (var i = 0, patternLib; patternLib = patternLibrary[i]; i++) {
    link = document.querySelector('link[href*="' + patternLib + '"]');

    if (!link) {
      continue;
    }

    sheet = link.sheet;

    getStyleSheetRules(sheet, function(rules, href) {

      forEachRule(rules, function(rule) {

        try {
          elms = document.querySelectorAll(rule.selectorText);
        }
        catch(e) {
          return;
        }

        // loop through each element
        for (var j = 0, elmsLength = elms.length; j < elmsLength; j++) {
          el = elms[j];

          // loop through each rule declaration and check that the pattern library styles
          // are being applied
          for (var k = 0, styleLength = rule.style.length; k < styleLength; k++) {
            declaration = rule.style[k];
            value = rule.style[declaration];
            elStyle = el.computedStyles[declaration];

            if (elStyle[0].styleSheet !== href) {
              // make sure the styleSheet isn't in the ignore list
              var ignored = false;
              for (var x = 0, ignore; ignore = ignoreSheet[x]; x++) {
                if (elStyle[0].styleSheet.indexOf(ignore) !== -1) {
                  ignored = true;
                  break;
                }
              }

              if (!ignored) {
                el.problems = el.problems || [];
                el.problems.push('Property "' + declaration + '" being overridden by selector "' + elStyle[0].selector + '" from styleSheet ' + elStyle[0].styleSheet + '. Pattern Library value: "' + value + '," Override: "' + elStyle[0].value + '"');

                if (audit.elms.indexOf(el) === -1) {
                  audit.elms.push(el);
                }
              }
            }
          }
        }
      });

      // change the background color of all elements
      for (var z = 0, elm; elm = audit.elms[z]; z++) {
        elm.style.background = 'salmon';
        elm.setAttribute('data-style-audit', 'property-override');
      }

    });
  }
}