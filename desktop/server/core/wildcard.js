'use strict'

const Lisp = require('./lisp')
const clock = require('./clock')
const helpers = require('./helpers');


function Wildcard (host, input, query, responder) {
  const lib = {

    // Sights
    self: function () {
      return host.id
    },
    parent: function () {
      return host.parent().id
    },
    stem: function () {
      return host.stem().id
    },

    // Transform
    lc: function (str) {
      return str ? `${str}`.toLowerCase() : ''
    },
    cc: function (str) {
      return str ? `${str.charAt(0).toUpperCase()}${str.slice(1).toLowerCase()}` : ''
    },
    uc: function (str) {
      return str ? `${str}`.toUpperCase() : ''
    },
    tc: function (str) {
      // TODO: move somewhere rational
      // TODO: Look at using https://stackoverflow.com/a/46774740
      function toTitleCase(str) {
        return str.replace(/\w\S*/g, function(txt){
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
      }
      return str ? toTitleCase(`${str}`) : ''
    },
    format: function (word, settings) {
      return settings ? `<action data='${settings}'>${word}</action>` : `<action>${word}</action>`
    },

    // Programming
    query: function () {
      return query
    },
    responder: function () {
      return responder.id
    },
    success: function () {
      return !!host.data.last_error ? 'true' : 'false'
    },
    error: function () {
      return host.data.last_error ? host.data.last_error.to_a() : 'none'
    },

    // Arithmetic
    add: function (...items) {
      return items.reduce((a, b) => a + b, 0)
    },
    sub: function (a, b) {
      return a - b
    },
    mult: function (...items) {
      return items.reduce((a, b) => a * b, 0) // Not working
    },
    div: function (a, b) {
      return a / b
    },
    pow: function (a, b) {
      return a ** b
    },
    inc: function (a) {
      return a + 1
    },
    dec: function (a) {
      return a - 1
    },

    // Logic
    equal: function (a, b) {
      return (typeof a === 'function' ? a() : a) == (typeof b === 'function' ? b() : b)
    },
    if: function (i, t, e) {
      return typeof id === 'function' ? i() : i ? t : e
    },
    and: function (...items) { // Return first non-null input if all inputs are non-null
      let first_non_null = new helpers.nil()
      for (var id in items) {
        if (!items[id] || items[id] instanceof helpers.nil) {
          return new helpers.nil()
        } else {
          first_non_null = items[id]
        }
      }
      return first_non_null
    },
    or: function (...items) { // Return first non-null input
      for (var id in items) {
        if (!!items[id] && !(items[id] instanceof helpers.nil)) {
          return items[id]
        }
      }
      return new helpers.nil()
    },

    // Clock
    // BUG: keeps returning undefined
    // time:  function () {
    //   return clock.time
    // },
    // beat:  function () {
    //   return clock.beat
    // },
    // pulse: function () {
    //   return clock.pulse
    // },

    // create clock & enter clock & trigger time The time is @( time ) & leave & time

    // Main
    vessel: function (id, field) {
      if (typeof id === 'function') { id = id() }
      if (typeof id !== 'number') { return '(error:misformated function)' }
      const target = host.paradise.world[id]
      if (!target) { return `(error:unknown vessel-${id})` }
      return field && target.data[field] ? target.data[field] : target
    },
    carry: function (id, target) {
      if (typeof id === 'function') { id = id() }
      const children = host.children()
      for (const i in children) {
        if (children[i].is(target)) { return true }
      }
      return new helpers.nil()
    },
    random: function (...items) {
      return items[Math.floor((Math.random() * items.length))]
    }
  }
  Lisp.call(this, input, lib)
}

module.exports = Wildcard
