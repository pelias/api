
#> valid place query
path: '/v1/place?id=geoname:4221195'

#? 200 ok
response.statusCode.should.equal 200

#? valid response
now = new Date().getTime()
should.exist json
should.not.exist json.error
json.date.should.be.within now-5000, now+5000

#? valid geojson
json.type.should.equal 'FeatureCollection'
json.features.should.be.instanceof Array
