'use strict'

// external tooling
const resolve = require('resolve')

const moduleDirectories = ['web_modules', 'node_modules']

function pathNotFound(id, paths, base) {
    if (!~paths.indexOf(base)) {
        paths.unshift(base)
    }

    throw new Error(
        `Failed to find '${id}'
in [
  ${paths.join(',\n        ')}
]`
    )
}

module.exports = function (id, base, options) {
    const paths = options.path

    const resolveOpts = {
        basedir: base,
        moduleDirectory: moduleDirectories.concat(options.addModulesDirectories),
        paths: paths,
        extensions: ['.css'],
        packageFilter: function processPackage(pkg) {
            if (pkg.style) pkg.main = pkg.style
            else if (!pkg.main || !/\.css$/.test(pkg.main)) pkg.main = 'index.css'
            return pkg
        },
    }

    try {
        return resolve.sync(`./${id}`, resolveOpts)
    } catch (_e) {
        try {
            return resolve.sync(id, resolveOpts)
        } catch (_e) {
            pathNotFound(id, paths, base)
        }
    }
}
