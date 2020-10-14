'use strict'

const sdNotify = require('bindings')('notify')

let watchdogTimer = null

const LOG_LEVELS = {
  LOG_EMERG: 0,
  LOG_ALERT: 1,
  LOG_CRIT: 2,
  LOG_ERR: 3,
  LOG_WARNING: 4,
  LOG_NOTICE: 5,
  LOG_INFO: 6,
  LOG_DEBUG: 7
}

function journalPrint (...args) {
  const level = args.shift()
  sdNotify.journalPrint(level, args.join(' '))
}

const log = {
  emerg: journalPrint.bind(null, LOG_LEVELS.LOG_EMERG),
  emergency: journalPrint.bind(null, LOG_LEVELS.LOG_EMERG),
  alert: journalPrint.bind(null, LOG_LEVELS.LOG_ALERT),
  crit: journalPrint.bind(null, LOG_LEVELS.LOG_CRIT),
  critical: journalPrint.bind(null, LOG_LEVELS.LOG_CRIT),
  err: journalPrint.bind(null, LOG_LEVELS.LOG_ERR),
  error: journalPrint.bind(null, LOG_LEVELS.LOG_ERR),
  warning: journalPrint.bind(null, LOG_LEVELS.LOG_WARNING),
  warn: journalPrint.bind(null, LOG_LEVELS.LOG_WARNING),
  notice: journalPrint.bind(null, LOG_LEVELS.LOG_NOTICE),
  info: journalPrint.bind(null, LOG_LEVELS.LOG_INFO),
  debug: journalPrint.bind(null, LOG_LEVELS.LOG_DEBUG)
}

module.exports = Object.assign({}, sdNotify, {
  ready: (pid = null) => {
    if(!pid) pid = process.pid
    sdNotify.ready(pid)
  },

  startWatchdogMode: (interval, pid = null) => {
    interval = +interval || 3000
    if(!pid) pid = process.pid
    watchdogTimer = setInterval(sdNotify.watchdog, interval, pid)
  },

  stopWatchdogMode: () => {
    if (watchdogTimer) {
      clearInterval(watchdogTimer)
      watchdogTimer = null
    }
  },

  sendStatus: (text, pid = null) => {
    if(!pid) pid = process.pid
    sdNotify.sendState(pid, 'STATUS=' + text + '\n')
  },

  log: log
})
