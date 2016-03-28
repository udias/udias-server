/**
 * # Source - Distribution
 *
 * Configuration to pre-transpile scripts and copy assets
 */

import { emptyDirSync } from 'fs-extra'
import gulp from 'gulp'
const $ = require('gulp-load-plugins')()

/**
 *
 */
export default (env) => {
  return new Promise((resolve, reject) => {
    const MATCH_ALL = `${env.SRC}/**/*`
    const target = `${env.DIST}`
    emptyDirSync(target)
    transform(gulp.src(MATCH_ALL), target).on('end', () => {
      if (__DEVELOPMENT__) {
        $.watch(MATCH_ALL, (file) => {
          transform(gulp.src(file.path, { base: env.SRC }), target)
          .on('end', () => console.log('[SERVER:CHANGE]', $.util.colors.yellow(file.path)))
        })
      }
      return resolve()
    })
  })
}

/**
 * Alternative for lazypipe - as gulp-filter requires a local defintion of the streams
 */
function transform (stream, target) {
  return stream
  .pipe($.plumber(::console.error))
  .pipe($.sourcemaps.init())
    .pipe($.babel({/** see .babelrc **/}))
  .pipe($.sourcemaps.write())
  .pipe($.plumber.stop())
  .pipe(gulp.dest(target))
}
