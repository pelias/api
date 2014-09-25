# valid suggest query

*Generated: Thu Sep 25 2014 19:25:20 GMT+0100 (BST)*
## Request
```javascript
{
  "protocol": "http:",
  "host": "localhost",
  "method": "GET",
  "port": 3100,
  "path": "/suggest?input=a&lat=0&lon=0"
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
  "content-length": "1933",
  "etag": "W/\"I89q+0HZNmXyHsTfLSP5Ww==\"",
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
          7.56019,
          5.419786
        ]
      },
      "properties": {
        "text": "Abia, Nigeria",
        "score": 1,
        "type": "admin1",
        "id": "1775:adm1:ng:nga:abia"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -66.908143,
          -9.954353
        ]
      },
      "properties": {
        "text": "Acrelândia, Brazil",
        "score": 1,
        "type": "admin2",
        "id": "708:adm2:br:bra:acrel_ndia"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -60.005461,
          -3.099378
        ]
      },
      "properties": {
        "text": "Adrianópolis, Manaus, Brasil",
        "score": 1,
        "type": "neighborhood",
        "id": "799:_:_:_:adrian_polis"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          7.909644,
          5.013733
        ]
      },
      "properties": {
        "text": "Akwa Ibom, Nigeria",
        "score": 1,
        "type": "admin1",
        "id": "1776:adm1:ng:nga:akwa_ibom"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          9.691808,
          4.050576
        ]
      },
      "properties": {
        "text": "Akwa, Littoral, Cameroun",
        "score": 1,
        "type": "neighborhood",
        "id": "1863:_:_:_:akwa"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -56.404593,
          -10.042071
        ]
      },
      "properties": {
        "text": "Alta Floresta, Brazil",
        "score": 1,
        "type": "admin2",
        "id": "2986:adm2:br:bra:alta_floresta"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -62.627879,
          3.10354
        ]
      },
      "properties": {
        "text": "Alto Alegre, Brazil",
        "score": 1,
        "type": "admin2",
        "id": "4611:adm2:br:bra:alto_alegre"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -63.418743,
          -9.697774
        ]
      },
      "properties": {
        "text": "Alto Paraíso, Brazil",
        "score": 1,
        "type": "admin2",
        "id": "4584:adm2:br:bra:alto_para_so"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -65.296384,
          -3.674615
        ]
      },
      "properties": {
        "text": "Alvarães, Brazil",
        "score": 1,
        "type": "admin2",
        "id": "832:adm2:br:bra:alvar_es"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -62.710104,
          3.724864
        ]
      },
      "properties": {
        "text": "Amajari, Brazil",
        "score": 1,
        "type": "admin2",
        "id": "4610:adm2:br:bra:amajari"
      }
    }
  ],
  "date": 1411669520909
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

