/*jshint -W083 */
/*jshint -W084 */
/*jshint unused:false */
/* global getStyleSheetRules, forEachRule, SPECIFICITY */

/**
 * Sort a computedStyle by specificity order
 * @param {object} a
 * @param {object} b
 * @returns {number}
 */
function specificitySort(a, b) {
  return b.specificity[0] - a.specificity[0] ||
         b.specificity[1] - a.specificity[1] ||
         b.specificity[2] - a.specificity[2] ||
         b.specificity[3] - a.specificity[3] ||
         b.index - a.index;
}

/**
 * Return the highest selector specificity.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
function compareSpecificity(a, b) {
  for (var i = 0; i < 4; i++) {
    if (a[i] > b[i]) { return a; }
    if (b[i] > a[i]) { return b; }
  }

  // when both specificities tie, it doesn't matter which one is returned
  return a;
}

/**
 * Parse all the styleSheets on the page and determine which rules apply to which elements.
 */
function parseStyleSheets() {
  var sheets = document.styleSheets;
  var sheet, selectors, selector, specificity, elms, el, declaration, value, elStyle;

  // loop through each styleSheet
  for (var i = 0, sheetLength = sheets.length; i < sheetLength; i++) {
    sheet = sheets[i];

    // TODO: as an async call, this no longer returns the stylesheets in the order in which
    // they are listed. instead, it returns them in the order that they are retrieved from
    // the server.
    (function(index) {
      getStyleSheetRules(sheet, function(rules, href) {

        forEachRule(rules, function(rule) {
          // deal with each selector individually since each selector can have it's own
          // level of specificity
          selectors = rule.selectorText.split(',');

          for (var j = 0; selector = selectors[j]; j++) {
            specificity = SPECIFICITY.calculate(selector)[0].specificity.split(',').map(Number);

            try {
              elms = document.querySelectorAll(selector);
            }
            catch(e) {
              continue;
            }

            // loop through each element and set their computedStyles property
            for (var k = 0, elmsLength = elms.length; k < elmsLength; k++) {
              el = elms[k];
              el.computedStyles = el.computedStyles || {};

              // loop through each rule declaration and set the value in computedStyles
              for (var x = 0, styleLength = rule.style.length; x < styleLength; x++) {
                declaration = rule.style[x];
                value = rule.style[declaration];

                el.computedStyles[declaration] = el.computedStyles[declaration] || [];
                elStyle = el.computedStyles[declaration];

                // check that this selector isn't already being applied to this element
                var ruleApplied = false;
                for (var y = 0, elLength = elStyle.length; y < elLength; y++) {
                  if (elStyle[y].selector === rule.selectorText &&
                      elStyle[y].styleSheet === href) {

                    elStyle[y].specificity = compareSpecificity(elStyle[y].specificity, specificity);
                    ruleApplied = true;
                    break;
                  }
                }

                if (!ruleApplied) {
                  elStyle.push({
                    value: value,
                    styleSheet: href,
                    specificity: specificity,
                    selector: rule.selectorText,  // we want the entire selector
                    index: index  // order of the stylesheet for resolving specificity ties
                  });
                }

                // sort declaration styles by specificity (i.e. how the browser would
                // apply the style)
                elStyle.sort(specificitySort);
              }
            }
          }
        });
      });
    })(i);
  }
}