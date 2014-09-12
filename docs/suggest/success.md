# valid suggest query

*Generated: Fri Sep 12 2014 19:16:14 GMT+0100 (BST)*
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
  "x-powered-by": "pelias",
  "charset": "utf8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET",
  "access-control-allow-headers": "X-Requested-With,content-type",
  "access-control-allow-credentials": "true",
  "cache-control": "public,max-age=60",
  "content-type": "application/json; charset=utf-8",
  "content-length": "1248",
  "etag": "W/\"htT1UWW77Ibdm7ncnD9KgA==\"",
  "date": "Fri, 12 Sep 2014 18:16:14 GMT",
  "connection": "close"
}
```
```javascript
{
  "date": 1410545774257,
  "body": [
    {
      "text": "ACRELÃNDIA, Brazil",
      "score": 1,
      "payload": {
        "id": "admin2/708:adm2:br:bra:acrel__ndia",
        "geo": "-66.908143,-9.954353"
      }
    },
    {
      "text": "ALTA FLORESTA, Brazil",
      "score": 1,
      "payload": {
        "id": "admin2/2986:adm2:br:bra:alta_floresta",
        "geo": "-56.404593,-10.042071"
      }
    },
    {
      "text": "ALTO ALEGRE, Brazil",
      "score": 1,
      "payload": {
        "id": "admin2/4611:adm2:br:bra:alto_alegre",
        "geo": "-62.627879,3.103540"
      }
    },
    {
      "text": "ALTO PARAÃSO, Brazil",
      "score": 1,
      "payload": {
        "id": "admin2/4584:adm2:br:bra:alto_para__so",
        "geo": "-63.418743,-9.697774"
      }
    },
    {
      "text": "ALVARÃES, Brazil",
      "score": 1,
      "payload": {
        "id": "admin2/832:adm2:br:bra:alvar__es",
        "geo": "-65.296384,-3.674615"
      }
    },
    {
      "text": "AMAJARI, Brazil",
      "score": 1,
      "payload": {
        "id": "admin2/4610:adm2:br:bra:amajari",
        "geo": "-62.710104,3.724864"
      }
    },
    {
      "text": "AMAZONAS, Brazil",
      "score": 1,
      "payload": {
        "id": "admin1/3232:adm1:br:bra:amazonas",
        "geo": "-64.949558,-3.785708"
      }
    },
    {
      "text": "ANAMÃ, Brazil",
      "score": 1,
      "payload": {
        "id": "admin2/834:adm2:br:bra:anam__",
        "geo": "-61.683670,-3.473836"
      }
    },
    {
      "text": "ANORI, Brazil",
      "score": 1,
      "payload": {
        "id": "admin2/835:adm2:br:bra:anori",
        "geo": "-62.182138,-4.154809"
      }
    },
    {
      "text": "APIACÃS, Brazil",
      "score": 1,
      "payload": {
        "id": "admin2/2992:adm2:br:bra:apiac__s",
        "geo": "-57.803447,-8.583036"
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
json.date.should.be.within now-1000, now+1000
should.exist json.body
json.body.should.be.instanceof Array
```

### ✓ 200 ok
```javascript
response.statusCode.should.equal 200
```

