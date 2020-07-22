const fs = require('fs');
const npa = require('npm-package-arg');
const _ = require('lodash');

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
Built on {{buildDate}}<br/>
<a href="{{indexStatsLink}}">Elastic document stats</a>

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

module.exports = function controller(apiConfig, esclient) {
  return (req, res, next) => {
    const esHost = _.first(esclient.transport.connectionPool.getConnections(null, 1)).host;

    // generate a URL which opens some index stats in ES
    const indexStatsLink = esHost.makeUrl({
      path: `${apiConfig.indexName}/_search`,
      query: {
        size: 0,
        source_content_type: 'application/json',
        source: JSON.stringify({aggs: {
          sources: {
            terms: {
              field: 'source'
            }
          }
        }}),
      }
    });

    res.send(template({
      ...buildInfo,
      indexStatsLink
    }));
  };
};
