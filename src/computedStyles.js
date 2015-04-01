/*jshint -W084 */
function specificitySort(a, b) {
  return b.specificity[0] - a.specificity[0] ||
         b.specificity[1] - a.specificity[1] ||
         b.specificity[2] - a.specificity[2] ||
         b.specificity[3] - a.specificity[3];
}

var sheets = document.styleSheets;
var rule, selectors, selector, styleSheet, specificity, elms, el, declaration, value;

// loop through each stylesheet
for (var y = 0, lent = sheets.length; y < lent; y++) {
  sheet = sheets[y];

  // only deal with link tags with an href. this avoids problems with injected
  // styles from plugins.
  if (!sheet.href) {
    continue;
  }

  rules = sheet.cssRules || sheet.rules;

  // this is an external stylesheet, we'll just skip it for now
  if (!rules) {
    continue;
  }

  // loop through each rule
  for (var j = 0, length = rules.length; j < length; j++) {
    rule = rules[j];
    styleSheet = rule.parentStyleSheet.href;

    // keyframe definitions do not have selectorText
    if (!rule.selectorText) {
      continue;
    }

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

          // when resolving ties for specificity, the rule that was declared last
          // will take precedence. we can simulate this by adding all new rules
          // to the front of the list since we are processing the stylesheets in
          // declared order
          el.computedStyles[declaration].unshift({
            value: value,
            styleSheet: styleSheet,
            specificity: specificity,
            selector: selector
          });

          // sort declaration styles by specificity (i.e. how the browser would
          // apply the style)
          el.computedStyles[declaration].sort(specificitySort);
        }
      }
    }
  }
}