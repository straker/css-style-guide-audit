/*jshint unused:false */
/*jshint latedef: nofunc */
/* global console */

var trayHeight = 200;

// create a div that will push the content out of the way of the results tray
var push = document.createElement('div');
push.classList.add('audit-push-results');
push.setAttribute('data-loading', 'true');

// set the style on the element so we don't have to wait for the styles to be processed
// before seeing the loading screen
push.innerHTML = '<div style="' +
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
    '-webkit-animation: rotate 0.75s 0s linear infinite;' +
    'animation: rotate 0.75s 0s linear infinite;' +
    'position: absolute;' +
    'top: 50%;' +
    'left: 50%;' +
  '"></div>';

push.style.position = 'fixed';
push.style.left = 0;
push.style.right = 0;
push.style.top = 0;
push.style.bottom = 0;
push.style.background = 'rgba(166,166,166,.6)';
push.style.zIndex = 10000000;
push.style.height = 'auto';

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
    '-webkit-animation: rotate 0.75s 0s linear infinite;' +
    'animation: rotate 0.75s 0s linear infinite;' +
    'position: absolute;' +
    'top: 50%;' +
    'left: 50%;' +
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
  document.head.appendChild(prismCSS);
}

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
  try {
    return sheet.cssRules || sheet.rules;
  }
  catch (e) {
    // Firefox will throw an insecure error if trying to look at the rules of a
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
 * Convert a hyphen delimited string into a camel-case string.
 * @param {string} str - Hyphen delimited string.
 * @returns {string}
 */
function camelCase(str) {
  return str.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
}

// Browser sniffing (hurray!) :(
var isFirefox = navigator.userAgent.match(/firefox/i);

/**
 * Normalize a property name.
 * @param {string} property - CSS property.
 * @returns {string}
 */
function normalizeProperty(property) {
  // Firefox uses 'padding-left-value' or 'padding-left-rtl-source' as a property indices
  // but doesn't actually have any of those as property names, so we need to normalize
  // them to their intended property value of 'padding-left'
  property = property.replace(/(-left|-right)-.*-source|(-left|-right)-value/g, function(match, p1, p2) {
    return p1 || p2;
  });

  // Firefox uses 'float' as a property index but doesn't actually have it as a property
  // name, so we need to normalize it to its intended property value of 'cssFlaot'
  if (isFirefox && property === 'float') {
    property = 'cssFloat';
  }

  return property;
}

/**
 * Get a value from a style rule.
 * @param {CSS2Properties} style - CSS Style property.
 * @param {string} property - CSS property.
 */
function getStyleValue(style, property) {
  property = normalizeProperty(property);

  // firefox camel-cases all style properties
  return style[property] || style[camelCase(property)];
}