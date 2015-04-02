/**
 * Calculates the specificity of CSS selectors
 * http://www.w3.org/TR/css3-selectors/#specificity
 *
 * Returns an array of objects with the following properties:
 *  - selector: the input
 *  - specificity: e.g. 0,1,0,0
 *  - parts: array with details about each part of the selector that counts towards the specificity
 */
var SPECIFICITY = (function() {
	var calculate,
		calculateSingle;

	calculate = function(input) {
		var selectors,
			selector,
			i,
			len,
			results = [];

		// Separate input by commas
		selectors = input.split(',');

		for (i = 0, len = selectors.length; i < len; i += 1) {
			selector = selectors[i];
			if (selector.length > 0) {
				results.push(calculateSingle(selector));
			}
		}

		return results;
	};

	// Calculate the specificity for a selector by dividing it into simple selectors and counting them
	calculateSingle = function(input) {
		var selector = input,
			findMatch,
			typeCount = {
				'a': 0,
				'b': 0,
				'c': 0
			},
			parts = [],
			// The following regular expressions assume that selectors matching the preceding regular expressions have been removed
			attributeRegex = /(\[[^\]]+\])/g,
			idRegex = /(#[^\s\+>~\.\[:]+)/g,
			classRegex = /(\.[^\s\+>~\.\[:]+)/g,
			pseudoElementRegex = /(::[^\s\+>~\.\[:]+|:first-line|:first-letter|:before|:after)/gi,
			// A regex for pseudo classes with brackets - :nth-child(), :nth-last-child(), :nth-of-type(), :nth-last-type(), :lang()
			pseudoClassWithBracketsRegex = /(:[\w-]+\([^\)]*\))/gi,
			// A regex for other pseudo classes, which don't have brackets
			pseudoClassRegex = /(:[^\s\+>~\.\[:]+)/g,
			elementRegex = /([^\s\+>~\.\[:]+)/g;

		// Find matches for a regular expression in a string and push their details to parts
		// Type is "a" for IDs, "b" for classes, attributes and pseudo-classes and "c" for elements and pseudo-elements
		findMatch = function(regex, type) {
			var matches, i, len, match, index, length;
			if (regex.test(selector)) {
				matches = selector.match(regex);
				for (i = 0, len = matches.length; i < len; i += 1) {
					typeCount[type] += 1;
					match = matches[i];
					index = selector.indexOf(match);
					length = match.length;
					parts.push({
						selector: match,
						type: type,
						index: index,
						length: length
					});
					// Replace this simple selector with whitespace so it won't be counted in further simple selectors
					selector = selector.replace(match, Array(length + 1).join(' '));
				}
			}
		};

		// Remove the negation psuedo-class (:not) but leave its argument because specificity is calculated on its argument
		(function() {
			var regex = /:not\(([^\)]*)\)/g;
			if (regex.test(selector)) {
				selector = selector.replace(regex, '     $1 ');
			}
		}());

		// Remove anything after a left brace in case a user has pasted in a rule, not just a selector
		(function() {
			var regex = /{[^]*/gm,
				matches, i, len, match;
			if (regex.test(selector)) {
				matches = selector.match(regex);
				for (i = 0, len = matches.length; i < len; i += 1) {
					match = matches[i];
					selector = selector.replace(match, Array(match.length + 1).join(' '));
				}
			}
		}());

		// Add attribute selectors to parts collection (type b)
		findMatch(attributeRegex, 'b');

		// Add ID selectors to parts collection (type a)
		findMatch(idRegex, 'a');

		// Add class selectors to parts collection (type b)
		findMatch(classRegex, 'b');

		// Add pseudo-element selectors to parts collection (type c)
		findMatch(pseudoElementRegex, 'c');

		// Add pseudo-class selectors to parts collection (type b)
		findMatch(pseudoClassWithBracketsRegex, 'b');
		findMatch(pseudoClassRegex, 'b');

		// Remove universal selector and separator characters
		selector = selector.replace(/[\*\s\+>~]/g, ' ');

		// Remove any stray dots or hashes which aren't attached to words
		// These may be present if the user is live-editing this selector
		selector = selector.replace(/[#\.]/g, ' ');

		// The only things left should be element selectors (type c)
		findMatch(elementRegex, 'c');

		// Order the parts in the order they appear in the original selector
		// This is neater for external apps to deal with
		parts.sort(function(a, b) {
			return a.index - b.index;
		});

		return {
			selector: input,
			specificity: '0,' + typeCount.a.toString() + ',' + typeCount.b.toString() + ',' + typeCount.c.toString(),
			parts: parts
		};
	};

	return {
		calculate: calculate
	};
}());

// Export for Node JS
if (typeof exports !== 'undefined') {
	exports.calculate = SPECIFICITY.calculate;
}

/**
 * Wrapper function for getting a styleSheets rules
 * @param {CSSStyleSheet} sheet - The styleSheet to get the rules from.
 * @return {CSSRuleList}
 */
function getRules(sheet) {
  return sheet.cssRules || sheet.rules;
}

/**
 * Get a styleSheets rules object, taking into account styleSheets that are hosted on
 * different domains.
 * @param {CSSStyleSheet} sheet - The styleSheet to get the rules from.
 * @param {function} callback - Callback function to be called (needed for xhr CORS request)
 */
function getStyleSheetRules(sheet, callback) {
  // only deal with link tags with an href. this avoids problems with injected
  // styles from plugins.
  if (!sheet.href) {
    return;
  }

  var rules = getRules(sheet);

  // this is an external styleSheet so we need to request it through CORS
  if (!rules) {
    loadCSSCors(sheet.href, function(corsSheet) {
      callback(getRules(corsSheet.sheet), sheet.href);
    });
  }
  else {
    callback(rules, sheet.href);
  }
}

/**
 * Iterate over a list of CSS rules and return only valid rules (e.g. no keyframe or
 * font-family declarations).
 * @param {CSSRuleList} rules - CSS rules to parse.
 * @see http://toddmotto.com/ditch-the-array-foreach-call-nodelist-hack/
 */
function forEachRule(rules, callback, scope) {
  var rule;

  for (var i = 0, len = rules.length; i < len; i++) {
    rule = rules[i];

    // keyframe and font-family declarations do not have selectorText
    if (!rule.selectorText) {
      continue;
    }

    callback.call(scope, rule, i);
  }
}

/**
 * Load a styleSheet from a cross domain URL.
 * @param {string} url - The URL of the styleSheet to load.
 * @see http://stackoverflow.com/questions/3211536/accessing-cross-domain-style-sheet-with-cssrules
 */
function loadCSSCors(url, callback) {
  var xhr = XMLHttpRequest;
  var hasCred = false;
  try {hasCred = xhr && ('withCredentials' in (new xhr()));} catch(e) {}

  if (!hasCred) {
    console.error('CORS not supported');
    return;
  }

  xhr = new xhr();
  xhr.open('GET', url);
  xhr.onload = function() {
    xhr.onload = xhr.onerror = null;
    if (xhr.status < 200 || xhr.status >=300) {
      console.error('style failed to load: ' + url);
    }
    else {
      var styleTag = document.createElement('style');
      styleTag.appendChild(document.createTextNode(xhr.responseText));
      document.head.appendChild(styleTag);
      callback(styleTag);

      // clean up style tag when callback is finished
      styleTag.remove();
    }
  };
  xhr.onerror = function() {
    xhr.onload = xhr.onerror = null;
    console.error('XHR CORS CSS fail:' + url);
  };
  xhr.send();
}
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
/*jshint -W084 */

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
         b.specificity[3] - a.specificity[3];
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
  var selectors, selector, styleSheet, specificity, elms, el, declaration, value;

  // loop through each styleSheet
  for (var i = 0, sheetLength = sheets.length; i < sheetLength; i++) {
    sheet = sheets[i];

    // TODO: as an async call, this no longer returns the stylesheets in the order in which
    // they are listed. instead, it returns them in the order that they are retrieved from
    // the server.
    getStyleSheetRules(sheet, function(rules, href) {

      forEachRule(rules, function(rule) {
        // deal with each selector individually since each selector can have it's own
        // level of specificity
        selectors = rule.selectorText.split(',');

        for (j = 0; selector = selectors[j]; j++) {
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

              if (el.getAttribute('class') === 'filter-products row') {
                debugger;
              }

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
}