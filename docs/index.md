# api root

*Generated: Thu Sep 25 2014 19:25:20 GMT+0100 (BST)*
## Request
```javascript
{
  "protocol": "http:",
  "host": "localhost",
  "method": "GET",
  "port": 3100,
  "path": "/"
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
  "content-type": "application/json; charset=utf-8",
  "content-length": "50",
  "etag": "W/\"32-85536434\"",
  "date": "Thu, 25 Sep 2014 18:25:20 GMT",
  "connection": "close"
}
```
```javascript
{
  "name": "pelias-api",
  "version": {
    "number": "0.0.0"
  }
}
```

## Tests

### ✓ vanity header correctly set
```javascript
response.should.have.header 'X-Powered-By','mapzen'
```

### ✓ server header correctly set
```javascript
response.should.have.header 'Server'
response.headers.server.should.match /Pelias\/\d{1,2}\.\d{1,2}\.\d{1,2}/
```

### ✓ content-type header correctly set
```javascript
response.should.have.header 'Content-Type','application/json; charset=utf-8'
```

### ✓ cache-control header correctly set
```javascript
response.should.have.header 'Cache-Control','public,max-age=60'
```

### ✓ should respond in json with server info
```javascript
should.exist json
should.exist json.name
should.exist json.version
```

### ✓ endpoint available
```javascript
response.statusCode.should.equal 200
```

### ✓ charset header correctly set
```javascript
response.should.have.header 'Charset','utf8'
```

