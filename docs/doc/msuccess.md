# valid doc query

*Generated: Thu Nov 06 2014 11:44:19 GMT-0500 (EST)*
## Request
```javascript
{
  "protocol": "http:",
  "host": "localhost",
  "method": "GET",
  "port": 3100,
  "path": "/doc?id=geoname:4221195&id=geoname:4193595"
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
  "content-length": "555",
  "etag": "W/\"22b-dd736629\"",
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
          -82.9207,
          34.36094
        ]
      },
      "properties": {
        "name": "Sanders Grove Cemetery",
        "admin0": "United States",
        "admin1": "Georgia",
        "admin2": "Hart County",
        "text": "Sanders Grove Cemetery, Hart County, Georgia"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -83.94213,
          33.32262
        ]
      },
      "properties": {
        "name": "Etheredge Cemetery",
        "admin0": "United States",
        "admin1": "Georgia",
        "admin2": "Butts County",
        "text": "Etheredge Cemetery, Butts County, Georgia"
      }
    }
  ],
  "date": 1415292259726
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

