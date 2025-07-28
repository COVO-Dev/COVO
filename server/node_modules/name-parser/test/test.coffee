parser = require '../index.coffee'
assert = require 'assert'

describe 'this is my test for express middleware validate', ->
  it 'should parse a name properly', ->
    parsed =  parser.parse "Layne Moseley"
    assert.equal parsed.firstName, "Layne"
    assert.equal parsed.lastName, "Moseley"

    parsed = parser.parse "Layne Brant Moseley"
    assert.equal parsed.firstName, "Layne"
    assert.equal parsed.lastName, "Brant Moseley"
