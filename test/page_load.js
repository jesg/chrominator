'use strict'

const assert = require('assert')
const Driver = require('./../index').Driver
const ExpectedConditions = require('./../index').ExpectedConditions
const Wait = require('./../index').Wait
const ChromeService = require('./../index').ChromeService
const CDP = require('chrome-remote-interface')
const fs = require('fs')
const expect = require('chai').expect
const createMockServer = require('./../fixtures/server')

describe('page load', function () {
  const baseHtml = fs.readFileSync(__dirname + '/../fixtures/static/base.html', 'utf-8')
  const baseUrl = process.env.CHROMINATOR_MOCK_SERVER_BASE_URL
  var driver
  var service

  beforeEach(function (done) {
    service = new ChromeService()
    service.start().then((result) => {
      driver = result
      done()
    })
  })

  afterEach(function (done) {
    service.stop().then(() => {
        done()
    })
  })

  it('undefined strategy should not wait for page load', function(done) {
      driver.navigate({url: baseUrl + '/sleep?time=5', pageLoadStrategy: 'none'}).then(() => {
        done()
      }).catch((err) => {
        done(err)
      })
  }).timeout(1000)

  it('undefined strategy should not wait for page refresh', function(done) {
      driver.navigate({url: baseUrl + '/sleep?time=5', pageLoadStrategy: 'none'}).then(() => {
        return new Wait({parent: driver, timeout: 10000}).until(ExpectedConditions.isNodePresent('#greeting'))
      }).then(() => {
        return driver.reload({pageLoadStrategy: 'none'})
      }).then(() => {
        done()
      }).catch((err) => {
        done(err)
      })
  }).timeout(6000)

  it('loading strategy should not wait for resources', function(done) {
      driver.navigate({url: baseUrl + '/slowLoadingResourcePage.html', pageLoadStrategy: 'loading'}).then(() => {
      }).then(() => {
        return driver.waitForNodePresent('#peas')
      }).then(() => {
        done()
      }).catch((err) => {
        done(err)
      })
  }).timeout(6000)

  it('interactive strategy should not wait for resources', function(done) {
      driver.navigate({url: baseUrl + '/slowLoadingResourcePage.html', pageLoadStrategy: 'interactive'}).then(() => {
      }).then(() => {
        return driver.waitForNodePresent('#peas')
      }).then(() => {
        done()
      }).catch((err) => {
        done(err)
      })
  }).timeout(6000)

  it('loading strategy should not wait for resources on refresh', function(done) {
      driver.navigate({url: baseUrl + '/slowLoadingResourcePage.html', pageLoadStrategy: 'loading'}).then(() => {
      }).then(() => {
        return driver.waitForNodePresent('#peas')
      }).then(() => {
        return driver.reload({pageLoadStrategy: 'loading'})
      }).then(() => {
        return driver.waitForNodePresent('#peas')
      }).then(() => {
        done()
      }).catch((err) => {
        done(err)
      })
  }).timeout(6000)

  it('interactive strategy should not wait for resources on refresh', function(done) {
      driver.navigate({url: baseUrl + '/slowLoadingResourcePage.html', pageLoadStrategy: 'interactive'}).then(() => {
      }).then(() => {
        return driver.waitForNodePresent('#peas')
      }).then(() => {
        return driver.reload({pageLoadStrategy: 'interactive'})
      }).then(() => {
        return driver.waitForNodePresent('#peas')
      }).then(() => {
        done()
      }).catch((err) => {
        done(err)
      })
  }).timeout(5000)

  it('interactive strategy should wait for document to be loaded', function(done) {
      driver.navigate({url: baseUrl + '/sleep?time=3', pageLoadStrategy: 'interactive'}).then(() => {
      }).then(() => {
        return driver.waitForNodePresent('body')
      }).then(() => {
        done()
      }).catch((err) => {
        done(err)
      })
  }).timeout(4000)

  it('default strategy should wait for the document to be loaded', function(done) {
      driver.navigate(baseUrl + '/base.html').then(() => {
      }).then(() => {
        return driver.title()
      }).then((title) => {
        expect(title).to.equal('base page')
      }).then(() => {
        done()
      }).catch((err) => {
        done(err)
      })
  })

  xit('return error if the url does not resolve', function(done) {
      driver.navigate('http://www.thisurldoesnotexist.comx/').then(() => {
      }).then(() => {
        done(new Error('this url should not resolve'))
      }).catch((err) => {
        done()
      })
  })

  it('return error if the url is malformed', function(done) {
      driver.navigate('www.test.com').then(() => {
      }).then(() => {
        done(new Error('this url should not resolve'))
      }).catch((err) => {
        done()
      })
  })

  it('return error if the url is malformed in port part', function(done) {
      driver.navigate('http://localhost:3001bla').then(() => {
      }).then(() => {
        done(new Error('this url should not resolve'))
      }).catch((err) => {
        done()
      })
  })

  it('should return when url does not connect', function(done) {
      driver.navigate('http://localhost:3001').then(() => {
      }).then(() => {
        done()
      }).catch((err) => {
        done(err)
      })
  })
})
