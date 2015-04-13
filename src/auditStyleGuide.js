/*jshint -W083 */
/*jshint -W084 */
/*jshint unused:false */
/* global console, getStyleSheetRules, forEachRule, rgbToHex, push, getStyleValue, compareSpecificity, SPECIFICITY */

var audit = {elms: []};
var rgbValues = /([0-9]){1,3}/g;

/**
 * Produce a JSON audit.
 * @param {string|string[]} styleGuideSheet - href substring that uniquely identifies the style guide styleSheet(s)
 * @param {string|string[]} ignoreSheet - href substring that uniquely identifies any styleSheets that should be ignored in the audit
 * @param {object[]} customRules - Custom rules to be audited.
 * @example
 *  // references any styleSheet that contains the text 'pattern-lib'
 *  // e.g. localhost/css/pattern-lib.css
 *  // e.g. http://myDomain/styles/pattern-lib-17D8401NDL.css
 *  auditStyleGuide('pattern-lib');
 */
function auditStyleGuide(styleGuideSheet, ignoreSheet, customRules) {
  var link, sheet, elm, elms, el, selectors, selector, specificity, property, value, elStyle, ignore;

  if (!Array.isArray(styleGuideSheet)) {
    styleGuideSheet = [styleGuideSheet];
  }

  if (!Array.isArray(ignoreSheet)) {
    ignoreSheet = [ignoreSheet];
  }

  customRules = customRules || [];

  // reset previous audit
  for (var x = 0; elm = audit.elms[x]; x++) {
    elm.problems = [];
  }
  audit = {elms: []};

  elms = document.querySelectorAll('[data-style-audit]');
  for (x = 0; elm = elms[x]; x++) {
    elm.removeAttribute('data-style-audit');
  }

  elms = document.querySelectorAll('[data-style-using]');
  for (x = 0; elm = elms[x]; x++) {
    elm.removeAttribute('data-style-using');
  }

  // loop through each provided style guide
  for (var i = 0, styleGuide; styleGuide = styleGuideSheet[i]; i++) {
    link = document.querySelector('link[href*="' + styleGuide + '"]');

    if (!link) {
      continue;
    }

    sheet = link.sheet;

    getStyleSheetRules(sheet, function(rules, href) {

      forEachRule(rules, function(rule) {

        // deal with each selector individually since each selector can have it's own
        // level of specificity
        selectors = rule.selectorText.split(',');

        for (var y = 0; selector = selectors[y]; y++) {
          specificity = SPECIFICITY.calculate(selector)[0].specificity.split(',').map(Number);

          try {
            elms = document.querySelectorAll(selector);
          }
          catch(e) {
            return;
          }

          // loop through each element
          for (var j = 0, elmsLength = elms.length; j < elmsLength; j++) {
            el = elms[j];

            // change the border of the element to show that it is using the style guide
            // only apply this to non-element only selectors so we don't have a page full
            // of borders
            if (compareSpecificity(specificity, [0,0,0,999999]) === specificity) {
              el.setAttribute('data-style-using', 'true');
            }

            // loop through each rule property and check that the style guide styles
            // are being applied
            for (var k = 0, styleLength = rule.style.length; k < styleLength; k++) {
              property = rule.style[k];
              value = getStyleValue(rule.style, property);
              elStyle = el.computedStyles[property];

              if (elStyle[0].styleSheet !== href) {
                // make sure the styleSheet isn't in the ignore list
                var ignored = false;
                for (x = 0; ignore = ignoreSheet[x]; x++) {
                  if (elStyle[0].styleSheet && elStyle[0].styleSheet.indexOf(ignore) !== -1) {
                    ignored = true;
                    break;
                  }
                }

                if (!ignored) {
                  el.problems = el.problems || [];

                  var originalValue;
                  var overrideValue;
                  // convert rgb values to hex, but ignore any rgba values
                  if (value.indexOf('rgb(') !== -1) {
                    originalValue = rgbToHex.apply(this, value.match(rgbValues).map(Number));
                  }
                  else {
                    originalValue = value;
                  }

                  if (elStyle[0].value.indexOf('rgb(') !== -1) {
                    overrideValue = rgbToHex.apply(this, elStyle[0].value.match(rgbValues).map(Number));
                  }
                  else {
                    overrideValue = elStyle[0].value;
                  }

                  el.problems.push({
                    type: 'property-override',
                    selector: elStyle[0].selector,
                    description: '<code>' + property + ': ' + originalValue + '</code> overridden by <code>' + overrideValue + '</code> in the selector <code>' + elStyle[0].selector + '</code> from styleSheet <code>' + elStyle[0].styleSheet + '.',
                  });

                  if (audit.elms.indexOf(el) === -1) {
                    audit.elms.push(el);
                  }
                }
              }
            }
          }
        }
      });

      // change the background color of all elements
      for (var z = 0, elm; elm = audit.elms[z]; z++) {
        elm.setAttribute('data-style-audit', 'property-override');
      }

    });
  }

  // create the custom rule report
  for (i = 0; i < customRules.length; i++) {
    elms = document.querySelectorAll(customRules[i].selector);

    for (var j = 0; j < elms.length; j++) {
      elms[j].problems = elms[j].problems || [];
      elms[j].problems.push({
        type: customRules[i].type,
        selector: customRules[i].selector,
        description: customRules[i].description
      });
      elms[j].setAttribute('data-style-audit', customRules[i].type);
    }
  }

  // remove any styles from audit results
  elms = document.querySelectorAll('.audit-results *');
  for (x = 0; elm = elms[x]; x++) {
    elm.removeAttribute('data-style-using');
    elm.removeAttribute('data-style-audit');
  }
}

window.auditStyleGuide = auditStyleGuide;