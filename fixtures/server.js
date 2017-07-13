'use strict'

var http = require('http')
var Router = require('node-simple-router')

module.exports = function (port, callback) {
  var router = new Router({static_route: __dirname + '/static'})
  var server = http.createServer(router)
  server.listen(port, callback)
  return server
}
