const fs = require('fs');
const npa = require('npm-package-arg');

const buildInfo = JSON.parse(fs.readFileSync('./build-info.json').toString());

const Handlebars = require('handlebars');

Handlebars.registerHelper('linkifyNpmPackage', function (packageString) {
  function makeLink() {
    try {
      const parsedPackage = npa(packageString);
      if (parsedPackage.registry) {
        return `<a href="https://www.npmjs.com/package/${parsedPackage.name}/v/${parsedPackage.fetchSpec}">${packageString}</a>`;
      }
    } catch (ex) {}
    return packageString;
  }

  const link = makeLink();
  if (packageString.includes('pelias')) {
    return `<b>${link}</b>`;
  }

  return link;
});

const template = Handlebars.compile(`
Built on {{buildDate}}

<hr/>

<!-- git stats section -->
<h1>Recent Commits</h1>
{{#each gitStats}} 
{{this.commit}}: {{this.date}} ({{this.author.name}}  &lt;{{this.author.email}}&gt;)<br/>
{{this.message}}
<hr/>
{{/each}}

<!-- npm package section -->
<h1>Dependencies</h1>
{{#each packages}} 
  <li> {{{linkifyNpmPackage this}}}
{{/each}}
`);

module.exports = function controller(req, res, next) {
  res.send(template(buildInfo));
};
