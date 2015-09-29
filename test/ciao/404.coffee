
#> invalid path
path: '/notexist'

#? not found
response.statusCode.should.be.equal 404

#? content-type header correctly set
response.should.have.header 'Content-Type','application/json; charset=utf-8'

#? cache-control header correctly set
response.should.have.header 'Cache-Control','public'

#? should respond in json with server info
should.exist json
should.exist json.error
json.error.should.be.equal 'not found: invalid path'