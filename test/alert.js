'use strict'

const assert = require('assert')
const Driver = require('./../index').Driver
const ExpectedConditions = require('./../index').ExpectedConditions
const ChromeService = require('./../index').ChromeService
const CDP = require('chrome-remote-interface')
const fs = require('fs')
const expect = require('chai').expect
const createMockServer = require('./../fixtures/server')

describe('alert handling', function () {
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

  it('can accept alert dialog', function (done) {
    let node
    driver.navigate({url: baseUrl + '/alerts.html'}).then(() => {
      return driver.querySelector({selector: '#alert'})
    }).then((result) => {
      node = result
      return driver.triggerDialog(() => { return node.click() })
    }).then((dialog) => {
      expect(dialog.type).to.equal('alert')
      expect(dialog.message).to.equal('alert triggered')
      return dialog.accept()
    }).then((result) => {
      expect(result.result).to.be.true
      done()
    }).catch((err) => {
      console.log(err)
      done(err)
    })
  })

  // looks broken upstream
  xit('can dismiss alert dialog', function (done) {
    let node
    driver.navigate({url: baseUrl + '/alerts.html'}).then(() => {
      return driver.querySelector({selector: '#alert'})
    }).then((result) => {
      node = result
      return driver.triggerDialog(() => { return node.click() })
    }).then((dialog) => {
      expect(dialog.type).to.equal('alert')
      expect(dialog.message).to.equal('alert triggered')
      return dialog.dismiss()
    }).then((result) => {
      expect(result.result).to.be.false
      done()
    }).catch((err) => {
      done(err)
    })
  })

  xit('can accept prompt dialog', function (done) {
    let node
    driver.navigate({url: baseUrl + '/alerts.html'}).then(() => {
      return driver.querySelector({selector: '#prompt'})
    }).then((result) => {
      node = result
      return driver.triggerDialog(() => { return node.click() })
    }).then((dialog) => {
      expect(dialog.type).to.equal('prompt')
      expect(dialog.message).to.equal('prompt triggered')
      expect(dialog.defaultPrompt).to.equal('default response')
      return dialog.handle({accept: true, promptText: 'my response'})
    }).then((result) => {
      expect(result.result).to.be.true
      expect(result.userInput).to.equal('my response')
      done()
    }).catch((err) => {
      console.log(err)
      done(err)
    })
  })

})
