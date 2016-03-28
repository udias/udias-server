/**
 * # Server
 *
 *
 */

import 'babel-polyfill'

import { EventEmitter } from 'events'
import { resolve as resolvePath } from 'path'

import glob from 'glob'
import Hapi, { Server } from 'hapi'

const config = {
  host: __DEVELOPMENT__ ? 'localhost' : 'udias.online',
  port: __DEVELOPMENT__ ? 9000 : 64452
}

const server = new Server({/** options **/})

server.connection({
  host: config.host,
  port: config.port,
  routes: {
    cors: {
      origin: ['*']
    }
  }
})

// socket message delegation from clients
server.messenger = new EventEmitter()

server.register([
  {
    register: require('nes'),
    options: {
      onDisconnection: (socket) => server.messenger.emit('disconnect', socket),
      onMessage (socket, message, next) {
        server.messenger.emit(message.path, socket, message.message)
        next()
      }
    }
  }
], (error) => {
  if (error) {
    throw error
  }

  // load routes
  glob('./routes/**.js', { cwd: __dirname }, (error, matches) => {
    if (error) {
      return console.error(error)
    }

    matches.forEach((route) => require(route)(server))

    server.start((error) => {
      if (error) {
        return console.error(error)
      }
      console.log(`[READY] - ${server.info.uri}`)
    })
  })

})
