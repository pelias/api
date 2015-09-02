
#> suggest without geo bias
path: '/v1/suggest/nearby?input=a'

#? 400 bad request
response.statusCode.should.equal 400
