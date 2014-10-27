# jsonp

*Generated: Thu Oct 23 2014 11:58:14 GMT-0400 (EDT)*
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
  "x-powered-by": "mapzen",
  "charset": "utf8",
  "cache-control": "public,max-age=60",
  "server": "Pelias/0.0.0",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET",
  "access-control-allow-headers": "X-Requested-With,content-type",
  "access-control-allow-credentials": "true",
  "content-type": "application/javascript; charset=utf-8",
  "content-length": "57",
  "etag": "W/\"39-b8a2aba1\"",
  "date": "Thu, 23 Oct 2014 15:58:14 GMT",
  "connection": "close"
}
```
```html
test({"name":"pelias-api","version":{"number":"0.0.0"}});
```

## Tests

### ✓ should respond with jsonp
```javascript
should.exist response.body
response.body.substr(0,5).should.equal 'test(';
```

### ✓ content-type header correctly set
```javascript
response.should.have.header 'Content-Type','application/javascript; charset=utf-8'
```

