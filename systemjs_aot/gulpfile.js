const gulp = require('gulp');
const del = require('del');
const runSequence = require('run-sequence');
const ngc = require('gulp-ngc');
const SystemBuilder = require('systemjs-builder');

gulp.task('aot-bundle', function () {
    const builder = new SystemBuilder();

    return builder.loadConfig('./aot/systemjs.config.js')
        .then(function () {
            return builder.buildStatic('aot/app/boot-aot.js', './aot/dist/bundle.js', {
                encodeNames: false,
                mangle: false,
                minify: true,
                rollup: true,
                sourceMaps: true
            });
        })
});

gulp.task('copy-from-ag-grid', () => {
    return gulp.src(['../../ag-grid/*', '../ag-grid/dist/**/*'], {base: '../../ag-grid'})
        .pipe(gulp.dest('./node_modules/ag-grid'));
});

gulp.task('copy-from-ag-grid-enterprise', () => {
    return gulp.src(['../../ag-grid-enterprise/*', '../../ag-grid-enterprise/dist/**/*'], {base: '../../ag-grid-enterprise'})
        .pipe(gulp.dest('./node_modules/ag-grid-enterprise'));
});

gulp.task('copy-from-ag-grid-angular', () => {
    return gulp.src(['../../ag-grid-angular/*', '../../ag-grid-angular/dist/**/*'], {base: '../../ag-grid-angular'})
        .pipe(gulp.dest('./node_modules/ag-grid-angular'));
});

gulp.task('clean-nm-ag-grid-enterprise', () => {
    return del(['node_modules/ag-grid-enterprise', '!node_modules']);
});

gulp.task('clean-nm-ag-grid', () => {
    return del(['node_modules/ag-grid', '!node_modules']);
});

gulp.task('copy-nm-dirs', (callback) => {
    return runSequence('copy-from-ag-grid', 'copy-from-ag-grid-enterprise', 'copy-from-ag-grid-angular', callback);
});

gulp.task('watch', ['copy-nm-dirs'], () => {
    gulp.watch(['../../ag-grid/dist/**/*', '../../ag-grid/src/**/*'], ['copy-from-ag-grid']);
    gulp.watch(['../../ag-grid-enterprise/dist/**/*', '../../ag-grid-enterprise/src/**/*'], ['copy-from-ag-grid-enterprise']);
    gulp.watch(['../../ag-grid-angular/dist/**/*', '../../ag-grid-angular/src/**/*'], ['copy-from-ag-grid-angular']);
});

gulp.task('watch-ng2', ['copy-from-ag-grid-angular'], () => {
    gulp.watch(['../../ag-grid-angular/dist/**/*', '../../ag-grid-angular/src/**/*'], ['copy-from-ag-grid-angular']);
});

gulp.task('clean-aot', () => {
        return del([
            'aot/aot/**', 'aot/app/**',
            'aot/images/**', 'aot/dist/**',
            'aot/node_modules/**', 'aot/e2e/**', 'aot/*.js',
            '!aot', '!aot/systemjs.config.js']);
    }
);

gulp.task('copy-aot-deps', () => {
    require("./copy-dist-files").copyFiles();
    return gulp.src(['./images/**/*'], {base: './'})
        .pipe(gulp.dest('./aot/'));
});

gulp.task('clean-ngc', (callback) => {
    return runSequence('clean-aot', 'copy-aot-deps', 'ngc', callback)
});

gulp.task('ngc', () => {
    return ngc('./tsconfig-aot.json');
});

gulp.task('copy-aot-dist-to-docs', () => {
    return gulp.src(['./aot/dist/**/*', './aot/images/**/*'], {base: './aot'}).pipe(gulp.dest('./docs/ng2-example/'));
});

gulp.task('copy-config-to-docs', () => {
    return gulp.src(['./docs/config/index.html']).pipe(gulp.dest('./docs/ng2-example/'));
});

gulp.task('copy-source-to-docs', () => {
    return gulp.src(['./app/**/*.ts', './app/**/*.html', './app/**/*.css'], {base: './'}).pipe(gulp.dest('./docs/ng2-example/'));
});

gulp.task('clean-docs', (callback) => {
    return del(['./docs/ng2-example/app/*', '!./docs/ng2-example/app'], callback)
});

gulp.task('clean-ag-docs', (callback) => {
    return del(['../../ag-grid-docs/src/ng2-example/app/*', '!../../ag-grid-docs/src/ng2-example/app'], {force: true}, callback)
});

gulp.task('copy-to-docs', (callback) => {
    require("./copy-dist-files").copyFiles('./docs/ng2-example/');
    return runSequence('clean-docs', 'copy-aot-dist-to-docs', 'copy-config-to-docs', 'copy-source-to-docs', callback);
});

gulp.task('clean-aot-build', (callback) => {
    return runSequence('clean-ngc', 'aot-bundle', callback);
});

gulp.task('build-and-copy-to-docs', (callback) => {
    return runSequence('clean-ag-docs', 'clean-aot-build', 'copy-to-docs', callback)
});

gulp.task('copy-to-ag-docs', () => {
    return gulp.src(['./docs/ng2-example/**/*'], {base: './docs'}).pipe(gulp.dest('../../ag-grid-docs/src/'))
});

gulp.task('build-and-copy-to-ag-docs', (callback) => {
    return runSequence('build-and-copy-to-docs', 'copy-to-ag-docs', callback);
});
