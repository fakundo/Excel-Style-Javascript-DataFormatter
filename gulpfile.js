const gulp = require('gulp');
const babel = require('gulp-babel');
const nodemon = require('gulp-nodemon');
const runSequence = require('run-sequence');
const rimraf = require('rimraf');
const webpack = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');

gulp.task('dev', ()=>
  nodemon({
    script: './lib',
    watch: './src',
    tasks: ['build:lib']
  })
);

gulp.task('clean:lib', (cb) =>
  rimraf('./lib', cb)
);

gulp.task('clean:dist', (cb) =>
  rimraf('./dist', cb)
);

gulp.task('clean', (cb)=>
  runSequence(['clean:lib', 'clean:dist'], cb)
);

gulp.task('build:lib', () =>
  gulp.src('./src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('lib'))
);

gulp.task('build:dist', () =>
  gulp.src('')
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest('dist'))
);

gulp.task('build', (cb)=>
  runSequence(['build:lib', 'build:dist'], cb)
);
