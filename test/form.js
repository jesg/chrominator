'use strict'

const assert = require('assert')
const Driver = require('./../index').Driver
const ExpectedConditions = require('./../index').ExpectedConditions
const ChromeService = require('./../index').ChromeService
const CDP = require('chrome-remote-interface')
const fs = require('fs')
const expect = require('chai').expect
const createMockServer = require('./../fixtures/server')

// impelement some of the selenium form handling tests
// https://github.com/SeleniumHQ/selenium/blob/master/java/client/test/org/openqa/selenium/FormHandlingTest.java
describe('form handling', function () {
  const baseHtml = fs.readFileSync(__dirname + '/../fixtures/static/base.html', 'utf-8')
  const baseUrl = process.env.CHROMINATOR_MOCK_SERVER_BASE_URL
  var driver
  var service

  before(function (done) {
    service = new ChromeService()
    service.start().then((result) => {
      driver = result
      done()
    })
  })

  after(function (done) {
    service.stop().then(() => {
        done()
    })
  })

  it('click on submit input element', function (done) {
      driver.navigate({url: baseUrl + '/form.html'}).then(() => {
          return driver.querySelector({selector: '#submitButton'})
      }).then((node) => {
          return node.click()
      }).then(() => {
          return driver.waitForTitle('Result Page')
      }).then(() => {
          done()
      }).catch((err) => {
          done(err)
      })
  })

})
