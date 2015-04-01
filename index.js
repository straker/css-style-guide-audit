var stylesheetName = 'familysearch-styles';

// get the css
var css = $('link[href*="'+stylesheetName+'"]')[0];
var sheet = css.sheet;
var rules = sheet.rules || sheet.cssRules;

// loop through each rule
var rule, selector, styleSheet, specificity, $el, declaration, value;
for (var prop in rules) {
  if (!rules.hasOwnProperty(rules[prop])) {
    continue;
  }

  rule = rules[prop];
  selector = rule.selectorText;
  specificity = SPECIFICITY.calculate(selector);
  styleSheet = rule.parentStyleSheet.href;

  // get all elements that match the rules selector
  $el = $(selector);

  // loop through each element and set their computedStyles property for later reference
  $el.each(function(index, el) {
    el.computedStyes = el.computedStyes || {};

    // loop through each rule declaration and set the value in computedStyles
    for (var i = 0, len = rule.style.length; i < len; i++) {
      declaration = rule.style[i];
      value = rule.style[declaration];

      el.computedStyles[declaration] = {
        value: value,
        styleSheet: styleSheet,
        specificity: specificity
      }
    }
  });
}