var styleSheetName = 'familysearch-styles';

// get the css
var css = document.querySelectorAll('link[href*="' + styleSheetName + '"]')[0];
var sheet = css.sheet;
var rules = sheet.rules || sheet.cssRules;

// loop through each rule
var rule, selectors, selector, styleSheet, specificity, elms, el, declaration, value;
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
    specificity = [0,0,0,0]; //SPECIFICITY.calculate(selector);

    elms = document.querySelectorAll(selector);

    // loop through each element and set their computedStyles property
    for (var k = 0, l = elms.length; k < l; k++) {
      el = elms[k];
      el.computedStyles = el.computedStyles || {};

      // loop through each rule declaration and set the value in computedStyles
      for (var i = 0, len = rule.style.length; i < len; i++) {
        declaration = rule.style[i];
        value = rule.style[declaration];

        el.computedStyles[declaration] = el.computedStyles[declaration] || {};

        el.computedStyles[declaration] = {
          value: value,
          styleSheet: styleSheet,
          specificity: specificity,
          selector: selector
        };
      }
    }
  }
}