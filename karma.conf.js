module.exports = function(config) {
  config.set({
    base: '',
    browsers: ['Chrome', 'Firefox', 'Safari', 'IE'],
    frameworks: ['jasmine', 'chai', 'sinon'],
    files: [
      // dependencies
      {pattern: 'test/js/jquery-2.1.3.js', watched: false, served: true, included: true},
      {pattern: 'node_modules/jasmine-jquery/lib/jasmine-jquery.js', watched: false, served: true, included: true},

      // test html and css for fixtures
      {pattern: 'test/*.html', watched: true, served: true, included: false},
      {pattern: 'test/css/*.css', watched: false, served: true, included: false},

      'index.test.js',

      // run in this order
      'test/core.spec.js',
      'test/parseStyleSheets.spec.js',
      'test/auditResults.spec.js'
    ]
  });
};
