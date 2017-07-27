'use strict'

var http = require('http')
var Router = require('node-simple-router')
var url = require('url')

module.exports = function (port, callback) {
  var router = new Router({static_route: __dirname + '/static'})
  router.get('/sleep', function(req, resp) {
      const ms = parseInt(url.parse(req.url, true).query.time) * 1000
      resp.setHeader('Content-Type', 'text/html; charset=UTF-8')
      setTimeout(function() { resp.end('<p>Hello</p>') }, ms)
  })
  var server = http.createServer(router)
  server.listen(port, callback)
  return server
}
