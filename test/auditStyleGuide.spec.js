describe('auditStyleGuide', function() {
  // ensure this code has been run first
  parseStyleSheets();

  it('should add the "data-style-audit" attribute to any elements that have a rule that overrides a styleSheet rule', function() {
    auditStyleGuide('patternLib');

    expect($('[data-style-audit]').length).to.be.above(0);
  });

  it('should add a problems property to an element that has a rule that overrides a styleSheet rule', function() {
    var button = $('button[data-style-audit]')[0];

    expect(button.problems).to.exist;
  });

  it('should add a problem with the correct data', function() {
    var button = $('button[data-style-audit]')[0];

    // font-size, padding left/right/top/bottom
    // Firefox will add padding-left/right-value, padding-left/right-ltr-source, making it 9 in total
    expect(button.problems.length).to.be.at.least(5);

    // we want to only test that the properties exist, not what they are so that
    // they can change at any point in the future without breaking the test
    expect(button.problems[0].type).to.exist;
    expect(button.problems[0].selector).to.exist;
    expect(button.problems[0].description).to.exist;
  });

});