import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import { sync as globSync } from 'glob';
import path from 'path';
import json from '@rollup/plugin-json';
import polyfillNode from 'rollup-plugin-polyfill-node';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateEntryPoints = (pattern, format) => {
    const files = globSync(pattern, { absolute: true });
    console.log('Matched files:', files);
    return files.map(file => ({
        input: file,
        output: {
            file: `dist/${path.basename(file)}`,
            format: format,
            name: path.basename(file, path.extname(file))
        },
        plugins: [
            resolve(),
            commonjs(),
            json(),
            babel({ babelHelpers: 'bundled' }),
            terser(),
            postcss({
                extract: true,
                minimize: true,
            }),
            polyfillNode(), // Adding the polyfillNode plugin to handle Node.js built-ins
        ]
    }));
};

const jsEntries = generateEntryPoints(path.join(__dirname, 'js/*.js'), 'iife');
const cssEntries = generateEntryPoints(path.join(__dirname, 'css/*.css'), 'es');

export default [...jsEntries, ...cssEntries];
