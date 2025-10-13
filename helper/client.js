require('dotenv').config();
const { Client: ESClient } = require('elasticsearch');
const { Client: OSClient } = require('@opensearch-project/opensearch');
/**
 * Factory for creating a search client.
 *
 * ⚠️ Config note:
 * We reuse the existing `esclient` block from pelias.json for both Elasticsearch
 * and OpenSearch. This avoids introducing a new `osclient` key.
 * If Pelias were being designed from scratch today, a dedicated `osclient` key
 * would likely be cleaner — but `esclient` works for both backends.
 *
 * Selection rules:
 * - If PELIAS_OPENSEARCH=true → use OpenSearch
 *   - Prefer OPENSEARCH_NODE env var
 *   - Else fall back to esclient.hosts[0] in pelias.json
 * - Else → use Elasticsearch with full esclient config
 */
function createClient(peliasConfig) {
  if (process.env.PELIAS_OPENSEARCH === 'true') {
    // Prefer explicit environment variable
    let node = process.env.OPENSEARCH_NODE;

    // Fallback: build from pelias.json
    if (!node && peliasConfig.esclient && peliasConfig.esclient.hosts && peliasConfig.esclient.hosts[0]) {
      const { protocol, host, port } = peliasConfig.esclient.hosts[0];
      node = `${protocol}://${host}:${port}`;
    }

    if (!node) {
      throw new Error(
        '[api] No OpenSearch node URL found. Set OPENSEARCH_NODE or configure esclient.hosts in pelias.json.'
      );
    }

    console.log(`[api] Using OpenSearch node: ${node}`);
    return new OSClient({ node });
  }

  // Default: Elasticsearch
  console.log('[api] Using Elasticsearch config from pelias.json');
  return new ESClient(peliasConfig.esclient || {});
}

function normalizeQuery(client, query) {
  const clone = { ...query };

  // If OpenSearch client, fix parameter casing
  if (client.constructor.name === 'Client' && client.transport?.connectionPool) {
    // @opensearch-project/opensearch client detected
    if ('requestCache' in clone) {
      clone.request_cache = clone.requestCache;
      delete clone.requestCache;
    }
  }
  return clone;
}

function compatSearch(client, query, callback) {
  const normalizedQuery = normalizeQuery(client, query);

  client.search(normalizedQuery, (err, res) => {
    if (err) {
      return callback(err);
    }

    // OpenSearch uses res.body, ES returns res directly
    const body = res?.body || res;

    callback(null, body);
  });
}


module.exports = { 
  createClient, 
  compatSearch
};