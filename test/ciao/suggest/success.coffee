
#> valid suggest query
path: '/suggest?input=a&lat=0&lon=0'

#? 200 ok
response.statusCode.should.equal 200

#? valid response
now = new Date().getTime()
should.exist json
should.not.exist json.error
should.exist json.date
json.date.should.be.within now-2000, now+2000
should.exist json.body
json.body.should.be.instanceof Array