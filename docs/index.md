# api root

*Generated: Fri Sep 12 2014 19:14:09 GMT+0100 (BST)*
## Request
```javascript
{
  "protocol": "http:",
  "host": "localhost",
  "method": "GET",
  "port": 3100,
  "path": "/",
  "headers": {
    "User-Agent": "Ciao/Client 1.0"
  }
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
  "content-type": "application/json; charset=utf-8",
  "content-length": "50",
  "etag": "W/\"32-85536434\"",
  "date": "Fri, 12 Sep 2014 18:14:09 GMT",
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

### ✓ vanity header correctly set
```javascript
response.should.have.header 'X-Powered-By','pelias'
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

