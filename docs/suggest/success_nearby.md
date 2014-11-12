# valid suggest query

*Generated: Thu Nov 06 2014 11:44:20 GMT-0500 (EST)*
## Request
```javascript
{
  "protocol": "http:",
  "host": "localhost",
  "method": "GET",
  "port": 3100,
  "path": "/suggest/nearby?input=a&lat=29.49136&lon=-82.50622"
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
  "content-length": "2034",
  "etag": "W/\"Do9VJ5hCbynTxDjtm5fNlg==\"",
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
          -82.05231,
          29.17998
        ]
      },
      "properties": {
        "text": "Abiding Hope E V Lutheran Church, Marion County, Florida",
        "score": 1,
        "type": "geoname",
        "id": "4145572"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -82.10231,
          29.21942
        ]
      },
      "properties": {
        "text": "Abundant Harvest Ministries, Marion County, Florida",
        "score": 1,
        "type": "geoname",
        "id": "4145578"
      }
    },
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
        "text": "Adam, Alachua County, Florida",
        "score": 1,
        "type": "geoname",
        "id": "4145612"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -82.75374,
          35.17789
        ]
      },
      "properties": {
        "text": "Adams Branch, Transylvania County, North Carolina",
        "score": 1,
        "type": "geoname",
        "id": "4452189"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -82.83012,
          29.4783
        ]
      },
      "properties": {
        "text": "Adamsville Cemetery, Levy County, Florida",
        "score": 1,
        "type": "geoname",
        "id": "4145634"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -82.01511,
          35.17289
        ]
      },
      "properties": {
        "text": "Africa School (historical), Spartanburg County, South Carolina",
        "score": 1,
        "type": "geoname",
        "id": "4569065"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -82.20426,
          29.25192
        ]
      },
      "properties": {
        "text": "Agape Baptist Church, Marion County, Florida",
        "score": 1,
        "type": "geoname",
        "id": "4145673"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -82.14954,
          29.19248
        ]
      },
      "properties": {
        "text": "Agnew Cemetery, Marion County, Florida",
        "score": 1,
        "type": "geoname",
        "id": "4145677"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -82.75429,
          35.16928
        ]
      },
      "properties": {
        "text": "Aiken Mountain, Transylvania County, North Carolina",
        "score": 1,
        "type": "geoname",
        "id": "4452268"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -82.15912,
          29.47877
        ]
      },
      "properties": {
        "text": "Alachua County Fire Rescue Station 31, Alachua County, Florida",
        "score": 1,
        "type": "geoname",
        "id": "4152402"
      }
    }
  ],
  "date": 1415292259785
}
```

## Tests

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

### ✓ valid geojson
```javascript
json.type.should.equal 'FeatureCollection'
json.features.should.be.instanceof Array
```

