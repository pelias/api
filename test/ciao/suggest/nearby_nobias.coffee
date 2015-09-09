
#> suggest without geo bias
path: '/v1/suggest/nearby?text=a'

#? 400 bad request
response.statusCode.should.equal 400
