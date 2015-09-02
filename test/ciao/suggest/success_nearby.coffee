
#> valid suggest query
path: '/v1/suggest/nearby?text=a&lat=29.49136&lon=-82.50622'

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
