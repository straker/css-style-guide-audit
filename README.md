# Style Guide Auditing Tool

Audit the CSS on a page to see what elements are using styles from the style guide and which styles are overriding them.

## How it works

The code parses all the style sheets on the page and keeps track of every rule and how it affect all elements. When you run the audit, it takes this information and looks at which rules from other style sheets are overriding the rules from the style guide. Any elements that have an override are highlighted.

If you click on any highlighted element, the tool will show you which rules from which style sheets are providing the overrides.

The tool will also outline each element that is using a rule from the style guide. This is helpful to visiual see if you might have missed an element that should be using the style guide but isn't. This will ignore any rules that use just element selectors (no class selector in the rule) since those are always applied so long as the style guide is being used on the page.

![](/../screenshots/images/image3.png?raw=true)

## How to use

Out of the box, the tool provides two global functions: `parseStyleSheets()` and `auditStyleGuide()`. Running `parseStyleSheets()` will parse the style sheets on the page. After the function completes, you can run `auditStyleGuide()` to run the audit.

`auditStyleGuide()` takes two parameters, the first is a string that is the name of the style guide to audit. It uses fuzzy matching to find the name for cases when your compiled style sheet uses hashes, or if you use a minified version on production and a non-minified version on localhost.

```javascript
// matches any styleSheet that contains the text 'pattern-lib':
// localhost/css/pattern-lib.css
// http://myDomain/styles/pattern-lib.min.css
// http://myDomain/styles/pattern-lib-17D8401NDL.css,
auditStyleGuide('pattern-lib');
```

The second parameter is an array of style sheets to ignore from the audit. This is useful if you are using a global style sheet like Bootstrap and don't care to know if it overrides any of your style guide's rules. Again, it uses fuzzy matching for the name.

```javascript
// ignores any styleSheet that contains the text 'bootstrap' or 'normalize'
auditStyleGuide('pattern-lib', ['bootstrap','normalize']);
```

## Customizing the audit

The tool also allows you to customize the audit. You can pass an array of custom rules to `auditStyleGuide()` as the third parameter that will highlight any element that fails the rule.

For example, let's say you wanted to validate the accessibility of your page by ensuring that all anchor tags navigate and are not just there for [JavaScript events](http://webaim.org/techniques/hypertext/). You could write a rule that checks that all anchor tags have a valid `href` property and run the rule with the audit. Any anchor tags that do not hava valid `href` will be highlighted.

```javascript
var customRules = [{
  type: 'my-custom-rule',
  selector: 'a[href^="javascript"], a[href="#"], a:not([href])',
  description: 'Anchor tags that do not navigate should be buttons.'
}];

auditStyleGuide('pattern-lib', ['bootstrap'], customRules);
```

A rule consists of three properties:
- `type`: a slug that identifies the rule. This slug will be added to the `data-style-audit` attribute of any element that fails the rule. This is useful if you want to give those elements your own styling.
- `selector`: how to identify any elements that do not pass the rule (using `document.querySelectorAll`)
- `description`: the text to display in the audit results for any element that fails the rule.

## Using the bookmarklet

You can also create a bookmarklet that will run the entire audit for you on any page. Just edit `src/run.js` to include any custom rules and the style sheet to audit, and then run `gulp scripts`. This will create `bookmarklet.js` that you can then copy into your faviortes bar.

This is an excellent tool to give to designers who can then help run the audits of the site on their own.

**IMPORTANT** - If you are going to create your own custom bookmarklet, please create a branch on your fork where you will push the changes. I will not accept any pull requests that change `src/run.js` or `bookmarklet.js`, so if you need to submit a fix, you must do so on a clean branch without custom bookmarklet changes. [More info](http://stackoverflow.com/questions/10100933/how-to-ignore-files-and-folders-with-pull-requests-to-github-in-distinct-git-clo).
