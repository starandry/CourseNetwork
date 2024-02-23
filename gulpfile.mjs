import gulp from 'gulp';
import svgmin from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import cheerio from 'gulp-cheerio';
import rename from 'gulp-rename';
import htmlhint from 'gulp-htmlhint';
import imagemin from 'gulp-imagemin';
import pngquant from 'imagemin-pngquant';

const gulpSvgmin = () =>
    gulp.src('icons/*.svg')
        .pipe(svgmin(() => {
            return {
                plugins: [{ removeViewBox: false },
                    {
                        name: 'removeUselessStrokeAndFill',
                        params: {
                            stroke: true,
                            fill: true
                        }
                    },
                    {removeEmptyAttrs: false}]
            }
        }))
        .pipe(gulp.dest('icons/min'));

const gulpSvgStore = () =>
    gulp.src('icons/min/*.svg')
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
    gulp.src('pages/*.html')
        .pipe(htmlhint())
        .pipe(htmlhint.reporter());

const optPNG = () =>
    gulp.src('images/*.png')
        .pipe(imagemin([
            pngquant({ quality: [0.9, 1] }) // Установка уровня качества для pngquant
        ]))
        .pipe(gulp.dest('images/min'));

export const run = gulp.series(gulpSvgmin, gulpSvgStore, checkHTML, optPNG);