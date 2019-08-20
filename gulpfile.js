//set up defaults
var port = 8000;
var paths = {
    dev: './dev/',
    dist: './dist/',
    css: "css",
    js: "js",
    html: "html",
    assets: 'assets',
    templates: 'templates'
};

var ftpInfo = {
    host: "ftp.trexwebsites.com",
    user: "sng@trexwebsites.com",
    pass: "StretchnGrow01!",
    siteurl: "http://sng.trexwebsites.com"
};

// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var fileinclude = require('gulp-file-include');
var path = require('path');
var connect = require('gulp-connect-php');
var clean = require('gulp-clean');
var htmlclean = require('gulp-htmlclean');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var open = require('gulp-open');
var less = require('gulp-less');
var ftp = require('vinyl-ftp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var gulpsync = require('gulp-sync')(gulp);

// Static server for browsersync
gulp.task('connect-sync', function () {
  connect.server({
    base:paths.dist,
    keepalive:false,
    host:'localhost'
  }, function (){
  browserSync({
    proxy: 'localhost:8000'
  });
});
});

//default value for prod mode is false
var prod = gutil.env.prod === true;

//put together HTML files
gulp.task('fileinclude', function () {
    return gulp.src([path.join(paths.dev + paths.html, '**/[^_]*.html'), path.join(paths.dev + paths.html, '**/[^_]*.php')])
      .pipe(fileinclude({
          prefix: '@@',
          basepath: path.join(paths.dev + paths.templates),
          context: { page: "", pagesub: "", calltoaction: "", captcha: false }
      }))
      .pipe(rename(function (path) {
          //This function checks to see if the directory name or file name has
          // a . in it (like it starts with 1a.) and remove the prefix
          //this is useful if we get site maps and we want to name the directory
          //with the sitemap
          var lastDirIdx = path.dirname.lastIndexOf("\\") + 1;
          var lastDir = path.dirname.substring(lastDirIdx);

          //check to see if we have a .
          if (lastDir.indexOf(".") > 0) {
              var newLastDir = lastDir.substring(lastDir.indexOf(".") + 1);
              path.dirname = path.dirname.substring(0, lastDirIdx) + newLastDir;
          }

          var lastDirIdx = path.dirname.lastIndexOf("\\") + 1;
          var lastDir = path.dirname.substring(lastDirIdx);

          //check to see if we have a .
          if (path.basename.indexOf(".") > 0) {
              var newBaseName = path.basename.substring(path.basename.indexOf(".") + 1);
              path.basename = newBaseName;
          }
      }))
      .pipe(gulpif(prod, htmlclean()))
      .pipe(gulp.dest(paths.dist));
});

//Less CSS
gulp.task('less', function () {
    return gulp.src(path.join(paths.dev + paths.less, 'styles.less'))
      .pipe(less({
          paths: [path.join(__dirname, 'less', 'includes')]
      }))
      .pipe(rename('style_less.css'))
      .pipe(gulp.dest(paths.dist + paths.css));
});

// Lint Task
gulp.task('lint', function () {
    return gulp.src(path.join(paths.dev + paths.js, '*.js'))
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

//ftp to dev site
gulp.task('deploy', gulpsync.sync(['clean', 'lint', 'less', 'assets', 'scripts', 'fileinclude']), function () {
    var conn = ftp.create({
        host: ftpInfo.host,
        user: ftpInfo.user,
        password: ftpInfo.pass,
        parallel: 10,
        log: gutil.log
    });

    conn.rmdir('/', function () {
        conn.delete('/', function () {
            return gulp.src(path.join(paths.dist, '**/*'), { base: paths.dist, buffer: false })
            .pipe(conn.dest('/'));
        });
    });
});

//ftp to dev site
gulp.task('deployopen', gulpsync.sync(['deploy']), function () {
    gulp.src(__filename)
      .pipe(open({ uri: ftpInfo.siteurl }));
});

// Concatenate & Minify JS
gulp.task('scripts', function () {
    return gulp.src(path.join(paths.dev + paths.js, '*.js'))
        .pipe(concat('all.js'))
        .pipe(gulp.dest(paths.dist + paths.js))
        .pipe(gulpif(prod, rename('all.min.js')))
        .pipe(gulpif(prod, uglify()))
        .pipe(gulpif(prod, gulp.dest(paths.dist + paths.js)));
});


//bring over assets
gulp.task('assets', function () {
    return gulp.src(path.join(paths.dev + paths.assets, '**/*.*'))
        .pipe(gulp.dest(paths.dist));
});

//clean distribution folder
gulp.task('clean', function () {
    return gulp.src(paths.dist, { read: false })
        .pipe(clean());
});

// create a task that ensures the `fileinclude` task is complete before
// reloading browsers
gulp.task('fileinclude-watch', ['fileinclude'], browserSync.reload);
gulp.task('scripts-watch', ['scripts'], browserSync.reload);
gulp.task('css-watch', ['css'], browserSync.reload);
gulp.task('less-watch', ['less'], browserSync.reload);



// Watch Files For Changes
gulp.task('watch', function () {
  gulp.watch(path.join(paths.dev + paths.js, '*.js'), ['lint', 'scripts-watch']);
  gulp.watch(path.join(paths.dev + paths.css, '*.css'), ['css-watch']);
  gulp.watch(path.join(paths.dev + paths.less, '*.less'), ['less-watch']);
  gulp.watch([path.join(paths.dev + paths.html, '**/*'), path.join(paths.dev + paths.templates, '*.html')], ['fileinclude-watch']);
  gulp.watch(path.join(paths.dev + paths.assets, '**/*.*'), ['assets']);
});


// Default Task
gulp.task('default', gulpsync.sync(['clean', 'lint', 'less', 'assets', 'scripts', 'fileinclude', 'connect-sync', 'watch']));
