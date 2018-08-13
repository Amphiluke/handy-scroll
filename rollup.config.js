import pkg from "./package.json";
import babel from "rollup-plugin-babel";
import {terser} from "rollup-plugin-terser";

let config = {
    input: "src/handy-scroll.js",
    output: {
        format: "umd",
        name: "handyScroll",
        banner: `/*!
${pkg.name} v${pkg.version}
${pkg.homepage}
(c) ${new Date().getUTCFullYear()} ${pkg.author}
*/`
    },
    plugins: [
        terser({
            output: {comments: /^!/}
        })
    ]
};

export default [
    {
        input: config.input,
        output: Object.assign({file: "dist/handy-scroll.es6.js"}, config.output)
    },
    {
        input: config.input,
        output: Object.assign({file: "dist/handy-scroll.es6.min.js"}, config.output),
        plugins: config.plugins
    },
    {
        input: config.input,
        output: Object.assign({file: "dist/handy-scroll.js"}, config.output),
        plugins: [babel()]
    },
    {
        input: config.input,
        output: Object.assign({file: "dist/handy-scroll.min.js"}, config.output),
        plugins: [babel()].concat(config.plugins)
    }
];
