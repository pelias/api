# valid search query

*Generated: Thu Sep 25 2014 19:25:21 GMT+0100 (BST)*
## Request
```javascript
{
  "protocol": "http:",
  "host": "localhost",
  "method": "GET",
  "port": 3100,
  "path": "/search?input=lake&lat=29.49136&lon=-82.50622"
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
  "content-length": "289",
  "etag": "W/\"121-69343a38\"",
  "date": "Thu, 25 Sep 2014 18:25:20 GMT",
  "connection": "close"
}
```
```javascript
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -82.357442,
          29.72089
        ]
      },
      "properties": {
        "name": "Hidden Lake",
        "admin0": "United States",
        "admin1": "Florida",
        "admin2": "Alachua",
        "text": "Hidden Lake, Alachua, United States"
      }
    }
  ],
  "date": 1411669520989
}
```

## Tests

### ✓ valid response
```javascript
now = new Date().getTime()
should.exist json
should.not.exist json.error
json.date.should.be.within now-5000, now+5000
```

### ✓ valid geojson
```javascript
json.type.should.equal 'FeatureCollection'
json.features.should.be.instanceof Array
```

### ✓ 200 ok
```javascript
response.statusCode.should.equal 200
```

