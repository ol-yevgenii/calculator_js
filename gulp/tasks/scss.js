import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import rename from 'gulp-rename';
import cleanCss from 'gulp-clean-css'; // Compression Css files
import webpcss from 'gulp-webpcss'; // WEBP images output
import autoprefixer from 'gulp-autoprefixer'; // Adding vendor prefixes
import groupCssMediaQueries from 'gulp-group-css-media-queries'; // Grouping media queries


const sass = gulpSass(dartSass);

export const scss = () => {
    return app.gulp.src(app.path.src.scss, { sourcemaps: true })
        .pipe(app.plugins.plumber(
            app.plugins.notify.onError({
                title: "SCSS",
                message: "Error: <%= error.message %>"
            })
        ))
        .pipe(app.plugins.replace(/@img\//g, '../img/'))
        .pipe(sass({
            outputStyle: `expanded`
        }))

        // .pipe(
        //     app.plugins.ifPlugin(
        //         app.isBuild,
        //         groupCssMediaQueries()
        //     )
        // )
        .pipe(groupCssMediaQueries())

        // .pipe(
        //     app.plugins.ifPlugin(
        //         app.isBuild,
        //         webpcss(
        //             {
        //                 webClass: ".webp",
        //                 noWebpClass: ".no-webp"
        //             }
        //         )
        //     )
        // )
        .pipe(webpcss(
            {
                webClass: ".webp",
                noWebpClass: ".no-webp"
            }
        ))

        // .pipe(
        //     app.plugins.ifPlugin(
        //         app.isBuild,
        //         autoprefixer(
        //             {
        //                 grid: true,
        //                 overrideBrowserslist: ["last 3 versions"],
        //                 cascade: true
        //             }
        //         )
        //     )
        // )
        .pipe(autoprefixer(
            {
                grid: true,
                overrideBrowserslist: ["last 3 versions"],
                cascade: true
            }
        ))

        // Uncomment if uncompressed stylesheet is needed
        .pipe(app.gulp.dest(app.path.build.css))

        .pipe(cleanCss())
        // .pipe(
        //     app.plugins.ifPlugin(
        //         app.isBuild,
        //         cleanCss()
        //     )
        // )
        
        .pipe(rename({
            extname: ".min.css"
        }))
        .pipe(app.gulp.dest(app.path.build.css))
        .pipe(app.plugins.browsersync.stream());
}