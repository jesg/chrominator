'use strict'

const assert = require('assert')
const Driver = require('./../index').Driver
const ExpectedConditions = require('./../index').ExpectedConditions
const ChromeService = require('./../index').ChromeService
const CDP = require('chrome-remote-interface')
const fs = require('fs')
const expect = require('chai').expect
const createMockServer = require('./../fixtures/server')

describe('core api', function () {
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

  after(function () {
    service.stop()
  })

  describe('query', function () {
    it('can query elements', function (done) {
      driver.setContent(baseHtml).then(() => {
        return driver.querySelectorAll({selector: 'div'})
      }).then((nodes) => {
        expect(nodes.length).to.be.above(1)

        done()
      }).catch((err) => {
        done(err)
      })
    })

    it('can query element', function (done) {
      var outerNode
      driver.setContent(baseHtml).then(() => {
        return driver.querySelector({selector: 'div#outer'})
      }).then((node) => {
        outerNode = node
        return outerNode.getAttribute('class')
      }).then((value) => {
        expect(value).to.equal('outer')
        return outerNode.getAttributes()
      }).then((attrs) => {
        expect(attrs).to.deep.equal({id: 'outer', class: 'outer'})

        done()
      }).catch((err) => {
        done(err)
      })
    })

    it('can query element from node', function (done) {
      driver.setContent(baseHtml).then(() => {
        return driver.querySelector({selector: 'div#outer'})
      }).then((node) => {
        return node.querySelector({selector: 'div#inner'})
      }).then((node) => {
        return node.getAttribute('class')
      }).then((value) => {
        expect(value).to.equal('inner')

        done()
      }).catch((err) => {
        done(err)
      })
    })
  })

  it('can query elements from node', function (done) {
    driver.setContent(baseHtml).then(() => {
      return driver.querySelector({selector: 'div#outer'})
    }).then((node) => {
      return node.querySelectorAll({selector: 'div'})
    }).then((nodes) => {
      expect(nodes.length).to.be.above(1)

      done()
    }).catch((err) => {
      done(err)
    })

    it('can navigate to google.com', function (done) {
      driver.navigate({url: 'https://www.google.com'}).then(() => {
        return driver.querySelector({selector: 'input[name="q"]'})
      }).then(() => {
        client.close()
        done()
      }).catch((err) => {
        client.close()
        done(err)
      })
    })
  })

  it('can click an element', function (done) {
    driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
      return driver.querySelector({selector: 'div#inner'})
    }).then((node) => {
      return node.click()
    }).then(() => {
      return driver.querySelector({selector: 'div#innerClick'})
    }).then(() => {
      done()
    }).catch((err) => {
      done(err)
    })
  })

  it('can send keys to an element', function (done) {
    var inputElem
    var name = 'Naru 1 💩'
    driver.navigate({url: baseUrl + '/input.html'}).then(() => {
      return driver.querySelector({selector: 'input#name'})
    }).then((node) => {
      inputElem = node
      return inputElem.sendKeys(name)
    }).then((node) => {
      return inputElem.getProperty('value')
    }).then((value) => {
      expect(value).to.equal(name)
    }).then(() => {
      done()
    }).catch((err) => {
      done(err)
    })
  })

  it('evaluate can return number', function (done) {
    driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
      return driver.evaluate({functionDeclaration: function () { return 1 }})
    }).then((result) => {
      expect(result).to.equal(1)
    }).then(() => {
      done()
    }).catch((err) => {
      done(err)
    })
  })

  it('evaluate can return string', function (done) {
    driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
      return driver.evaluate({functionDeclaration: function () { return 'foo' }})
    }).then((result) => {
      expect(result).to.equal('foo')
    }).then(() => {
      done()
    }).catch((err) => {
      done(err)
    })
  })

  it('evaluate can return null', function (done) {
    driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
      return driver.evaluate({functionDeclaration: 'return null;'})
    }).then((result) => {
      expect(result).to.equal(null)
    }).then(() => {
      done()
    }).catch((err) => {
      done(err)
    })
  })

  it('evaluate can handle function with numeric argument', function (done) {
    driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
      return driver.evaluate({functionDeclaration: function (name) { return name }, args: [1]})
    }).then((result) => {
      expect(result).to.equal(1)
    }).then(() => {
      done()
    }).catch((err) => {
      done(err)
    })
  })

  it('evaluate can handle function with string argument', function (done) {
    const name = 'jesg'
    driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
      return driver.evaluate({functionDeclaration: function (name) { return name }, args: [name]})
    }).then((result) => {
      expect(result).to.equal(name)
    }).then(() => {
      done()
    }).catch((err) => {
      done(err)
    })
  })

  it('evaluateAsync can resolve primitive', function (done) {
    driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
      return driver.evaluateAsync({functionDeclaration: function () { resolve(1) }})
    }).then((result) => {
      expect(result).to.equal(1)
    }).then(() => {
      done()
    }).catch((err) => {
      done(err)
    })
  })

  it('evaluateAsync can resolve setTimeout', function (done) {
    driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
      return driver.evaluateAsync({functionDeclaration: function () { setTimeout(function () { resolve(1) }, 10) }})
    }).then((result) => {
      expect(result).to.equal(1)
    }).then(() => {
      done()
    }).catch((err) => {
      done(err)
    })
  })

  it('node evaluate can get class attribute', function (done) {
    driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
      return driver.querySelector({selector: 'div#inner'})
    }).then((node) => {
      return node.evaluate({functionDeclaration: function () { return this.getAttribute('class') }})
    }).then((result) => {
      expect(result).to.equal('inner')
    }).then(() => {
      done()
    }).catch((err) => {
      done(err)
    })
  })

  it('node arg evaluate can get class attribute', function (done) {
    driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
      return driver.querySelector({selector: 'div#inner'})
    }).then((node) => {
      return driver.evaluate({functionDeclaration: function (node) { return node.getAttribute('class') }, args: [node]})
    }).then((result) => {
      expect(result).to.equal('inner')
    }).then(() => {
      done()
    }).catch((err) => {
      done(err)
    })
  })

  it('node evaluateAsync can resolve setTimeout', function (done) {
    driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
      return driver.querySelector({selector: 'div#inner'})
    }).then((node) => {
      return node.evaluateAsync({functionDeclaration: function () { setTimeout(function () { resolve(1) }, 10) }})
    }).then((result) => {
      expect(result).to.equal(1)
    }).then(() => {
      done()
    }).catch((err) => {
      done(err)
    })
  })

  it('node can set value property', function (done) {
    let node
    const name = 'jesg'
    driver.navigate({url: baseUrl + '/input.html'}).then(() => {
      return driver.querySelector({selector: 'input#name'})
    }).then((result) => {
      node = result
      return node.setProperty('value', name)
    }).then(() => {
      return node.getProperty('value')
    }).then((result) => {
      expect(result).to.equal(name)
    }).then(() => {
      done()
    }).catch((err) => {
      done(err)
    })
  })

  it('node can equal itself', function (done) {
    let firstNode
    driver.navigate({url: baseUrl + '/base.html'}).then(() => {
      return driver.querySelector({selector: 'div#outer'})
    }).then((result) => {
      firstNode = result
      return driver.querySelector({selector: 'div#outer'})
    }).then((result) => {
      return firstNode.equal(result)
    }).then((result) => {
      expect(result).to.be.true
    }).then(() => {
      done()
    }).catch((err) => {
      done(err)
    })
  })

  it('node does not equal another node', function (done) {
    let firstNode
    driver.navigate({url: baseUrl + '/base.html'}).then(() => {
      return driver.querySelector({selector: 'div#outer'})
    }).then((result) => {
      firstNode = result
      return driver.querySelector({selector: 'div#inner'})
    }).then((result) => {
      return firstNode.equal(result)
    }).then((result) => {
      expect(result).to.be.false
    }).then(() => {
      done()
    }).catch((err) => {
      done(err)
    })
  })

  it('can search google', function (done) {
        // TODO refactor to use the mock server
    let firstNode
    driver.navigate({url: 'https://google.com'}).then(() => {
      return driver.querySelector({selector: 'input[name="q"]'})
    }).then((node) => {
      return node.sendKeys('yellow')
    }).then((result) => {
      return driver.until(ExpectedConditions.is_node_present({selector: 'button[value="Search"]'}))
    }).then((node) => {
      return node.click()
    }).then(() => {
      done()
    }).catch((err) => {
      done(err)
    })
  })

  it('can get visible text', function (done) {
    let firstNode
    driver.navigate({url: baseUrl + '/base.html'}).then(() => {
      return driver.querySelector('#greeting')
    }).then((node) => {
      return node.text()
    }).then((result) => {
      expect(result).to.equal('hi')
    }).then(() => {
      done()
    }).catch((err) => {
      done(err)
    })
  })
})
