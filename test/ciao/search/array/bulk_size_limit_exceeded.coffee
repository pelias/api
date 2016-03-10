
#> layer alias
path: '/v1/search'
method: 'POST'
headers:
  'Accept': 'application/json'
  'Content-Type': 'application/json'
body: [
  { text: 'a' }, { text: 'a' }, { text: 'a' }, { text: 'a' }, { text: 'a' },
  { text: 'a' }, { text: 'a' }, { text: 'a' }, { text: 'a' }, { text: 'a' },
  { text: 'a' }, { text: 'a' }, { text: 'a' }, { text: 'a' }, { text: 'a' },
  { text: 'a' }, { text: 'a' }, { text: 'a' }, { text: 'a' }, { text: 'a' },
  { text: 'a' }, { text: 'a' }, { text: 'a' }, { text: 'a' }, { text: 'a' },
  { text: 'a' }, { text: 'a' }, { text: 'a' }, { text: 'a' }, { text: 'a' },
  { text: 'a' }, { text: 'a' }, { text: 'a' }, { text: 'a' }, { text: 'a' },
  { text: 'a' }, { text: 'a' }, { text: 'a' }, { text: 'a' }, { text: 'a' },
  { text: 'a' }, { text: 'a' }, { text: 'a' }, { text: 'a' }, { text: 'a' },
  { text: 'a' }, { text: 'a' }, { text: 'a' }, { text: 'a' }, { text: 'a' },
  { text: 'a' }
]

#? 400 bad request
response.statusCode.should.be.equal 400
response.should.have.header 'charset', 'utf8'
response.should.have.header 'content-type', 'application/json; charset=utf-8'

#? proper error message
json.should.be.instanceof Object
should.not.exist json.geocoding
json.error.should.be.equal 'Maximum request array size exceeded'
