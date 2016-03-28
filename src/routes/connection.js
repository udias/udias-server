/**
 * # Route: Connection
 *
 *
 */

import geoip from 'geoip-lite'

export default (server) => {

  const basepath = '/api/v1/connection'

  // provide address
  server.route({
    method: 'GET',
    path: `${basepath}/address`,
    handler (req, reply) {
      return reply(req.info.remoteAddress)
    }
  })

  // provide details
  server.route({
    method: 'GET',
    path: `${basepath}/details`,
    handler (req, reply) {
      const { remoteAddress  } = req.info
      const geo = geoip.lookup(remoteAddress)
      const details = {
        country: geo.country,
        city: geo.city,
        coordinates: geo.ll
      }
      return reply(details)
    }
  })
}
