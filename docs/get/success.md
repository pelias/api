# valid get query

*Generated: Thu Oct 16 2014 17:02:52 GMT-0400 (EDT)*
## Request
```javascript
{
  "protocol": "http:",
  "host": "localhost",
  "method": "GET",
  "port": 3100,
  "path": "/get?id=geoname:4221195"
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
  "content-length": "317",
  "etag": "W/\"13d-bc388729\"",
  "date": "Thu, 16 Oct 2014 21:02:52 GMT",
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
          -82.9207,
          34.36094
        ]
      },
      "properties": {
        "name": "Sanders Grove Cemetery",
        "admin0": "United States",
        "admin1": "Georgia",
        "admin2": "Hart County",
        "text": "Sanders Grove Cemetery, Hart County, United States"
      }
    }
  ],
  "date": 1413493372842
}
```

## Tests

### ✓ valid geojson
```javascript
json.type.should.equal 'FeatureCollection'
json.features.should.be.instanceof Array
```

### ✓ 200 ok
```javascript
response.statusCode.should.equal 200
```

### ✓ valid response
```javascript
now = new Date().getTime()
should.exist json
should.not.exist json.error
json.date.should.be.within now-5000, now+5000
```

