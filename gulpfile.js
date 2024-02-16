const gulp = require('gulp');
const svgmin = require('gulp-svgmin');
const svgstore = require('gulp-svgstore');
const cheerio = require('gulp-cheerio');
const rename = require('gulp-rename');
const htmlhint = require("gulp-htmlhint");

const gulpSvgmin = () =>
    gulp.src('svg-icons/*.svg')
        .pipe(svgmin(() => {
            return {
                plugins: [{ removeViewBox: false },
                    {
                        name: "removeUselessStrokeAndFill",
                        params: {
                            stroke: true,
                            fill: true
                        }
                    },
                    {removeEmptyAttrs: false}]
            }
        }))
        .pipe(gulp.dest('svg-icons/min'));

const gulpSvgStore = () =>
    gulp.src('svg-icons/min/*.svg')
        .pipe(svgstore())
        .pipe(cheerio({
            run: function ($) {
                // Добавляем префикс ко всем id именам
                $('symbol').attr('id', function (i, id) {
                    return 'svg-icon-' + id;
                });
                // Удаление атрибутов fill и stroke
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                // Удаление элементов-демонстраций, если они имеются
                $('demo-element').remove();
                // Удаление элементов <title>
                $('title').remove();
            },
            parserOptions: { xmlMode: true }
        }))
        .pipe(rename('svg-sprite.svg'))
        .pipe(gulp.dest('pages'));

const checkHTML = () =>
    gulp.src("pages/*.html")
        .pipe(htmlhint())
        .pipe(htmlhint.reporter());

exports.default = gulp.series(gulpSvgmin, gulpSvgStore, checkHTML);