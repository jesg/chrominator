'use strict'

const assert = require('assert')
const Driver = require('./../index').Driver
const ExpectedConditions = require('./../index').ExpectedConditions
const ChromeService = require('./../index').ChromeService
const CDP = require('chrome-remote-interface')
const fs = require('fs')
const expect = require('chai').expect
const createMockServer = require('./../fixtures/server')

describe('javascript enabled', function () {
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

  it('document should reflect latest title', function(done) {
      driver.navigate(baseUrl + '/javascriptPage.html').then(() => {
        return driver.title()
      }).then((title) => {
        expect(title).to.equal('Testing Javascript')
      }).then(() => {
          return driver.querySelector('#change-page-title')
      }).then((node) => {
          return node.click()
      }).then(() => {
          return driver.waitForTitle('Changed')
      }).then(() => {
        return driver.title()
      }).then((title) => {
        expect(title).to.equal('Changed')
      }).then(() => {
        done()
      }).catch((err) => {
        done(err)
      })
  })

  it('document should reflect latest dom', function(done) {
      let dynamo
      driver.navigate(baseUrl + '/javascriptPage.html').then(() => {
        return driver.querySelector('div#dynamo')
      }).then((node) => {
          return node.text()
      }).then((text) => {
          expect(text).to.equal('What\'s for dinner?')
          return driver.querySelector('#updatediv')
      }).then((node) => {
          return node.click()
      }).then(() => {
          return driver.querySelector('div#dynamo')
      }).then((node) => {
          dynamo = node
          return driver.until(ExpectedConditions.nodeTextToEqual(dynamo, 'Fish and chips!'))
      }).then(() => {
          return dynamo.text()
      }).then((text) => {
          expect(text).to.equal('Fish and chips!')
      }).then(() => {
        done()
      }).catch((err) => {
        done(err)
      })
  })

  it('fire on change event when setting an element value', function(done) {
      let dynamo
      driver.navigate(baseUrl + '/javascriptPage.html').then(() => {
        return driver.querySelector('#change')
      }).then((node) => {
          return node.sendKeys('foo')
      }).then(() => {
        return driver.querySelector('#result')
      }).then((node) => {
          return node.text()
      }).then((text) => {
          expect(text.trim()).to.equal('change')
      }).then(() => {
        done()
      }).catch((err) => {
        done(err)
      })
  })

  xit('submit form by causing the on click event to fire', function(done) {
      let dynamo
      driver.navigate(baseUrl + '/javascriptPage.html').then(() => {
        return driver.querySelector('#jsSubmitButton')
      }).then((node) => {
          return node.click()
      }).then(() => {
          return driver.waitForTitle('We Arrive Here')
      }).then(() => {
          return driver.title()
      }).then((title) => {
          expect(title).to.equal('We Arrive Here')
      }).then(() => {
        done()
      }).catch((err) => {
        done(err)
      })
  })

  xit('submit form by clicking on submit button', function(done) {
      let dynamo
      driver.navigate(baseUrl + '/javascriptPage.html').then(() => {
        return driver.querySelector('#submittingButton')
      }).then((node) => {
          return node.click()
      }).then(() => {
          return driver.waitForTitle('We Arrive Here')
      }).then(() => {
          return driver.title()
      }).then((title) => {
          expect(title).to.equal('We Arrive Here')
      }).then(() => {
        done()
      }).catch((err) => {
        done(err)
      })
  })

  it('click should generate click event', function(done) {
      let node
      driver.navigate(baseUrl + '/javascriptPage.html').then(() => {
        return driver.querySelector('#clickField')
      }).then((result) => {
          node = result
          return node.getAttribute('value')
      }).then((value) => {
          expect(value).to.equal('Hello')
          return node.click()
      }).then(() => {
          return driver.until(ExpectedConditions.nodeValueToEqual(node, 'Clicked'))
      }).then((value) => {
          expect(value).to.equal('Clicked')
      }).then(() => {
        done()
      }).catch((err) => {
        done(err)
      })
  })
})
