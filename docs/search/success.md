# valid search query

*Generated: Fri Sep 19 2014 14:38:01 GMT+0100 (BST)*
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
  "content-length": "3549",
  "etag": "W/\"Koi2nJQQ+otDRPmBy8JU7g==\"",
  "date": "Fri, 19 Sep 2014 13:38:01 GMT",
  "connection": "close"
}
```
```javascript
{
  "date": 1411133881591,
  "body": [
    {
      "admin2": "Alachua",
      "admin1": "Florida",
      "admin0": "United States",
      "name": {
        "default": "Hidden Lake"
      },
      "gn_id": 0,
      "suggest": {
        "input": [
          "hidden lake"
        ],
        "payload": {
          "id": "neighborhood/29372:_:_:_:hidden_lake",
          "geo": "-82.357442,29.720890"
        },
        "output": "Hidden Lake, Alachua, United States"
      },
      "woe_id": 0,
      "center_point": {
        "lon": "-82.357442",
        "lat": "29.720890"
      }
    },
    {
      "admin0": "United States",
      "name": {
        "default": "Lake Butler",
        "alt": "Lake Butler city"
      },
      "gn_id": "4161171",
      "suggest": {
        "input": [
          "lake butler",
          "lake butler city"
        ],
        "payload": {
          "id": "locality/4387:locality:u:us:lake_butler",
          "geo": "-82.339724,30.015529"
        },
        "output": "Lake Butler, United States"
      },
      "woe_id": null,
      "center_point": {
        "lon": "-82.339724",
        "lat": "30.015529"
      }
    },
    {
      "admin0": "United States",
      "name": {
        "default": "Lake City",
        "alt": "Lake City city"
      },
      "gn_id": "4161187",
      "suggest": {
        "input": [
          "lake city",
          "lake city city"
        ],
        "payload": {
          "id": "locality/4346:locality:u:us:lake_city",
          "geo": "-82.659959,30.201687"
        },
        "output": "Lake City, United States"
      },
      "woe_id": null,
      "center_point": {
        "lon": "-82.659959",
        "lat": "30.201687"
      }
    },
    {
      "admin2": "Lake",
      "admin1": "Florida",
      "admin0": "United States",
      "name": {
        "default": "Villages Of Lady Lake"
      },
      "gn_id": 0,
      "suggest": {
        "input": [
          "villages of lady lake"
        ],
        "payload": {
          "id": "neighborhood/34180:_:_:_:villages_of_lady_lake",
          "geo": "-81.952515,28.916553"
        },
        "output": "Villages Of Lady Lake, Lake, United States"
      },
      "woe_id": 0,
      "center_point": {
        "lon": "-81.952515",
        "lat": "28.916553"
      }
    },
    {
      "admin0": "United States",
      "name": {
        "default": "Lady Lake",
        "alt": "Lady Lake town"
      },
      "gn_id": "4161118",
      "suggest": {
        "input": [
          "lady lake",
          "lady lake town"
        ],
        "payload": {
          "id": "locality/4478:locality:u:us:lady_lake",
          "geo": "-81.922691,28.921806"
        },
        "output": "Lady Lake, United States"
      },
      "woe_id": null,
      "center_point": {
        "lon": "-81.922691",
        "lat": "28.921806"
      }
    },
    {
      "admin0": "United States",
      "name": {
        "default": "Lake Panasoffkee",
        "alt": "Lake Panasoffkee CDP"
      },
      "gn_id": "4161327",
      "suggest": {
        "input": [
          "lake panasoffkee",
          "lake panasoffkee cdp"
        ],
        "payload": {
          "id": "locality/4888:locality:u:us:lake_panasoffkee",
          "geo": "-82.125431,28.785189"
        },
        "output": "Lake Panasoffkee, United States"
      },
      "woe_id": null,
      "center_point": {
        "lon": "-82.125431",
        "lat": "28.785189"
      }
    },
    {
      "admin0": "United States",
      "name": {
        "default": "Asbury Lake",
        "alt": "Asbury Lake CDP"
      },
      "gn_id": "4146302",
      "suggest": {
        "input": [
          "asbury lake",
          "asbury lake cdp"
        ],
        "payload": {
          "id": "locality/4797:locality:u:us:asbury_lake",
          "geo": "-81.780018,30.050684"
        },
        "output": "Asbury Lake, United States"
      },
      "woe_id": null,
      "center_point": {
        "lon": "-81.780018",
        "lat": "30.050684"
      }
    },
    {
      "admin0": "United States",
      "name": {
        "default": "Silver Lake",
        "alt": "Silver Lake CDP"
      },
      "gn_id": "4172971",
      "suggest": {
        "input": [
          "silver lake",
          "silver lake cdp"
        ],
        "payload": {
          "id": "locality/4992:locality:u:us:silver_lake",
          "geo": "-81.804157,28.846269"
        },
        "output": "Silver Lake, United States"
      },
      "woe_id": null,
      "center_point": {
        "lon": "-81.804157",
        "lat": "28.846269"
      }
    },
    {
      "admin2": "Lake",
      "admin1": "Florida",
      "admin0": "United States",
      "name": {
        "default": "Oaks At Lake Dorr"
      },
      "gn_id": 0,
      "suggest": {
        "input": [
          "oaks at lake dorr"
        ],
        "payload": {
          "id": "neighborhood/33992:_:_:_:oaks_at_lake_dorr",
          "geo": "-81.639404,28.993127"
        },
        "output": "Oaks At Lake Dorr, Lake, United States"
      },
      "woe_id": 0,
      "center_point": {
        "lon": "-81.639404",
        "lat": "28.993127"
      }
    },
    {
      "admin2": "Lake",
      "admin1": "Florida",
      "admin0": "United States",
      "name": {
        "default": "Lake South"
      },
      "gn_id": 0,
      "suggest": {
        "input": [
          "lake south"
        ],
        "payload": {
          "id": "neighborhood/34534:_:_:_:lake_south",
          "geo": "-81.742766,28.797112"
        },
        "output": "Lake South, Lake, United States"
      },
      "woe_id": 0,
      "center_point": {
        "lon": "-81.742766",
        "lat": "28.797112"
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

