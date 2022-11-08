import fs from 'fs';
import fonter from 'gulp-fonter';
import ttf2woff2 from 'gulp-ttf2woff2';
import rename from 'gulp-rename';

export const otfToTtf = () => {
    // Search files of .otf fonts
    return app.gulp.src(`${app.path.srcFolder}/fonts/*.otf`, {})
        .pipe(app.plugins.plumber(
            app.plugins.notify.onError({
                title: "FONTS",
                message: "Error: <%= error.message %>"
            }))
        )
        // Converting to .ttf
        .pipe(fonter({
            formats: ['ttf']
        }))
        .pipe(rename( function (path) {
                path.basename = (path.basename.slice(6)).toString()
        }))
        // Upload to source folder
        .pipe(app.gulp.dest(`${app.path.srcFolder}/fonts/*`))
}

export const ttfToWoff = () => {
    // Search files of .ttf fonts
    return app.gulp.src(`${app.path.srcFolder}/fonts/*.ttf`, {})
        .pipe(app.plugins.plumber(
            app.plugins.notify.onError({
                title: "FONTS",
                message: "Error: <%= error.message %>"
            }))
        )
        // Converting to .woff
        // .pipe(fonter({
        //     formats: ['woff']
        // }))
        // // Upload to source folder
        // .pipe(app.gulp.dest(`${app.path.build.fonts}`))
        // Search files of .ttf fonts
        .pipe(app.gulp.src(`${app.path.srcFolder}/fonts/*.ttf`))
        // Converting to .woff2
        .pipe(ttf2woff2())
        // Upload to source folder
        .pipe(app.gulp.dest(`${app.path.build.fonts}`))
}

export const fontsStyle = () => {
    // Connection fonts to style files 
    let fontsFile = `${app.path.srcFolder}/scss/fonts.scss`;
    // Check if font files exist
    fs.readdir(app.path.build.fonts, function(err, fontsFiles) {
        if (fontsFiles) {
            // Check if style files for connecting fonts exist
            if (!fs.existsSync(fontsFile)) {
                // If the file does not exist, create it
                fs.writeFile(fontsFile, '', cb);
                let newFileOnly;
                for (var i = 0; i < fontsFiles.length; i++) {
                    // Write the connection of fonts in the style file
                    let fontFileName = fontsFiles[i].split('.')[0];
                    if (newFileOnly !== fontFileName) {
                        let fontName = fontFileName.split('-')[0] ? fontFileName.split('-')[0] : fontFileName;
                        let fontWeight = fontFileName.split('-')[1] ? fontFileName.split('-')[1] : fontFileName;
                        if (fontWeight.toLowerCase() === 'thin') {
                            fontWeight = 100;
                        } else if (fontWeight.toLowerCase() === 'extralight') {
                            fontWeight = 200;
                        } else if (fontWeight.toLowerCase() === 'light') {
                            fontWeight = 300;
                        } else if (fontWeight.toLowerCase() === 'medium') {
                            fontWeight = 500;
                        } else if (fontWeight.toLowerCase() === 'semibold') {
                            fontWeight = 600;
                        } else if (fontWeight.toLowerCase() === 'bold') {
                            fontWeight = 700;
                        } else if (fontWeight.toLowerCase() === 'extrabold' || fontWeight.toLowerCase() === 'heavy') {
                            fontWeight = 800;
                        } else if (fontWeight.toLowerCase() === 'black') {
                            fontWeight = 900;
                        } else {
                            fontWeight = 400;
                        }
                        fs.appendFile(fontsFile, `@font-face {\n\tfont-family: ${fontName};\n\tfont-display: swap;\n\tsrc: url("../fonts/${fontFileName}.woff2") format("woff2"),\n\turl("../fonts/${fontFileName}.woff") format("woff");\n\tfont-weight: ${fontWeight};\n\tfont-style: normal;\n}\r\n`, cb);
                        newFileOnly = fontFileName;
                    }
                }
            } else {
                // If file exists, print a message
                console.log("File scss/fonts.scss alrady exist. To update file delete it!")
            }
        }
    });

    return app.gulp.src(`${app.path.srcFolder}`);
    function cb() {}
}