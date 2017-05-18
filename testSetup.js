const jsdom = require('jsdom').jsdom

global.document = jsdom('<!doctype html><html><body><div id="root"></div></body></html>')
global.window = document.defaultView

Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    global[property] = document.defaultView[property]
  }
})

global.navigator = { userAgent: 'node.js' }
global.documentRef = document

global.window.requestAnimationFrame = () => {}
