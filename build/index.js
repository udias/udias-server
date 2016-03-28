/**
 * # Build
 *
 *
 */

require('babel-core/register')

const path = require('path')
const glob = require('glob')

const WEB_SERVER = require('./tasks/src-dist')

// environment (default mode: development)
global.__DEVELOPMENT__ = !((process.env.NODE_ENV === 'production') || process.argv.length > 2)

const env = {
  ROOT: path.resolve(__dirname, '..'),
  SRC: path.resolve(__dirname, '../src'),
  DIST: path.resolve(__dirname, '../dist')
}

WEB_SERVER(env)
  .then(function(){
    console.log('[BUILD]', __DEVELOPMENT__ ? 'WATCH' : 'RELEASE')
  })
.catch(console.error.bind(console))
