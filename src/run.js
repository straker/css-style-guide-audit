// Your code here
document.addEventListener('styleSheetsParsed', function() {
  // allow custom rules to be audited
  var auditRules = [{
    type: '',
    selector: 'a[href^="javascript"], a[href="#"], a:not([href])',
    description: 'Anchor tags that do not navigate should be buttons.'
  },
  {
    type: '',
    selector: '.fs-h1:not(h1):not(h2):not(h3):not(h4):not(h5), .fs-h2:not(h1):not(h2):not(h3):not(h4):not(h5), .fs-h3:not(h1):not(h2):not(h3):not(h4):not(h5), .fs-h4:not(h1):not(h2):not(h3):not(h4):not(h5), .fs-h5:not(h1):not(h2):not(h3):not(h4):not(h5)',
    description: 'Style guide heading classes should not be applied to non-heading elements.'
  }];

  auditStyleGuide('familysearch-styles','hf', auditRules);
});