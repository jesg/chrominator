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

  it('click on unclickable element does nothing', function (done) {
      driver.navigate({url: baseUrl + '/form.html'}).then(() => {
          return driver.querySelector({selector: 'body'})
      }).then((node) => {
          return node.click()
      }).then(() => {
          return driver.waitForTitle('Form Page')
      }).then(() => {
          done()
      }).catch((err) => {
          done(err)
      })
  })

  it('click on image button', function (done) {
      driver.navigate({url: baseUrl + '/form.html'}).then(() => {
          return driver.querySelector({selector: '#imageButton'})
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

  it('enter text in text area', function (done) {
      let node
      const title = 'conan the barbarian'
      driver.navigate({url: baseUrl + '/form.html'}).then(() => {
          return driver.querySelector('#comment')
      }).then((result) => {
          node = result
          return node.sendKeys(title)
      }).then(() => {
          return node.getProperty('value')
      }).then((value) => {
          expect(value).to.equal(title)
      }).then(() => {
          done()
      }).catch((err) => {
          done(err)
      })
  })

  it('enter upper case text in text area', function (done) {
      let node
      const title = 'Conan The BarBarian'
      driver.navigate({url: baseUrl + '/form.html'}).then(() => {
          return driver.querySelector('#comment')
      }).then((result) => {
          node = result
          return node.sendKeys(title)
      }).then(() => {
          return node.getProperty('value')
      }).then((value) => {
          expect(value).to.equal(title)
      }).then(() => {
          done()
      }).catch((err) => {
          done(err)
      })
  })

  it('enter form with new line literal', function (done) {
      driver.navigate({url: baseUrl + '/form.html'}).then(() => {
          return driver.querySelector('#name')
      }).then((node) => {
          return node.sendKeys('\n')
      }).then(() => {
          return driver.waitForTitle('Result Page')
      }).then(() => {
          done()
      }).catch((err) => {
          done(err)
      })
  })

  it('enter data in form fields', function (done) {
      let node
      const title = 'conan the barbarian'
      driver.navigate({url: baseUrl + '/form.html'}).then(() => {
          return driver.querySelector('#movie')
      }).then((result) => {
          node = result
          return node.getProperty('value')
      }).then((value) => {
          expect(value).to.equal(title)
          // TODO support Node.clear
          return node.setProperty('value', '')
      }).then(() => {
          return node.sendKeys('some text')
      }).then(() => {
          return node.getProperty('value')
      }).then((value) => {
          expect(value).to.equal('some text')
      }).then(() => {
          done()
      }).catch((err) => {
          done(err)
      })
  })
})
