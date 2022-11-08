import webp from "gulp-webp";
import imagemin from "gulp-imagemin";

export const images = () => {
    return app.gulp.src(app.path.src.images, {allowEmpty: true})
        .pipe(app.plugins.plumber(
            app.plugins.notify.onError({
                title: "IMAGES",
                message: "Error: <%= error.message %>"
            })
        ))
        .pipe(app.plugins.newer(app.path.build.images, {allowEmpty: true}))
        
        .pipe(webp())
        // .pipe(
        //     app.plugins.ifPlugin(
        //         app.isBuild,
        //         webp()
        //     )
        // )

        .pipe(app.gulp.dest(app.path.build.images, {allowEmpty: true}))
        // .pipe(
        //     app.plugins.ifPlugin(
        //         app.isBuild,
        //         app.gulp.dest(app.path.build.images, {allowEmpty: true})
        //     )
        // )

        .pipe(app.gulp.src(app.path.build.images, {allowEmpty: true}))
        // .pipe(
        //     app.plugins.ifPlugin(
        //         app.isBuild,
        //         app.gulp.src(app.path.build.images, {allowEmpty: true})
        //     )
        // )

        .pipe(app.plugins.newer(app.path.build.images, {allowEmpty: true}))
        // .pipe(
        //     app.plugins.ifPlugin(
        //         app.isBuild,
        //         app.plugins.newer(app.path.build.images, {allowEmpty: true})
        //     )
        // )

        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            interlaced: true,
            optimizationLevel: 3 // 0 to 7
        }))
        // .pipe(
        //     app.plugins.ifPlugin(
        //         app.isBuild,
        //         imagemin({
        //             progressive: true,
        //             svgoPlugins: [{ removeViewBox: false }],
        //             interlaced: true,
        //             optimizationLevel: 3 // 0 to 7
        //         })
        //     )
        // )
        
        .pipe(app.gulp.dest(app.path.build.images))
        .pipe(app.gulp.src(app.path.src.svg))
        .pipe(app.gulp.dest(app.path.build.images))
        .pipe(app.plugins.browsersync.stream());
}