/*jshint unused:false */
/* global console */

/**
 * Load a styleSheet from a cross domain URL.
 * @param {string} url - The URL of the styleSheet to load.
 * @see http://stackoverflow.com/questions/3211536/accessing-cross-domain-style-sheet-with-cssrules
 */
function loadCSSCors(url, callback) {
  var XHR = XMLHttpRequest;
  var hasCred = false;
  try {hasCred = XHR && ('withCredentials' in (new XHR()));} catch(e) {}

  if (!hasCred) {
    console.error('CORS not supported');
    return;
  }

  var xhr = new XHR();
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
var styleSheets = {};  // keep a list of already requested styleSheets so we don't have to request them again
function getStyleSheetRules(sheet, callback) {
  // only deal with link tags with an href. this avoids problems with injected
  // styles from plugins.
  if (!sheet.href) {
    return;
  }

  var rules = getRules(sheet);

  // check to see if we've already loaded this styleSheet
  if (!rules && styleSheets[sheet.href]) {
    sheet = styleSheets[sheet.href].styleSheet;
    rules = styleSheets[sheet.href].rules;

    callback(rules, sheet.href);
  }
  // this is an external styleSheet so we need to request it through CORS
  else if (!rules) {
    (function (sheet) {
      loadCSSCors(sheet.href, function(corsSheet) {
        styleSheets[sheet.href] = {};
        styleSheets[sheet.href].styleSheet = corsSheet;
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