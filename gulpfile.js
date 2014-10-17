var gulp=require('gulp'),
    rename = require('gulp-rename'),        // 重命名
    minifycss = require('gulp-minify-css'), // CSS压缩
    uglify=require('gulp-uglify'),          //js压缩
    clean = require('gulp-clean');          //清空文件夹

gulp.task('default', function () {
    //清空dist文件夹
    gulp.src('dist').pipe(clean());
    //压缩js
    gulp.src(['demo/lib/modules/util/**/*.js'])
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist'));

    //压缩css
    gulp.src(['demo/lib/modules/util/**/*.css'])
        .pipe(minifycss())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist'));
});