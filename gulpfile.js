/*
  Familiar 0.2.0
  Copyright 2015 Nick Pfisterer
*/

var browserSync       = require('browser-sync');
var fs                = require('fs');
var ghost             = require('ghost');
var gulp              = require('gulp');
var plugins           = require('gulp-load-plugins')();

var reload            = browserSync.reload;
var supportedBrowsers = 'last 2 versions';
var themeInfo         = JSON.parse(fs.readFileSync('./app/package.json', 'utf8'))
var themeName         = themeInfo.name;
var themeVersion      = themeInfo.version;

var paths = {
  templates: 'app/templates/*.hbs',
  partials:  'app/templates/partials/*.hbs',
  styles:    'app/assets/styles/**/*.scss',
  scripts:   'app/assets/scripts/*.js',
  images:    'app/assets/images/**',
  fonts:     'app/assets/fonts/**',
  metadata:  'app/package.json',
  build:     'node_modules/ghost/content/themes/' + themeName + '/',
  dist:      'dist'
};

/*
  gulp templates, gulp partials
  --------------------
  1. Copy Handlebars templates to build directory
  2. Copy Handlebars partials to build directory
*/
gulp.task('templates', function() {
  return gulp.src(paths.templates)
    .pipe(gulp.dest(paths.build));
});

gulp.task('partials', function() {
  return gulp.src(paths.partials)
    .pipe(gulp.dest(paths.build + 'partials'));
});

/*
  gulp styles
  --------------------
  1. Compile and compress Sass files
  2. Prefix them
  3. Copy to build directory
*/
gulp.task('styles', function() {
  return gulp.src(paths.styles)
    .pipe(plugins.sass({outputStyle: 'compressed'}))
    .pipe(plugins.autoprefixer(supportedBrowsers))
    .pipe(gulp.dest(paths.build + 'assets/css'));
});

/*
  gulp scripts
  --------------------
  1. Combine JavaScript files into one file called theme.js
  2. Compress theme.js
  3. Copy to build directory
*/
gulp.task('scripts', function() {
  return gulp.src(paths.scripts)
    .pipe(plugins.concat('theme.js'))
    .pipe(plugins.uglify())
    .pipe(gulp.dest(paths.build + 'assets/js'));
});

/*
  gulp images
  --------------------
  1. Optimize images
  2. Copy to build directory
*/
gulp.task('images', function() {
  return gulp.src(paths.images)
    .pipe(plugins.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
      }))
    .pipe(gulp.dest(paths.build + 'assets/img'));
});

/*
  gulp fonts
  --------------------
  1. Copy font files to build directory
*/
gulp.task('fonts', function() {
  return gulp.src(paths.fonts)
    .pipe(gulp.dest(paths.build + 'assets/fonts'));
});

/*
  gulp metadata
  --------------------
  1. Copy theme's package.json file to build directory
*/
gulp.task('metadata', function() {
  return gulp.src(paths.metadata)
    .pipe(gulp.dest(paths.build));
});

/*
  gulp ghost
  --------------------
  1. Start up a Ghost server
  2. Make it available to any device on network
  3. Sync actions across devices
  4. Reload all browsers when files are changed
*/
gulp.task('ghost', function() {
  ghost().then(function(ghostServer) {
    ghostServer.start();
  });

  var dbPath = 'node_modules/ghost/content/data/ghost-dev.db';
  if (fs.existsSync(dbPath)) {
    browserSync({
      proxy: 'http://127.0.0.1:2368'
    });
  } else {
    browserSync({
      proxy: 'http://127.0.0.1:2368/ghost'
    });
  }

  gulp.watch([paths.templates], ['templates', reload]);
  gulp.watch([paths.partials], ['partials', reload]);
  gulp.watch([paths.styles], ['styles', reload]);
  gulp.watch([paths.scripts], ['scripts', reload]);
  gulp.watch([paths.images], ['styles', reload]);
  gulp.watch([paths.fonts], ['fonts', reload]);
  gulp.watch([paths.metadata], ['metadata', reload]);
});

/*
  gulp dist
  --------------------
  1. Create zip archive of build directory
  3. Copy to dist directory
*/
gulp.task('dist', function() {
  return gulp.src(paths.build + '**')
    .pipe(plugins.zip(themeName + themeVersion + '.zip'))
    .pipe(gulp.dest(paths.dist));
});

/*
  gulp (Default task)
  --------------------
  1. Run all development tasks
*/
gulp.task('default', ['templates', 'partials', 'styles', 'scripts', 'images', 'fonts', 'metadata', 'ghost']);
