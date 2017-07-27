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
})
