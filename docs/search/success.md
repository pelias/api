# valid search query

*Generated: Thu Nov 06 2014 11:44:19 GMT-0500 (EST)*
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
  "content-length": "2398",
  "etag": "W/\"NldeHivz2maJ3rqa73a+2w==\"",
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
          -82.5052,
          29.50312
        ]
      },
      "properties": {
        "name": "Blue Pete Lake",
        "admin0": "United States",
        "admin1": "Florida",
        "admin2": "Alachua County",
        "text": "Blue Pete Lake, Alachua County, Florida"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -82.52097,
          29.47185
        ]
      },
      "properties": {
        "name": "Sawgrass Lake",
        "admin0": "United States",
        "admin1": "Florida",
        "admin2": "Levy County",
        "text": "Sawgrass Lake, Levy County, Florida"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -82.39141,
          29.4468
        ]
      },
      "properties": {
        "name": "Johnson Lake",
        "admin0": "United States",
        "admin1": "Florida",
        "admin2": "Marion County",
        "text": "Johnson Lake, Marion County, Florida"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -82.35435,
          29.49526
        ]
      },
      "properties": {
        "name": "Ledwith Lake",
        "admin0": "United States",
        "admin1": "Florida",
        "admin2": "Alachua County",
        "text": "Ledwith Lake, Alachua County, Florida"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -82.35316,
          29.52469
        ]
      },
      "properties": {
        "name": "Levy Lake",
        "admin0": "United States",
        "admin1": "Florida",
        "admin2": "Alachua County",
        "text": "Levy Lake, Alachua County, Florida"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -82.66311,
          29.54036
        ]
      },
      "properties": {
        "name": "Fox Lake",
        "admin0": "United States",
        "admin1": "Florida",
        "admin2": "Levy County",
        "text": "Fox Lake, Levy County, Florida"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -82.40502,
          29.61705
        ]
      },
      "properties": {
        "name": "Lake Kanapaha",
        "admin0": "United States",
        "admin1": "Florida",
        "admin2": "Alachua County",
        "text": "Lake Kanapaha, Alachua County, Florida"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -82.70856,
          29.53293
        ]
      },
      "properties": {
        "name": "Doorshutter Lake",
        "admin0": "United States",
        "admin1": "Florida",
        "admin2": "Levy County",
        "text": "Doorshutter Lake, Levy County, Florida"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -82.30215,
          29.52978
        ]
      },
      "properties": {
        "name": "Wauberg Lake",
        "admin0": "United States",
        "admin1": "Florida",
        "admin2": "Alachua County",
        "text": "Wauberg Lake, Alachua County, Florida"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -82.47914,
          29.30795
        ]
      },
      "properties": {
        "name": "Lake Stafford",
        "admin0": "United States",
        "admin1": "Florida",
        "admin2": "Levy County",
        "text": "Lake Stafford, Levy County, Florida"
      }
    }
  ],
  "date": 1415292259730
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

