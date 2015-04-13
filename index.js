(function(window, document) {
'use strict';
/*jshint unused:false */
/*jshint latedef: nofunc */
/* global console */

var trayHeight = 300;

// create a div that will push the content out of the way of the results tray
var push = document.createElement('div');
push.classList.add('audit-push-results');
push.innerHTML = '<div></div>';
document.body.appendChild(push);

// append the tray to body
var auditTool = document.createElement('div');
auditTool.setAttribute('class', 'audit-results');
document.body.appendChild(auditTool);
preventParentScroll(auditTool);

// create a title for the tray
var code = document.createElement('code');
code.setAttribute('class', 'language-markup');
var pre = document.createElement('pre');
pre.appendChild(code);

var title = document.createElement('div');
title.setAttribute('class', 'audit-results__title');
title.appendChild(pre);
auditTool.appendChild(title);

// create a container for the results
var container = document.createElement('div');
container.setAttribute('class', 'audit-results__body');
auditTool.appendChild(container);

// append a styles for the tray to body
var trayStyle = document.createElement('style');
trayStyle.setAttribute('data-style-skip', 'true');
var trayCss = '' +
  '.audit-results {' +
    'position: fixed;' +
    'bottom: -' + trayHeight + 'px;' +
    'left: 0;' +
    'right: 0;' +
    'height: ' + trayHeight + 'px;' +
    'background: white;' +
    'border-top: 0 solid black;' +
    'transition: bottom 300ms, border 300ms;' +
    'overflow-y: auto;' +
    'z-index: 1000000' +
  '}' +
  'body.open-audit .audit-results {' +
    'bottom: 0;' +
    'border-top-width: 1px;' +
  '}' +
  '.audit-push-results {' +
    'height: 0;' +
    'transition: height 300ms;' +
  '}' +
  '.audit-push-results[data-loading] {' +
    'position: fixed;' +
    'left: 0;' +
    'right: 0;' +
    'top: 0;' +
    'bottom: 0;' +
    'background: rgba(166,166,166,.6);' +
    'height: auto;' +
    'z-index: 10000000;' +
    'height: auto !important' +
  '}' +
  '.audit-push-results[data-loading] div {' +
    'background-color: #fff;' +
    'border-radius: 100%;' +
    'margin: 2px;' +
    '-webkit-animation-fill-mode: both;' +
    'animation-fill-mode: both;' +
    'border: 3px solid #fff;' +
    'border-bottom-color: transparent;' +
    'height: 100px;' +
    'width: 100px;' +
    'background: transparent !important;' +
    '-webkit-animation: styleRotate 0.75s 0s linear infinite;' +
    'animation: styleRotate 0.75s 0s linear infinite;' +
    'position: absolute;' +
    'top: 50%;' +
    'left: 50%;' +
    'margin-left: -50px;' +
    'margin-top: -50px;' +
  '}' +
  'body.open-audit .audit-push-results {' +
    'height: ' + trayHeight + 'px;' +
  '}' +
  '.audit-results__body {' +
    'padding: 1em;' +
  '}' +
  // TODO: add back when I have a way to ignore results
  // '.audit-results__body ul {' +
  //   'margin: 0;' +
  // '}' +
  '.audit-results__body li {' +
    'margin-bottom: 10px;' +
    // TODO: add back when I have a way to ignore results
    // 'display: table;' +
  '}' +
  // TODO: add back when I have a way to ignore results
  // '.audit-results__body div {' +
  //   'display: table-cell;' +
  // '}' +
  '.audit-results__body div:first-child {' +  // TODO: remove when I have a way to ignore results
    'display: none;' +
  '}' +
  '.audit-results__body input[type="checkbox"] {' +
    'float: none;' +
    'margin: 0;' +
    'padding: 0;' +
  '}' +
  '.audit-results__body label {' +
    'font-size: 16px;' +
    'padding-left: 0;' +  // TODO: change back to 10px when I have a way to ignore results
  '}' +
  '.audit-results__body code {' +
    'margin-bottom: 4px;' +
    'display: inline-block;' +
  '}' +
  // override bootstrap and prism styles
  '.audit-results pre[class*=language-] {' +
    'border-radius: 0;' +
    'margin: 0;' +
  '}' +
  '.audit-results pre[class*=language-]>code[data-language]::before {' +
    'display: none;' +
  '}' +
  // make all audit elements a different color
  '[data-style-audit] {' +
    'background: salmon !important;' +
    'cursor: pointer !important;' +
  '}' +
  // make the border of all elements using the style a different color
  '[data-style-using] {' +
    'outline: 1px dashed midnightblue !important' +
  '}' +
  // rotate animation
  '@keyframes styleRotate {' +
    '0%, {' +
      '-webkit-transform: rotate(0deg);' +
      'transform: rotate(0deg);' +
    '}' +
    '50% {' +
      '-webkit-transform: rotate(180deg);' +
      'transform: rotate(180deg);' +
    '}' +
    '100% {' +
      '-webkit-transform: rotate(360deg);' +
      'transform: rotate(360deg);' +
    '}' +
  '}' +
  '@-moz-keyframes styleRotate {' +
    '0% {' +
      '-webkit-transform: rotate(0deg);' +
      'transform: rotate(0deg);' +
    '}' +
    '50% {' +
      '-webkit-transform: rotate(180deg);' +
      'transform: rotate(180deg);' +
    '}' +
    '100% {' +
      '-webkit-transform: rotate(360deg);' +
      'transform: rotate(360deg);' +
    '}' +
  '}' +
  '@-webkit-keyframes styleRotate {' +
    '0% {' +
      '-webkit-transform: rotate(0deg);' +
      'transform: rotate(0deg);' +
    '}' +
    '50% {' +
      '-webkit-transform: rotate(180deg);' +
      'transform: rotate(180deg);' +
    '}' +
    '100% {' +
      '-webkit-transform: rotate(360deg);' +
      'transform: rotate(360deg);' +
    '}' +
  '}' +
  '@-o-keyframes styleRotate {' +
    '0% {' +
      '-webkit-transform: rotate(0deg);' +
      'transform: rotate(0deg);' +
    '}' +
    '50% {' +
      '-webkit-transform: rotate(180deg);' +
      'transform: rotate(180deg);' +
    '}' +
    '100% {' +
      '-webkit-transform: rotate(360deg);' +
      'transform: rotate(360deg);' +
    '}' +
  '}' +
  '@-ms-keyframes styleRotate {' +
    '0% {' +
      '-webkit-transform: rotate(0deg);' +
      'transform: rotate(0deg);' +
    '}' +
    '50% {' +
      '-webkit-transform: rotate(180deg);' +
      'transform: rotate(180deg);' +
    '}' +
    '100% {' +
      '-webkit-transform: rotate(360deg);' +
      'transform: rotate(360deg);' +
    '}' +
  '}';
trayStyle.appendChild(document.createTextNode(trayCss));
document.head.appendChild(trayStyle);

// load prism.js syntax highlighting
if (!window.Prism) {
  var prismJS = document.createElement('script');
  prismJS.setAttribute('async', true);
  prismJS.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/0.0.1/prism.js';
  document.body.appendChild(prismJS);
  var prismCSS = document.createElement('link');
  prismCSS.setAttribute('rel', 'stylesheet');
  prismCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/0.0.1/prism.min.css';
  prismCSS.setAttribute('data-style-skip', 'true');
  document.head.appendChild(prismCSS);
}

/**
 * Load a styleSheet from a cross domain URL.
 * @param {string} url - The URL of the styleSheet to load.
 * @see http://stackoverflow.com/questions/3211536/accessing-cross-domain-style-sheet-with-cssrules
 */
function loadCSSCors(url, callback) {
  var XHR = XMLHttpRequest;
  var xhr;
  var hasCred = false;
  try {
    hasCred = XMLHttpRequest && ('withCredentials' in (xhr = new XHR()));
  } catch(e) {}

  if (!hasCred) {
    console.error('CORS not supported');
    return;
  }

  xhr.open('GET', url);
  xhr.onload = function() {
    xhr.onload = xhr.onerror = null;
    if (xhr.status < 200 || xhr.status >=300) {
      console.error('style failed to load: ' + url);
    }
    else {
      var styleTag = document.createElement('style');
      styleTag.appendChild(document.createTextNode(xhr.responseText));
      styleTag.setAttribute('data-url', url);  // set url for testing
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
 * Wrapper function for getting a styleSheets rules
 * @param {CSSStyleSheet} sheet - The styleSheet to get the rules from.
 * @return {CSSRuleList}
 */
function getRules(sheet) {
  try {
    return sheet.cssRules || sheet.rules;
  }
  catch (e) {
    // Firefox will throw an insecure error when trying to look at the rules of a
    // cross domain styleSheet. We'll just eat the error and continue as the
    // code will automatically request the styleSheet through CORS to be able
    // to read it
    return;
  }
}

/**
 * Get a styleSheets rules object, taking into account styleSheets that are hosted on
 * different domains.
 * @param {CSSStyleSheet} sheet - The styleSheet to get the rules from.
 * @param {function} callback - Callback function to be called (needed for xhr CORS request)
 */
var styleSheets = {};  // keep a list of already requested styleSheets so we don't have to request them again
function getStyleSheetRules(sheet, callback) {
  // skip any styleSheets we don't want to parse (e.g. prism.css, audit styles)
  if (sheet.ownerNode && sheet.ownerNode.hasAttribute('data-style-skip')) {
    callback([], sheet.href);
    return;
  }

  var rules = getRules(sheet);

  // check to see if we've already loaded this styleSheet
  if (!rules && styleSheets[sheet.href]) {
    rules = styleSheets[sheet.href].rules;

    callback(rules, sheet.href);
  }
  // this is an external styleSheet so we need to request it through CORS
  else if (!rules) {
    (function (sheet) {
      loadCSSCors(sheet.href, function(corsSheet) {
        styleSheets[sheet.href] = {};
        styleSheets[sheet.href].styleSheet = corsSheet.sheet;
        styleSheets[sheet.href].rules = getRules(corsSheet.sheet);

        callback(styleSheets[sheet.href].rules, sheet.href);
      });
    })(sheet);
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
 * Prevents a child element from scrolling a parent element (aka document).
 * @param {Element} element - Scrolling element.
 * @see http://codepen.io/Merri/pen/nhijD/
 */
function preventParentScroll(element) {
  var html = document.getElementsByTagName('html')[0],
      htmlTop = 0,
      htmlBlockScroll = 0,
      minDeltaY,
      // this is where you put all your logic
      wheelHandler = function (e) {
        // do not prevent scrolling if element can't scroll
        if (element.scrollHeight <= element.clientHeight) {
          return;
        }

        // normalize Y delta
        if (minDeltaY > Math.abs(e.deltaY) || !minDeltaY) {
          minDeltaY = Math.abs(e.deltaY);
        }

        // prevent other wheel events and bubbling in general
        if(e.stopPropagation) {
          e.stopPropagation();
        } else {
          e.cancelBubble = true;
        }

        // most often you want to prevent default scrolling behavior (full page scroll!)
        if( (e.deltaY < 0 && element.scrollTop === 0) || (e.deltaY > 0 && element.scrollHeight === element.scrollTop + element.clientHeight) ) {
          if(e.preventDefault) {
            e.preventDefault();
          } else {
            e.returnValue = false;
          }
        } else {
          // safeguard against fast scroll in IE and mac
          if(!htmlBlockScroll) {
            htmlTop = html.scrollTop;
          }
          htmlBlockScroll++;
          // even IE11 updates scrollTop after the wheel event :/
          setTimeout(function() {
            htmlBlockScroll--;
            if(!htmlBlockScroll && html.scrollTop !== htmlTop) {
              html.scrollTop = htmlTop;
            }
          }, 0);
        }
      },
      // here we do only compatibility stuff
      mousewheelCompatibility = function (e) {
        // no need to convert more than this, we normalize the value anyway
        e.deltaY = -e.wheelDelta;
        // and then call our main handler
        wheelHandler(e);
      };

  // do not add twice!
  if(element.removeWheelListener) {
    return;
  }

  if (element.addEventListener) {
    element.addEventListener('wheel', wheelHandler, false);
    element.addEventListener('mousewheel', mousewheelCompatibility, false);
    // expose a remove method
    element.removeWheelListener = function() {
      element.removeEventListener('wheel', wheelHandler, false);
      element.removeEventListener('mousewheel', mousewheelCompatibility, false);
      element.removeWheelListener = undefined;
    };
  }
}

/**
 * Convert rgb values from the stylesheet to hex.
 * @param {number} r - Red value.
 * @param {number} g - Green value.
 * @param {number} b - Blue value.
 * @returns {string}
 * @see http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 */
function rgbToHex(r, g, b) {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Convert a hyphen-separated string into a camel case string.
 * @param {string} str - Hyphen-separated string.
 * @returns {string}
 */
function camelCase(str) {
  str = str.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });

  // webkit is lowercase in Chrome
  if (str.indexOf('Webkit') === 0) {
    str = str[0].toLowerCase() + str.slice(1);
  }

  return str;
}

// translate browser specific styles to their actual style.
// @see https://gist.github.com/dennisroethig/7078659
var propertyMap = {
    'float': 'cssFloat',
    'margin-left-value': 'marginLeft',
    'margin-left-ltr-source': '',
    'margin-left-rtl-source': '',
    'margin-right-value': 'marginRight',
    'margin-right-ltr-source': '',
    'margin-right-rtl-source': '',
    'padding-right-value': 'paddingRight',
    'padding-right-ltr-source': '',
    'padding-right-rtl-source': '',
    'padding-left-value': 'paddingLeft',
    'padding-left-ltr-source': '',
    'padding-left-rtl-source': ''
};

/**
 * Get a value from a style rule.
 * @param {CSS2Properties} style - CSS Style property object.
 * @param {string} property - CSS property name.
 */
function getStyleValue(style, property) {
  // Chrome maps hyphen-separated names to their camel case name
  // Firefox uses camel case names
  // if no value is found, default to "" so that .indexOf will still work
  var value = style[property] || style[ camelCase(property) ] ||
              style[ propertyMap[property] ] || '';

  return value;
}
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
/*jshint -W084 */
/* global container, auditTool, code, Prism */

/**
 * Escape <, >, and "" for output.
 * @param {string} str - String of HTML to escape.
 * @returns {string}
 * @see http://stackoverflow.com/questions/5406373/how-can-i-display-html-tags-inside-and-html-document
 */
function escapeHTML(str) {
  return str.replace(/>/g,'&gt;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
}

/**
 * Open the audit tool tray
 * @param {Element} el - Element to view audit results on.
 */
function openAuditTool(el) {
  document.body.classList.add('open-audit');

  // remove all previous results
  container.innerHTML = '';
  auditTool.scrollTop = 0;

  // set the title
  var wrap = document.createElement('div');
  wrap.appendChild(el.cloneNode(false));
  wrap.firstChild.removeAttribute('data-style-audit');
  wrap.firstChild.removeAttribute('data-style-computed');
  wrap.firstChild.removeAttribute('data-style-using');
  code.innerHTML = escapeHTML(wrap.innerHTML);
  Prism.highlightElement(code);

  // add audit results to container
  var frag = document.createDocumentFragment();
  var ul = document.createElement('ul');
  var li;
  for (var i = 0, result; result = el.problems[i]; i++) {
    li = document.createElement('li');
    li.innerHTML = ''+
      '<div>' +
        // TODO: add title "Don't show me again" when I have a way to ignore results
        '<input id="audit-result-' + i + '" type="checkbox"/>' +
      '</div>' +
      '<div>' +
        // TODO: add title "Don't show me again" when I have a way to ignore results
        /*'<label for="audit-result-' + i + '">' + */result.description/* + '</label>'*/ +
      '</div>';
    frag.appendChild(li);
  }
  ul.appendChild(frag);
  container.appendChild(ul);
}

// setup a click handler on all audit elements to bring up a nice tray to display
// the audit results
document.body.addEventListener('click', function(e) {
  var el = e.target;

  if (!el) {
    return;
  }

  // walk the DOM tree looking for an element with the data-style-audit attribute
  do {
    if (el.getAttribute('data-style-audit') !== null) {
      e.preventDefault();
      openAuditTool(el);
      return;
    }
    // if we clicked inside the audit-tool, don't close
    else if (el.classList.contains('audit-results')) {
      return;
    }
  } while (el = el.parentElement);

  // if no DOM found, close the tray
  try {
    document.body.classList.remove('open-audit');
  } catch (error) {}
}, true);
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

})(window, document);