/**
 * # Index
 *
 *
 */

global.__DEVELOPMENT__ = !((process.env.NODE_ENV === 'production') || process.argv.length > 2)

require('./dist')
