
const fs = require('fs');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const CWD_PATH = fs.realpathSync(process.cwd());
const buildPath = process.env.BUILD_PATH || 'build';
const resolveApp = relativePath => path.resolve(CWD_PATH, relativePath);
const OUTPUT_PATH = resolveApp(buildPath);

const NODE_MODULES_PATH = path.join(CWD_PATH, 'node_modules');
const WASM_PATH = path.join(NODE_MODULES_PATH, 'wasm-themis/src/libthemis.wasm');
const SCRIPTS_PATH = path.join(OUTPUT_PATH, 'static/js/');

module.exports = function override(config, env) {
    if (!config.plugins) {
        config.plugins = [];
    }

    config.plugins.push(
        new CopyWebpackPlugin({ patterns: [{ from: WASM_PATH, to: SCRIPTS_PATH }] })
    );

    config['resolve']['fallback'] = {
        crypto: false,
        fs: false,
        http: false,
        https: false,
        net: false,
        path: false,
        stream: false,
        tls: false,
        util: false,
        url: false,
        zlib: false,
    }

    return config;
}