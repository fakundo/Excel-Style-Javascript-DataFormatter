const gulp = require('gulp');
const babel = require('gulp-babel');
const nodemon = require('gulp-nodemon');
const runSequence = require('run-sequence');
const rimraf = require('rimraf');
const webpack = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');

gulp.task('dev', ()=>
  nodemon({
    script: './examples/lib',
    watch: ['./src', './examples/src'],
    tasks: ['build:lib', 'build:examples']
  })
);


gulp.task('clean:lib', (cb) =>
  rimraf('./lib', cb)
);

gulp.task('clean:examples', (cb) =>
  rimraf('./examples/lib', cb)
);

gulp.task('clean:dist', (cb) =>
  rimraf('./dist', cb)
);

gulp.task('clean', (cb)=>
  runSequence(['clean:lib', 'clean:examples', 'clean:dist'], cb)
);


gulp.task('build:lib', () =>
  gulp.src('./src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('./lib'))
);

gulp.task('build:examples', () =>
  gulp.src('./examples/src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('./examples/lib'))
);

gulp.task('build:dist', () =>
  gulp.src('')
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest('dist'))
);

gulp.task('build', (cb)=>
  runSequence(['build:lib', 'build:examples', 'build:dist'], cb)
);
