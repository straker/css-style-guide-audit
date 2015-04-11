var expect = chai.expect;

// add needed elements to the DOM
var div = document.createElement('div');
div.innerHTML = '' +
  '<style>' +
    'button {' +
    '  font-size: 16px;' +
    '}' +
  '</style>' +
  '<link href="/base/test/css/patternLib.css" rel="stylesheet">' +
  '<link href="/base/test/css/overrideStyles.css" rel="stylesheet">' +
  '<button></button>' +
  '<button class="pattern-lib-btn"></button>' +
  '<button class="pattern-lib-btn btn-override"></button>';
document.body.insertBefore(div, document.body.firstChild);

/**
 * loadCSSCors
 */
describe('loadCSSCors', function () {
  var server;

  beforeEach(function() {
    server = sinon.fakeServer.create();
  });

  afterEach(function() {
    server.restore();
  });

  it('should make a GET request for the styleSheet', function() {
    loadCSSCors('css/patternLib.css');

    expect(server.requests.length).to.equal(1);
    expect(server.requests[0].url).to.equal('css/patternLib.css');
  });

  it('should call the callback when the styleSheet has loaded', function() {
    var callback = sinon.spy();

    loadCSSCors('css/patternLib.css', callback);

    server.requests[0].respond(
      200,
      {"Content-Type": "text/css"},
      'body { font-size: 16px; }'
    );

    expect(callback.calledOnce).to.be.true;
  });

  it('should append the styleSheet to the DOM when loaded', function() {
    loadCSSCors('css/patternLib.css', function() {
      expect($('style[data-url="css/patternLib.css"]').length).to.equal(1);
    });

    server.requests[0].respond(
      200,
      {"Content-Type": "text/css"},
      'body { font-size: 16px; }'
    );
  });

  it('should cleanup the styleSheet after the callback', function() {
    loadCSSCors('css/patternLib.css', function() {

    });

    server.requests[0].respond(
      200,
      {"Content-Type": "text/css"},
      'body { font-size: 16px; }'
    );

    expect($('style[data-url="css/patternLib.css"]').length).to.equal(0);
  });
});





/**
 * getRules
 */
describe('getRules', function() {
  var styleTag;

  beforeEach(function() {
    styleTag = document.createElement('style');
    styleTag.appendChild(document.createTextNode('body { font-size: 16px; }'));
    document.head.appendChild(styleTag);
  });

  afterEach(function() {
    styleTag.remove();
  });

  it('should return a CSSRuleList', function() {
    var rules = getRules(styleTag.sheet);
    expect(typeof rules).to.equal('object');
    expect(rules instanceof CSSRuleList).to.be.true;
  });

  it('should silently fail when requesting a CORS styleSheet', function() {
    var prismSheet = $('link[href*="prism"]')[0].sheet;
    var fn = function() {
      getRules(prismSheet);
    }

    expect(fn).to.not.throw(Error);
  });
});





/**
 * getStyleSheetRules
 */
describe('getStyleSheetRules', function() {
  var oldGetRules;

  describe('should', function() {
    beforeEach(function() {
      // trying to stub or spy on a function on window in Safari results in two
      // different functions, one on window and the other as just the function (e.g.
      // window.getRules !== getRules when window.getRules is stubbed or spied).
      // we can get around this by reassigning getRules to the stubbed version
      // on window.
      // oldGetRules = getRules;
      sinon.stub(window, 'getRules').returns(true);
      getRules = window.getRules;
    });

    afterEach(function() {
      getRules.restore();
      // calling restore on the function doesn't actually unpack it in Safari,
      // so we can get around this by just reassigning getRules to the old function
      getRules = window.getRules;
    });

    it('call getRules', function() {
      var callback = sinon.stub();
      getStyleSheetRules({href: true}, callback);

      expect(getRules.calledOnce).to.be.true;
    });

    it('call the callback', function() {
      var callback = sinon.stub();
      getStyleSheetRules({href: true}, callback);

      expect(callback.calledOnce).to.be.true;
    });
  });

  describe('should', function() {
    var link = $('link[href*="prism"]')[0];

    beforeEach(function() {
      // see comments above
      sinon.stub(window, 'loadCSSCors', function(url, callback) {
        callback({sheet: 'prism.css'});
      });
      loadCSSCors = window.loadCSSCors;

      // remove the skip attribute so we will parse the styleSheet
      link.removeAttribute('data-style-skip');
    });

    afterEach(function() {
      // see comments above
      loadCSSCors.restore();
      loadCSSCors = window.loadCSSCors;

      // reset styleSheets dictionary
      styleSheets = {};

      // add back the skip attribute
      link.setAttribute('data-style-skip', 'true');
    });

    it('call loadCSSCors when looking at a CORS styleSheet', function() {
      var prismSheet = $('link[href*="prism"]')[0].sheet;
      var callback = sinon.stub();
      getStyleSheetRules(prismSheet, callback);

      expect(loadCSSCors.calledOnce).to.be.true;
    });

    it('call the callback when looking at a CORS styleSheet', function() {
      var prismSheet = $('link[href*="prism"]')[0].sheet;
      var callback = sinon.stub();
      getStyleSheetRules(prismSheet, callback);

      expect(callback.calledOnce).to.be.true;
    });

    it('add the CORS styleSheet to a dictionary for faster lookup if requested again', function() {


      getStyleSheetRules(link.sheet, function(rules, href){
        expect(typeof styleSheets[href]).to.equal('object');
        expect(styleSheets[href].styleSheet).to.equal('prism.css');
      });
    });

    it('look at the dictionary for previously loaded CORS styleSheets', function() {
      var prismSheet = $('link[href*="prism"]')[0].sheet;
      getStyleSheetRules(prismSheet, function() {});

      // modify dictionary to test if the 2nd call really does get this styleSheet
      styleSheets[prismSheet.href].styleSheet = 'notPrism.css';

      getStyleSheetRules(prismSheet, function(rules, href) {
        expect(typeof styleSheets[href]).to.equal('object');
        expect(styleSheets[href].styleSheet).to.equal('notPrism.css');
      });

      expect(loadCSSCors.calledOnce).to.be.true;
    });
  });
});





/**
 * rgbToHex
 */
describe('rgbToHex', function() {

  it('should produce correct results', function() {
    expect( rgbToHex(0,0,0) ).to.equal('#000000');
    expect( rgbToHex(255,255,255) ).to.equal('#ffffff');
    expect( rgbToHex(51,51,49) ).to.equal('#333331');
    expect( rgbToHex(77,77,74) ).to.equal('#4d4d4a');
    expect( rgbToHex(37,164,186) ).to.equal('#25a4ba');
    expect( rgbToHex(0, 21, 172) ).to.equal('#0015ac');
  });
});





/**
 * camelCase
 */
describe('camelCase', function() {

  it('should produce correct results', function() {
    expect( camelCase('margin-left') ).to.equal('marginLeft');
    expect( camelCase('font-size') ).to.equal('fontSize');
    expect( camelCase('-webkit-transform') ).to.equal('webkitTransform');
    expect( camelCase('-moz-box-sizing') ).to.equal('MozBoxSizing');
  });
});





/**
 * getStyleValue
 */
describe('getStyleValue', function() {

  it('should return the style value by property name', function() {
    expect( getStyleValue({'color': '1'}, 'color') ).to.equal('1');

    // test that it fallsback to camel case names
    expect( getStyleValue({'lineHeight': '1'}, 'line-height') ).to.equal('1');
    expect( getStyleValue({'webkitTransform': '1'}, '-webkit-transform') ).to.equal('1');
    expect( getStyleValue({'MozBoxSizing': '1'}, '-moz-box-sizing') ).to.equal('1');

    // test that it fallsback to the propertyMap
    expect( getStyleValue({'cssFloat': '1'}, 'float') ).to.equal('1');
    expect( getStyleValue({'marginRight': '1'}, 'margin-right-value') ).to.equal('1');
    expect( getStyleValue({'marginRight': '1'}, 'margin-right-ltr-source') ).to.equal('');

    // test that the default is an empty string
    expect( getStyleValue({'float': '1'}, 'line-height') ).to.equal('');

  });
});