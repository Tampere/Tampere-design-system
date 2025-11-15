import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import pkg from './package.json' with { type: 'json' };
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import replace from 'rollup-plugin-replace';
import { vanillaExtractPlugin } from '@vanilla-extract/rollup-plugin';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    vanillaExtractPlugin(),
    peerDepsExternal(),
    resolve(),
    commonjs({
      defaultIsModuleExports: true,
    }),
    json(),
    replace({
      preventAssignment: true,
      include: ['node_modules/**', 'src/**'],
      values: {
        'use client;': '',
      },
    }),
    typescript({ tsconfig: './tsconfig.json' }),
    postcss({ minimize: true, sourceMap: true }),
    terser(),
  ],
  external: ['react', 'react-dom'],
};
