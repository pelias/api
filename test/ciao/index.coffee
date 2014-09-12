
#> api root
path: '/'

#? endpoint available
response.statusCode.should.equal 200

#? content-type header correctly set
response.should.have.header 'Content-Type','application/json; charset=utf-8'

#? charset header correctly set
response.should.have.header 'Charset','utf8'

#? cache-control header correctly set
response.should.have.header 'Cache-Control','public,max-age=60'

#? vanity header correctly set
response.should.have.header 'X-Powered-By','pelias'

#? should respond in json with server info
should.exist json
should.exist json.name
should.exist json.version