import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/bundle.min.js',
    format: 'iife',
    sourcemap: true,
    plugins: [terser()],
  },
  plugins: [
    typescript({
      tsconfig: 'tsconfig.json',
    }),
  ],
};
