const gulp = require('gulp');
const gutil = require('gutil');
const babel = require('gulp-babel');
const nodemon = require('gulp-nodemon');
const runSequence = require('run-sequence');
const rimraf = require('rimraf');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

const statsConfig = {
  colors: true,
  chunks: false,
  modules: false,
  hash: false,
  version: false
};

gulp.task('dev', ()=>
  nodemon({
    script: './examples/lib',
    watch: ['./src', './examples/src'],
    tasks: ['build:dev', 'build:examples']
  })
);


gulp.task('clean:dev', (cb) =>
  rimraf('./dev', cb)
);

gulp.task('clean:examples', (cb) =>
  rimraf('./examples/lib', cb)
);

gulp.task('clean:lib', (cb) =>
  rimraf('./lib', cb)
);

gulp.task('clean', (cb)=>
  runSequence(['clean:dev', 'clean:examples', 'clean:lib'], cb)
);


gulp.task('build:dev', () =>
  gulp.src('./src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('./dev'))
);

gulp.task('build:examples', () =>
  gulp.src('./examples/src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('./examples/lib'))
);

gulp.task('build:lib', function(cb) {
  webpack(webpackConfig, function(err, stats) {
    if(err) throw new gutil.PluginError('webpack:build', err);
    gutil.log('[webpack:build]', stats.toString(statsConfig));
    cb();
  });
});

gulp.task('build', (cb)=>
  runSequence(['build:dev', 'build:examples', 'build:lib'], cb)
);
