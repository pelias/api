
#> api root
path: '/v1/'

#? endpoint available
response.statusCode.should.be.equal 200

#? content-type header correctly set
response.should.have.header 'Content-Type','text/html; charset=utf-8'

#? charset header correctly set
response.should.have.header 'Charset','utf8'

#? cache-control header correctly set
response.should.have.header 'Cache-Control','public'

#? server header correctly set
response.should.have.header 'Server'
response.headers.server.should.match /Pelias\/\d{1,2}\.\d{1,2}\.\d{1,2}/

#? vanity header correctly set
response.should.have.header 'X-Powered-By','mapzen'
