# valid reverse query

*Generated: Fri Sep 19 2014 01:19:18 GMT-0400 (EDT)*
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
  "content-length": "319",
  "etag": "W/\"13f-2852cff1\"",
  "date": "Fri, 19 Sep 2014 05:19:18 GMT",
  "connection": "close"
}
```
```javascript
{
  "date": 1411103958553,
  "body": [
    {
      "name": {
        "default": "Adam"
      },
      "admin0": "United States",
      "admin1": "Florida",
      "admin2": "Alachua County",
      "center_point": {
        "lat": "29.49136",
        "lon": "-82.50622"
      },
      "suggest": {
        "input": [
          "adam"
        ],
        "payload": {
          "id": "geoname/4145612",
          "geo": "-82.50622,29.49136"
        },
        "output": "Adam, Alachua County, United States"
      }
    }
  ]
}
```

## Tests

### ✓ valid response
```javascript
now = new Date().getTime()
should.exist json
should.not.exist json.error
should.exist json.date
json.date.should.be.within now-2000, now+2000
should.exist json.body
json.body.should.be.instanceof Array
```

### ✓ 200 ok
```javascript
response.statusCode.should.equal 200
```

