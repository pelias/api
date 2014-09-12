
#> jsonp
path: '/?callback=test'

#? content-type header correctly set
response.should.have.header 'Content-Type','application/javascript; charset=utf-8'

#? should respond with jsonp
should.exist response.body
response.body.substr(0,5).should.equal 'test(';