/**
 * specificitySort
 */
var spec0 = {specificity: [0,0,0,0], index: 0};
var spec1 = {specificity: [0,0,0,1], index: 1};
var spec2 = {specificity: [0,0,1,0], index: 2};
var spec3 = {specificity: [0,1,0,0], index: 3};
var spec4 = {specificity: [1,0,0,0], index: 4};
var spec5 = {specificity: [0,0,1,1], index: 2};
var spec6 = {specificity: [0,0,1,0], index: 6};

describe('specificitySort', function() {

  it('should sort by highest specificity', function() {
    var array1 = [spec0, spec1];
    var array2 = [spec0, spec1, spec2];
    var array3 = [spec0, spec1, spec2, spec3, spec4];
    var array4 = [spec2, spec5];
    var array5 = [spec2, spec6];

    expect( array1.sort(specificitySort), 'array1 not sorted correctly' ).to.deep.equals([spec1, spec0]);
    expect( array2.sort(specificitySort), 'array2 not sorted correctly' ).to.deep.equals([spec2, spec1, spec0]);
    expect( array3.sort(specificitySort), 'array3 not sorted correctly' ).to.deep.equals([spec4, spec3, spec2, spec1, spec0]);

    // test that ties on specificity category will resolve by lower specificity category
    expect( array4.sort(specificitySort), 'array4 not sorted correctly' ).to.deep.equals([spec5, spec2]);

    // test that ties are resolved by highest index order
    expect( array5.sort(specificitySort), 'array5 not sorted correctly' ).to.deep.equals([spec6, spec2]);
  })
});





/**
 * compareSpecificity
 */
describe('compareSpecificity', function() {

  it('should return the higher specificity', function() {
    // we don't care that the objects are equal, only that they contain the correct data
    // so we'll use deep equals instead of equal
    expect( compareSpecificity(spec0.specificity, spec1.specificity) ).to.deep.equal(spec1.specificity);
    expect( compareSpecificity(spec4.specificity, spec1.specificity) ).to.deep.equal(spec4.specificity);
    expect( compareSpecificity(spec5.specificity, spec2.specificity) ).to.deep.equal(spec5.specificity);
    expect( compareSpecificity(spec6.specificity, spec2.specificity) ).to.deep.equal(spec2.specificity);
  });
});





/**
 * parseStyleSheets
 */
describe('parseStyleSheets', function() {

  it('should dispatch an event when all styleSheets have been parsed', function(done) {
    document.addEventListener('styleSheetsParsed', function() {
      done();
    });

    // this call will add any async styleSheets to the internal dictionary, so all tests
    // can now be synchronous
    parseStyleSheets();
  });

  it('should create elements with the attribute "data-style-computed"', function() {
    expect($('[data-style-computed]').length).to.be.above(0);
  });

  it('should skip any styleSheets with the "data-style-skip" attribute', function() {
    expect($('.audit-results[data-style-computed]').length).to.equal(0);
  });

  it('should add a computedStyles property to an element that is affected by a styleSheet', function() {
    var button = $('button:not([class])')[0];

    expect(button.computedStyles).to.exist;
  });

  it('should correctly parse a styleSheet element rule', function() {
    var button = $('button:not([class])')[0];

    // only 1 rule affects this button
    expect(Object.keys(button.computedStyles).length).to.equal(1);

    // the rule is font-size
    expect(button.computedStyles['font-size']).to.exist;
    expect(button.computedStyles['font-size'].length).to.equal(1);

    // ensure rule has correct data
    var rule = button.computedStyles['font-size'][0];
    expect(rule.value).to.equal('16px');
    expect(rule.specificity).to.deep.equal([0,0,0,1]);
    expect(rule.selector).to.equal('button');
    expect(rule.index).to.equal(2);
  });

  it('should correctly order multiple styleSheet rules on the same element', function() {
    var button = $('.pattern-lib-btn:not(.btn-override)')[0];

    // font-size is declared twice
    expect(button.computedStyles['font-size']).to.exist;
    expect(button.computedStyles['font-size'].length).to.equal(2);

    // ensure the first rule is from the pattern library
    var rule = button.computedStyles['font-size'][0];

    expect(rule.value).to.equal('14px');
    expect(rule.specificity).to.deep.equal([0,0,1,0]);
    expect(rule.selector).to.equal('.pattern-lib-btn');
    expect(rule.index).to.equal(3);
  });

});