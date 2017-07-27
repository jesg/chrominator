'use strict'

var http = require('http')
var Router = require('node-simple-router')
var url = require('url')
var fs = require('fs')

module.exports = function (port, callback) {
  var router = new Router({static_route: __dirname + '/static'})
  router.get('/sleep', function(req, resp) {
      const ms = parseInt(url.parse(req.url, true).query.time) * 1000
      resp.setHeader('Content-Type', 'text/html')
      setTimeout(function() { resp.end('<p id="greeting">Hello</p>') }, ms)
  })
  var server = http.createServer(router)
  server.listen(port, callback)
  return server
}
