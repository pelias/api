# jsonp

*Generated: Fri Sep 12 2014 19:16:14 GMT+0100 (BST)*
## Request
```javascript
{
  "protocol": "http:",
  "host": "localhost",
  "method": "GET",
  "port": 3100,
  "path": "/?callback=test"
}
```

## Response
```javascript
Status: 200
{
  "x-powered-by": "pelias",
  "charset": "utf8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET",
  "access-control-allow-headers": "X-Requested-With,content-type",
  "access-control-allow-credentials": "true",
  "cache-control": "public,max-age=60",
  "content-type": "application/javascript; charset=utf-8",
  "content-length": "57",
  "etag": "W/\"39-b8a2aba1\"",
  "date": "Fri, 12 Sep 2014 18:16:14 GMT",
  "connection": "close"
}
```
```html
test({"name":"pelias-api","version":{"number":"0.0.0"}});
```

## Tests

### ✓ content-type header correctly set
```javascript
response.should.have.header 'Content-Type','application/javascript; charset=utf-8'
```

### ✓ should respond with jsonp
```javascript
should.exist response.body
response.body.substr(0,5).should.equal 'test(';
```

