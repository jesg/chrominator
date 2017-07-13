[![npm version](https://img.shields.io/npm/v/chrominator.svg?style=flat-square)](https://www.npmjs.com/package/chrominator)

[![Build Status](https://travis-ci.org/jesg/chrominator.svg?branch=master)](https://travis-ci.org/jesg/chrominator)

a high level api to chrome debugger for automation.

currently working on core api built on promises.  might provide a high level fluent api similar to nightmarejs in the future.

```javascript
const Chrominator = require('chrominator');
const ExpectedConditions = Chrominator.ExpectedConditions;

Chrominator(async (driver) => {
    await driver.navigate({url: 'https://www.google.com'})
    const search = await driver.querySelector({selector: 'input[name="q"]'})
    await search.sendKeys('yellow');
    const searchButton = await driver.until(ExpectedConditions.is_node_present({selector: 'button[value="Search"]'}))
    await searchButton.click();
    await driver.delay(1000);
    await driver.screenshot('screenshot.png', {format: 'png'});
});
```

# API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

## Driver

Abstraction to drive a webpage

### navigate

Navigate to a page and wait for the page to load.

**Parameters**

-   `args`  

**Examples**

```javascript
driver.navigate({url: 'http://google.com', pageLoadStrategy: 'interactive'})
```

### querySelector

Search for a Node in the current document

**Parameters**

-   `args` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** selector arguments

**Examples**

```javascript
node = await driver.querySelector({selector: '#my-id'})
```

Returns **[Node](#node)** 

### querySelectorAll

Search for Nodes in the current document

**Parameters**

-   `args` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** selector arguments

**Examples**

```javascript
nodes = await driver.querySelectorAll({selector: 'a'})
```

Returns **[Node](#node)** 

### reload

Reload the current page

### pdf

Print the current page to pdf.

**Parameters**

-   `path` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** file path
-   `options` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** pdf options

### screenshot

Take a screenshot.

**Parameters**

-   `path` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** file path
-   `options` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** image options

**Examples**

```javascript
driver.screenshot('screenshot.png', {format: 'png'});
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

### delay

Async delay.

**Parameters**

-   `ms` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** number of milliseconds

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

### until

Wait for a condition to be satisfied.

**Parameters**

-   `condition` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** The condition to wait for.

**Examples**

```javascript
node = await driver.until(ExpectedConditions.is_node_present({selector: 'button[value="Search"]'}))
```

### createDriver

Create and initialize the driver.

**Parameters**

-   `crd` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** an instance of chrome remote debugger

## Node

**Parameters**

-   `driver` **[Driver](#driver)** 
-   `nodeId` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The nodes node id

### getAttributes

Get the Node's attributes.

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** The attributes as key-value pairs.

### getAttribute

Get an attribute on the node.

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** attribute name

Returns **([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | null)** attribute value or null if the attribute does not exist

### querySelector

Search for a descendent of the current Node.

**Parameters**

-   `args` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** selector arguments

Returns **[Node](#node)** 

### querySelectorAll

Search for descendents of the current Node.

**Parameters**

-   `args` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** selector arguments

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Node](#node)>** 

### setFileInput

Set file selection on a file input element.

**Parameters**

-   `args` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

### focus

Focus on the Node

### clickableAt

Test if the Node is clickable at a given location.

**Parameters**

-   `args` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

Returns **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** true if the element will directly receive a click event, otherwise false

### getClickCoords

Calculate coordinates at the center of the Node for the click event.

Returns **{x: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number), y: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)}** coordinates for the click event.

### click

Click on the Node.

**Parameters**

-   `args`  
-   `Object`  

### hover

Hover on the Node.

**Parameters**

-   `args`  
-   `Object`  

### sendKeys

Type text to the Node

**Parameters**

-   `text` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** text to type into the node

### setProperty

Set a property on the Node

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** properties name
-   `value` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** properties value

### getProperty

Get a property on the Node

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** properties name

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** properties value

### getProperties

Get the Node's properties

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

## Node

Abstract DOM Element

**Parameters**

-   `driver`  
-   `nodeId`  

### getAttributes

Get the Node's attributes.

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** The attributes as key-value pairs.

### getAttribute

Get an attribute on the node.

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** attribute name

Returns **([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | null)** attribute value or null if the attribute does not exist

### querySelector

Search for a descendent of the current Node.

**Parameters**

-   `args` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** selector arguments

Returns **[Node](#node)** 

### querySelectorAll

Search for descendents of the current Node.

**Parameters**

-   `args` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** selector arguments

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Node](#node)>** 

### setFileInput

Set file selection on a file input element.

**Parameters**

-   `args` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

### focus

Focus on the Node

### clickableAt

Test if the Node is clickable at a given location.

**Parameters**

-   `args` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

Returns **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** true if the element will directly receive a click event, otherwise false

### getClickCoords

Calculate coordinates at the center of the Node for the click event.

Returns **{x: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number), y: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)}** coordinates for the click event.

### click

Click on the Node.

**Parameters**

-   `args`  
-   `Object`  

### hover

Hover on the Node.

**Parameters**

-   `args`  
-   `Object`  

### sendKeys

Type text to the Node

**Parameters**

-   `text` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** text to type into the node

### setProperty

Set a property on the Node

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** properties name
-   `value` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** properties value

### getProperty

Get a property on the Node

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** properties name

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** properties value

### getProperties

Get the Node's properties

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

## ExpectedConditions

Common expected conditions.

### is_node_present

Tests if a Node is present.

**Parameters**

-   `options`  

**Examples**

```javascript
// returns Node
driver.until(ExpectedConditions.is_node_present({selector: 'button[value="Search"]'}))
```

# License

MIT
