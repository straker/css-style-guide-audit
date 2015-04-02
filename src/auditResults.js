/**
 * Produce a JSON audit.
* @param {string|string[]} patternLibrary - href substring that uniquely identifies the pattern library styleSheet(s)
 * @example
 *  // references any styleSheet that contains the text 'pattern-lib'
 *  // e.g. localhost/css/pattern-lib.css
 *  // e.g. http://myDomain/styles/pattern-lib-17D8401NDL.css
 *  auditResults('pattern-lib');
 */
function auditResults(patternLibrary) {
  var sheet = document.querySelector('link[href*="' + patternLibrary + '"]');
  var audit = {};
  var elms, el, declaration, value, elStyle;

  getStyleSheetRules(sheet, function(rules, href) {

    forEachRule(rules, function(rule) {

      try {
        elms = document.querySelectorAll(rule.selectorText);
      }
      catch(e) {
        return;
      }

      // loop through each element
      for (var i = 0, elmsLength = elms.length; i < elmsLength; i++) {
        el = elms[i];

        // loop through each rule declaration and check that the pattern library styles
        // are being applied
        for (var j = 0, styleLength = rule.style.length; j < styleLength; j++) {
          declaration = rule.style[j];
          value = rule.style[declaration];
          elStyle = el.computedStyles[declaration];

          if (elStyle[0].value !== value || elStyle[0].styleSheet !== href) {
            console.log('Pattern Library property ' + declaration + ' being overridden by selector "' + elStyle[0].selector + '"" on element');
            console.log(el);
          }
        }
      }
    });
  });
}