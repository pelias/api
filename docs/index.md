# api root

*Generated: Thu Oct 23 2014 11:58:14 GMT-0400 (EDT)*
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
  "date": "Thu, 23 Oct 2014 15:58:14 GMT",
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

### ✓ endpoint available
```javascript
response.statusCode.should.equal 200
```

### ✓ server header correctly set
```javascript
response.should.have.header 'Server'
response.headers.server.should.match /Pelias\/\d{1,2}\.\d{1,2}\.\d{1,2}/
```

### ✓ vanity header correctly set
```javascript
response.should.have.header 'X-Powered-By','mapzen'
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

### ✓ content-type header correctly set
```javascript
response.should.have.header 'Content-Type','application/json; charset=utf-8'
```

### ✓ charset header correctly set
```javascript
response.should.have.header 'Charset','utf8'
```

