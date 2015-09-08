# valid suggest query

*Generated: Thu Nov 06 2014 11:44:19 GMT-0500 (EST)*
## Request
```javascript
{
  "protocol": "http:",
  "host": "localhost",
  "method": "GET",
  "port": 3100,
  "path": "/suggest?text=a&lat=0&lon=0"
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
  "content-length": "571",
  "etag": "W/\"23b-5d6e3dd3\"",
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
          -8.481618,
          43.125692
        ]
      },
      "properties": {
        "text": "A Coruña",
        "score": 14,
        "type": "admin1",
        "id": "3374:adm1:es:esp:a_coru_a"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          7.56019,
          5.419786
        ]
      },
      "properties": {
        "text": "Abia",
        "score": 14,
        "type": "admin1",
        "id": "1775:adm1:ng:nga:abia"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          33.772337,
          2.826081
        ]
      },
      "properties": {
        "text": "Abim",
        "score": 14,
        "type": "admin1",
        "id": "2848:adm1:ug:uga:abim"
      }
    }
  ],
  "date": 1415292259700
}
```

## Tests

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

### ✓ 200 ok
```javascript
response.statusCode.should.equal 200
```

