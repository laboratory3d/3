const { src, dest, task, series, parallel, watch } = require("gulp");
const rm = require('gulp-rm');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const gcmq = require('gulp-group-css-media-queries');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const gulpif = require('gulp-if');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const babel = require('gulp-babel');
const concat = require('gulp-concat');

const env = process.env.NODE_ENV || 'development';


task('clean', () => {
    return src('app/**/*', { read: false }).pipe(rm())
})


task('styles', () => {
return src('src/scss/main.scss')
	.pipe(gulpif(env === 'development', sourcemaps.init()))
	.pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
        overrideBrowserslist: ['last 1 version, >1%'],
        cascade: false
    }))
	.pipe(gulpif(env === 'production', gcmq()))
	.pipe(gulpif(env === 'production', cleanCSS()))
	.pipe(gulpif(env === 'development', sourcemaps.write()))
	.pipe(dest('app/assets/css'))
    .pipe(reload({ stream: true }));
});

task('scripts', () => {
    return src(['src/js/*.js'])
        .pipe(concat('main.js'))
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(dest('app/assets/js'))
        .pipe(reload({ stream: true }));
    });

task('copy:html', () => {
return src('src/html/*.html')
    .pipe(dest('app'))
    .pipe(reload({ stream: true }));
})
task('copy:images', () => {
    return src('src/images/**/*')
        .pipe(dest('app/assets/images'))
        .pipe(reload({ stream: true }));
    })

task('server', () => {
	browserSync.init({
		server: {
			baseDir: "./app"
		},
		open: true
	});
});

task('watch', () => {
	watch('src/scss/**/*.scss', series('styles'));
    watch('src/html/*.html', series('copy:html'));
    watch('src/images/**/*', series('copy:images'));
    watch('src/js/*.js', series('scripts'));
});


task('default',
	series(
		'clean',
        parallel('copy:html', 'copy:images', 'styles', 'scripts'),
		parallel('watch', 'server')
	)
);

task('build',
	series(
		'clean',
        parallel('copy:html', 'copy:images', 'styles', 'scripts')
	)
);
