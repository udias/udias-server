/**
 * # Routes: Tasks
 *
 *
 */

import { readFileSync } from 'fs'

const scripts = Object.create(null)

const types = [
  'udias-task-checksum-creation'
  // 'udias-task-video-editing'
].map((type) => {
  const { meta } = require(type)
  scripts[meta.type] = {
    web: readFileSync(require.resolve(`${type}/dist/${type}.web.js`)),
    node: readFileSync(require.resolve(`${type}/dist/${type}.node.js`))
  }
  return meta
})

const entries = {
  global: [],
  local: [],
  private: []
}

export default (server) => {

  // provide script bundles
  server.route({
    method: 'GET',
    path: '/tasks/{type}.{environment}.js',
    handler (req, reply) {
      const { type, environment } = req.params
      return reply(scripts[type][environment])
    }
  })

  // remove socket submissions
  server.messenger.on('disconnect', (socket) => {
    console.log('remove', socket.id);
    entries.global = entries.global.filter((entry) => entry.origin !== socket.id)
    entries.local = entries.local.filter((entry) => entry.origin !== socket.id)
    entries.private = entries.private.filter((entry) => entry.origin !== socket.id)
    server.publish('/tasks/entries', entries.global)
  })

  server.messenger.on('/tasks/entries', (socket, message) => {
    const { type, scope, manifest, connection } = message
    if (type === 'create') {
      entries[scope].push({
        origin: socket.id,
        manifest,
        connection
      })
      if (scope !== 'private') {
        var path = '/tasks/entries'
        var candidates = entries.global
        if (scope === 'local') {
          path += `/${connection.remoteAddress}`
          candidates = getCandidates(connection.remoteAddress)
        }
        server.publish(path, candidates)
      }
    }
  })

  server.messenger.on('/tasks/results', (socket, message) => {
    const { source, data } = message
    const match = [
      ...entries.private,
      ...entries.local,
      ...entries.global
    ].find((entry) => entry.manifest === source)

    if (!match) {
      // TODO:
      // - handle error in case the original task is already removed
      return console.error('Missing')
    }

    const subscription = `/tasks/results/${source}`
    server.eachSocket((listener) => listener.publish(subscription, data), { subscription })
  })

  server.subscription('/tasks/types', {
    onSubscribe: (socket, path) => socket.publish(path, types)
  })

  server.subscription('/tasks/entries', {
    onSubscribe: (socket, path, params) => socket.publish(path, entries.global)
  })

  server.subscription('/tasks/entries/{address}', {
    onSubscribe: (socket, path, params) => socket.publish(path, getCandidates(params.address))
  })

  server.subscription('/tasks/results/{address}')
}

/**
 * Filter valid candidates
 *
 * @param  {string} address -
 * @return {array}          -
 */
function getCandidates (address) {
  return entries.local.filter((entry) => entry.connection.remoteAddress === address)
}
