/*jshint -W084 */

/**
 * Sort a computedStyle by specificity order
 * @param {object} a
 * @param {object} b
 */
function specificitySort(a, b) {
  return b.specificity[0] - a.specificity[0] ||
         b.specificity[1] - a.specificity[1] ||
         b.specificity[2] - a.specificity[2] ||
         b.specificity[3] - a.specificity[3];
}

var sheets = document.styleSheets;
var rule, selectors, selector, styleSheet, specificity, elms, el, declaration, value;

// loop through each styleSheet
for (var y = 0, lent = sheets.length; y < lent; y++) {
  sheet = sheets[y];

  getStyleSheetRules(sheet, function(rules, href) {

    forEachRule(rules, function(rule) {
      // deal with each selector individually since each selector can have it's own
      // level of specificity
      selectors = rule.selectorText.split(',');

      for (var x = 0; selector = selectors[x]; x++) {
        specificity = SPECIFICITY.calculate(selector)[0].specificity.split(',').map(Number);

        try {
          elms = document.querySelectorAll(selector);
        }
        catch(e) {
          continue;
        }

        // loop through each element and set their computedStyles property
        for (var k = 0, l = elms.length; k < l; k++) {
          el = elms[k];
          el.computedStyles = el.computedStyles || {};

          // loop through each rule declaration and set the value in computedStyles
          for (var i = 0, len = rule.style.length; i < len; i++) {
            declaration = rule.style[i];
            value = rule.style[declaration];

            el.computedStyles[declaration] = el.computedStyles[declaration] || [];
            elStyle = el.computedStyles[declaration];

            // check that this selector isn't already being applied to this element
            var ruleApplied;
            for (var j = 0, length = elStyle.length; j < length; j++) {
              if (elStyle[j].selector === rule.selectorText &&
                  elStyle[j].styleSheet === href) {
                ruleApplied = elStyle[j];
                break;
              }
            }

            if (ruleApplied) {
              // if a single selector applies to this element multiple times, we'll just
              // take the highest specificity and set it on the element
              elStyle.specificity = compareSpecificity(ruleApplied.specificity, specificity);
            }
            else {
              // when resolving ties for specificity, the rule that was declared last
              // will take precedence. we can simulate this by adding all new rules
              // to the front of the list since we are processing the styleSheets in
              // declared order
              elStyle.unshift({
                value: value,
                styleSheet: href,
                specificity: specificity,
                selector: rule.selectorText  // we want the entire selector
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
}