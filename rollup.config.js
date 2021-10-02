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
    }
};

let plugins = {
    terser: terser({
        output: {comments: /^!/}
    }),
    babel: babel()
};

export default [
    {
        input: config.input,
        output: {...config.output, file: "dist/handy-scroll.es6.js", generatedCode: "es2015"}
    },
    {
        input: config.input,
        output: {...config.output, file: "dist/handy-scroll.es6.min.js", generatedCode: "es2015"},
        plugins: [plugins.terser]
    },
    {
        input: config.input,
        output: {...config.output, file: "dist/handy-scroll.js"},
        plugins: [plugins.babel]
    },
    {
        input: config.input,
        output: {...config.output, file: "dist/handy-scroll.min.js"},
        plugins: [plugins.babel, plugins.terser]
    }
];
