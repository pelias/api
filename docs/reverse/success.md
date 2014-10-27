# valid reverse query

*Generated: Thu Oct 23 2014 11:58:15 GMT-0400 (EDT)*
## Request
```javascript
{
  "protocol": "http:",
  "host": "localhost",
  "method": "GET",
  "port": 3100,
  "path": "/reverse?lat=29.49136&lon=-82.50622"
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
  "content-length": "282",
  "etag": "W/\"11a-95fc1500\"",
  "date": "Thu, 23 Oct 2014 15:58:15 GMT",
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
          -82.50622,
          29.49136
        ]
      },
      "properties": {
        "name": "Adam",
        "admin0": "United States",
        "admin1": "Florida",
        "admin2": "Alachua County",
        "text": "Adam, Alachua County, Florida"
      }
    }
  ],
  "date": 1414079895606
}
```

## Tests

### ✓ 200 ok
```javascript
response.statusCode.should.equal 200
```

### ✓ valid geojson
```javascript
json.type.should.equal 'FeatureCollection'
json.features.should.be.instanceof Array
```

### ✓ valid response
```javascript
now = new Date().getTime()
should.exist json
should.not.exist json.error
json.date.should.be.within now-5000, now+5000
```

