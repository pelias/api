# cross-origin resource sharing

*Generated: Thu Nov 06 2014 11:44:19 GMT-0500 (EST)*
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
  "date": "Thu, 06 Nov 2014 16:44:19 GMT",
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

### ✓ access control headers correctly set
```javascript
response.should.have.header 'Access-Control-Allow-Origin','*'
response.should.have.header 'Access-Control-Allow-Methods','GET'
response.should.have.header 'Access-Control-Allow-Headers','X-Requested-With,content-type'
response.should.have.header 'Access-Control-Allow-Credentials','true'
```

