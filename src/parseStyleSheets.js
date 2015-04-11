/*jshint -W083 */
/*jshint -W084 */
/*jshint unused:false */
/* global getStyleSheetRules, forEachRule, SPECIFICITY, push, getStyleValue */

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
  push.setAttribute('data-loading', 'true');

  // allow the loading screen to show
  setTimeout(function() {
    // clear all previous parsing
    var all = document.querySelectorAll('[data-style-computed]');
    var i, allLength, sheetLength;
    for (i = 0, allLength = all.length; i < allLength; i++) {
      all[i].computedStyles = {};
    }

    var sheets = document.styleSheets;
    var count = 0;
    var sheet, selectors, selector, specificity, elms, el, property, value, elStyle;

    // loop through each styleSheet
    for (i = 0, sheetLength = sheets.length; i < sheetLength; i++) {
      sheet = sheets[i];

      // create a closure for the styleSheet order so that we can resolve specificity ties
      // by the order in which the styleSheets are loaded on the page
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

                // loop through each rule property and set the value in computedStyles
                for (var x = 0, styleLength = rule.style.length; x < styleLength; x++) {
                  property = rule.style[x];
                  value = getStyleValue(rule.style, property);

                  el.computedStyles[property] = el.computedStyles[property] || [];
                  elStyle = el.computedStyles[property];

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
                      index: index  // order of the styleSheet for resolving specificity ties
                    });
                    el.setAttribute('data-style-computed', 'true');
                  }

                  // sort property styles by specificity (i.e. how the browser would
                  // apply the style)
                  elStyle.sort(specificitySort);
                }
              }
            }
          });

          // fire an event once all styleSheets have been parsed.
          // this allows the auditResults() function to be called on the event
          if (++count === sheetLength) {
            push.removeAttribute('data-loading');
            var event = new CustomEvent('styleSheetsParsed', {count: count});
            document.dispatchEvent(event);
          }
        });
      })(i);
    }
  }, 250);
}

window.parseStyleSheets = parseStyleSheets;