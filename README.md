[![npm version](https://img.shields.io/npm/v/chrominator.svg?style=flat-square)](https://www.npmjs.com/package/chrominator)

[![Build Status](https://travis-ci.org/jesg/chrominator.svg?branch=master)](https://travis-ci.org/jesg/chrominator)

a high level api to chrome debugger for automation.

currently working on core api built on promises.  might provide a high level fluent api similar to nightmarejs in the future.

```javascript
const Chrominator = require('chrominator');

Chrominator(async (driver) => {
    await driver.navigate('https://www.google.com')
    const search = await driver.querySelector('input[name="q"]')
    await search.sendKeys('yellow\n');
    await driver.delay(1000);
    await driver.screenshot('screenshot.png')
});
```

# API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

## Driver

Abstraction to drive a webpage

### navigate

Navigate to a page and wait for the page to load.

available page load strategies:

-   none
-   loading
-   interactive
-   complete (default)

All the page load strategies but none correspond to the `document.readyState`.  The none strategy does not wait for anything.

The default page load strategy can be overridden globally by setting `driver.pageLoadStrategy`.

The default timeout is 300,000 ms (5 minutes).  It can be overridded globally by setting `driver.timeouts.pageLoad`.

**Parameters**

-   `args`  

**Examples**

```javascript
await driver.navigate({url: 'http://google.com', pageLoadStrategy: 'interactive', timeout: 1000})
// or
await driver.navigate('http://google.com')
```

### waitForPageLoad

Wait for an action to trigger a page load.

The action should return a `Promise`.

**Parameters**

-   `args`  

**Examples**

```javascript
await driver.waitForPageLoad({action: () => { return driver.reload() }, pageLoadStrategy: 'interactive', timeout: 200})
or
await driver.waitForPageLoad(() => { return node.click() })
```

### title

Get the title of the current page

**Examples**

```javascript
title = await driver.title()
```

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 

### querySelector

Search for a Node in the current document

**Parameters**

-   `args` **([Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) \| [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String))** selector arguments or selector

**Examples**

```javascript
node = await driver.querySelector({selector: '#my-id'})
node = await driver.querySelector('#my-id')
```

Returns **[Node](#node)** 

### querySelectorAll

Search for Nodes in the current document

**Parameters**

-   `args` **([Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) \| [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String))** selector arguments or selector

**Examples**

```javascript
nodes = await driver.querySelectorAll({selector: 'a'})
nodes = await driver.querySelectorAll('a')
```

Returns **[Node](#node)** 

### reload

Reload the current page

available page load strategies:

-   none
-   loading
-   interactive
-   complete (default)

All the page load strategies but none correspond to the `document.readyState`.  The none strategy does not wait for anything.

The default page load strategy can be overridden globally by setting `driver.pageLoadStrategy`.

The default timeout is 300,000 ms (5 minutes).  It can be overridded globally by setting `driver.timeouts.pageLoad`.

**Parameters**

-   `args`  

**Examples**

```javascript
await driver.reload()
or
await driver.reload({pageLoadStrategy: 'interactive', timeout: 200})
```

### pdf

Print the current page to pdf.

**Parameters**

-   `options` **([Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) \| [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [undefined](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined))** pdf options

**Examples**

```javascript
// writes image to file
driver.pdf({path: '/opt/save.pdf'})

// writes image to file
driver.pdf('/opt/save.pdf')

// returns base64 encoding
driver.pdf()
```

### screenshot

Take a screenshot

**Parameters**

-   `options` **([Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) \| [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [undefined](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined))** image options

**Examples**

```javascript
// writes image to file
driver.screenshot({path: 'screenshot.png'});

// writes image to file
driver.screenshot('screenshot.png');

// returns base64 encoding.
driver.screenshot();
```

### setUserAgent

Set the browsers user agent

**Parameters**

-   `args` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

**Examples**

```javascript
driver.setUserAgent({userAgent: 'chrominator'})
```

### getCookies

Get cookies

**Parameters**

-   `args` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

### getAllCookies

Get All cookies

### deleteAllCookies

Delete All cookies

### setCookie

Set a cookie

**Parameters**

-   `args`  

### setContent

Set the page content

**Parameters**

-   `html`  

**Examples**

```javascript
driver.setContent('<div>hello</div>')
```

### delay

Async delay.

**Parameters**

-   `ms` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** number of milliseconds

**Examples**

```javascript
await driver.delay(500)
```

### evaluate

Evaluate javascript

**Parameters**

-   `options` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

**Examples**

```javascript
result = await node.evaluate({
    functionDeclaration: function(n) {
        return n + 1;
    },
    args: [n],
});
```

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** resolved object

### evaluateAsync

Evaluate Asynchronous javascript

The `functionDeclaration` must call either `resolve` to resolve the promise or `reject` to reject the promise.

**Parameters**

-   `options` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** resolved object

### currentUrl

Get the url of the current page

**Examples**

```javascript
url = await driver.currentUrl()
```

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** the current url

### until

Wait for a condition to be satisfied.

**Parameters**

-   `condition` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** The condition to wait for.

**Examples**

```javascript
node = await driver.until(ExpectedConditions.isNodePresent({selector: 'button[value="Search"]'}))
```

### until_not

Wait for a condition to not be satisfied.

**Parameters**

-   `condition` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** The condition to wait for.

**Examples**

```javascript
node = await driver.until_not(ExpectedConditions.isNodePresent({selector: 'button[value="Search"]'}))
```

### waitForNodePresent

Wait for a Node to be present

**Parameters**

-   `selector` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** css selector

**Examples**

```javascript
node = await driver.waitForNodePresent('button[value="Search"]')
```

Returns **[Node](#node)** 

### waitForNodeNotPresent

Wait for a Node to not be present

**Parameters**

-   `selector` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** css selector

**Examples**

```javascript
node = await driver.waitForNodeNotPresent('button[value="Search"]')
```

### waitForNodeClickable

Wait for a Node to be clickable

**Parameters**

-   `selector` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** css selector

**Examples**

```javascript
node = await driver.waitForNodeClickable('button[value="Search"]')
```

Returns **[Node](#node)** 

### waitForNodeNotClickable

Wait for a Node to not be clickable

**Parameters**

-   `selector` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** css selector

**Examples**

```javascript
node = await driver.waitForNodeNotClickable('button[value="Search"]')
```

Returns **[Node](#node)** 

### waitForTitle

Wait for title

**Parameters**

-   `title` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** page title

**Examples**

```javascript
await driver.waitForTitle('Google')
```

### createDriver

Create and initialize the driver.

**Parameters**

-   `crd` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** an instance of chrome remote debugger

**Examples**

```javascript
Driver.createDriver(crd)
```

## Node

**Parameters**

-   `driver` **[Driver](#driver)** 
-   `nodeId` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The nodes node id

### getAttributes

Get the Node's attributes.

**Examples**

```javascript
attributes = await node.getAttributes()
```

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** The attributes as key-value pairs.

### getAttribute

Get an attribute on the node.

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** attribute name

**Examples**

```javascript
value = await node.getAttribute('class')
```

Returns **([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | null)** attribute value or null if the attribute does not exist

### querySelector

Search for a descendent of the current Node.

**Parameters**

-   `args` **([Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) \| [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String))** selector arguments or selector

**Examples**

```javascript
node = await node.querySelector({selector: '#my-id'})
node = await node.querySelector('#my-id')
```

Returns **[Node](#node)** 

### querySelectorAll

Search for descendents of the current Node.

**Parameters**

-   `args` **([Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) \| [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String))** selector arguments or selector

**Examples**

```javascript
nodes = await node.querySelectorAll({selector: 'a'})
nodes = await node.querySelectorAll('a')
```

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Node](#node)>** 

### setFileInput

Set file selection on a file input element.

**Parameters**

-   `args` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

**Examples**

```javascript
node.setFileInput({files: ['/opt/my-file.txt']})
```

### focus

Focus on the Node

**Examples**

```javascript
node.focus()
```

### clickableAt

Test if the Node is clickable at a given location.

**Parameters**

-   `args` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

Returns **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** true if the element will directly receive a click event, otherwise false

### resolveNodeAtDefaultClickPoint

Resolve Node at default click point

**Parameters**

-   `args` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

Returns **[Node](#node)** Node to directly receive click

### isClickable

Determine if the Node will receive a click

**Parameters**

-   `args` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

Returns **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 

### getClickCoords

Calculate coordinates at the center of the Node for the click event.

Returns **{x: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number), y: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)}** coordinates for the click event.

### click

Click on the Node.

**Parameters**

-   `args`  
-   `Object`  

**Examples**

```javascript
node.click()
```

### hover

Hover on the Node.

**Parameters**

-   `args`  
-   `Object`  

**Examples**

```javascript
node.hover()
```

### sendKeys

Type text to the Node

**Parameters**

-   `text` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** text to type into the node

**Examples**

```javascript
node.sendKeys('jesg')
```

### setProperty

Set a property on the Node

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** properties name
-   `value` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** properties value

**Examples**

```javascript
node.setProperty('value', 'jesg')
```

### getProperty

Get a property on the Node

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** properties name

**Examples**

```javascript
value = await node.getProperty('value')
```

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** properties value

### getProperties

Get the Node's properties

**Examples**

```javascript
properties = await node.getProperties()
```

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** properties as key-value pairs

### evaluate

Evaluate javascript in the context of this Node.

**Parameters**

-   `options` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

**Examples**

```javascript
propertyValue = await node.evaluate({
    functionDeclaration: function(name) {
        return this[name];
    },
    args: [name],
});
```

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** resolved object

### evaluateAsync

Evaluate Asynchronous javascript in the context of this Node.

The `functionDeclaration` must call either `resolve` to resolve the promise or `reject` to reject the promise.

**Parameters**

-   `options` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** resolved object

### equal

Test if the Node is equal to another Node.

**Parameters**

-   `node` **[Node](#node)** The Node to test against

Returns **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 

### text

Get visible text.

The current implementation does not clean whitespace.

**Parameters**

-   `node`  

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 

## Node

Abstract DOM Element

**Parameters**

-   `driver`  
-   `nodeId`  

### getAttributes

Get the Node's attributes.

**Examples**

```javascript
attributes = await node.getAttributes()
```

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** The attributes as key-value pairs.

### getAttribute

Get an attribute on the node.

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** attribute name

**Examples**

```javascript
value = await node.getAttribute('class')
```

Returns **([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | null)** attribute value or null if the attribute does not exist

### querySelector

Search for a descendent of the current Node.

**Parameters**

-   `args` **([Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) \| [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String))** selector arguments or selector

**Examples**

```javascript
node = await node.querySelector({selector: '#my-id'})
node = await node.querySelector('#my-id')
```

Returns **[Node](#node)** 

### querySelectorAll

Search for descendents of the current Node.

**Parameters**

-   `args` **([Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) \| [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String))** selector arguments or selector

**Examples**

```javascript
nodes = await node.querySelectorAll({selector: 'a'})
nodes = await node.querySelectorAll('a')
```

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Node](#node)>** 

### setFileInput

Set file selection on a file input element.

**Parameters**

-   `args` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

**Examples**

```javascript
node.setFileInput({files: ['/opt/my-file.txt']})
```

### focus

Focus on the Node

**Examples**

```javascript
node.focus()
```

### clickableAt

Test if the Node is clickable at a given location.

**Parameters**

-   `args` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

Returns **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** true if the element will directly receive a click event, otherwise false

### resolveNodeAtDefaultClickPoint

Resolve Node at default click point

**Parameters**

-   `args` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

Returns **[Node](#node)** Node to directly receive click

### isClickable

Determine if the Node will receive a click

**Parameters**

-   `args` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

Returns **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 

### getClickCoords

Calculate coordinates at the center of the Node for the click event.

Returns **{x: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number), y: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)}** coordinates for the click event.

### click

Click on the Node.

**Parameters**

-   `args`  
-   `Object`  

**Examples**

```javascript
node.click()
```

### hover

Hover on the Node.

**Parameters**

-   `args`  
-   `Object`  

**Examples**

```javascript
node.hover()
```

### sendKeys

Type text to the Node

**Parameters**

-   `text` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** text to type into the node

**Examples**

```javascript
node.sendKeys('jesg')
```

### setProperty

Set a property on the Node

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** properties name
-   `value` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** properties value

**Examples**

```javascript
node.setProperty('value', 'jesg')
```

### getProperty

Get a property on the Node

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** properties name

**Examples**

```javascript
value = await node.getProperty('value')
```

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** properties value

### getProperties

Get the Node's properties

**Examples**

```javascript
properties = await node.getProperties()
```

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** properties as key-value pairs

### evaluate

Evaluate javascript in the context of this Node.

**Parameters**

-   `options` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

**Examples**

```javascript
propertyValue = await node.evaluate({
    functionDeclaration: function(name) {
        return this[name];
    },
    args: [name],
});
```

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** resolved object

### evaluateAsync

Evaluate Asynchronous javascript in the context of this Node.

The `functionDeclaration` must call either `resolve` to resolve the promise or `reject` to reject the promise.

**Parameters**

-   `options` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** resolved object

### equal

Test if the Node is equal to another Node.

**Parameters**

-   `node` **[Node](#node)** The Node to test against

Returns **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 

### text

Get visible text.

The current implementation does not clean whitespace.

**Parameters**

-   `node`  

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 

## ExpectedConditions

Common expected conditions.

### isNodePresent

Tests if a Node is present.

**Parameters**

-   `options`  

**Examples**

```javascript
// returns Node
driver.until(ExpectedConditions.isNodePresent({selector: 'button[value="Search"]'}))
```

### isNodeClickable

Tests if a Node is clickable.

**Parameters**

-   `options`  

**Examples**

```javascript
// returns Node
driver.until(ExpectedConditions.isNodeClickable({selector: 'button[value="Search"]'}))
```

### titleIs

Tests the page title

**Parameters**

-   `desiredTitle`  

**Examples**

```javascript
// returns Node
driver.until(ExpectedConditions.titleIs('Google'))
```

### nodeTextToEqual

Tests the nodes text

**Parameters**

-   `node`  
-   `desiredText`  

**Examples**

```javascript
// returns Node
driver.until(ExpectedConditions.nodeTextToEqual('Google'))
```

### nodeValueToEqual

Tests the nodes value

**Parameters**

-   `node`  
-   `desiredValue`  

**Examples**

```javascript
// returns Node
driver.until(ExpectedConditions.nodeValueToEqual('Google'))
```

# License

MIT
