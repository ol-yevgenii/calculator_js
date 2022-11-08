const pluginFactory = require('./lib');

module.exports = (options) => {
    const plugin = pluginFactory(options);
    return {
        postcssPlugin: 'postcss-import-sync',
        Once: plugin
    }
}
module.exports.postcss = true;
