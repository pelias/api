# valid reverse query

*Generated: Thu Nov 06 2014 11:44:19 GMT-0500 (EST)*
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
  "etag": "W/\"11a-efcd00c9\"",
  "date": "Thu, 06 Nov 2014 16:44:19 GMT",
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
  "date": 1415292259729
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

### ✓ 200 ok
```javascript
response.statusCode.should.equal 200
```

### ✓ valid geojson
```javascript
json.type.should.equal 'FeatureCollection'
json.features.should.be.instanceof Array
```

