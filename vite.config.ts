import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	build: {
		lib: {
			entry: path.resolve(__dirname, 'src/index.ts'),
			name: 'Requestify',
			formats: ['es', 'cjs'],
			fileName: format => `index.${format}.js`
		},
		rollupOptions: {
			external: [], // можно указать внешние зависимости, если не хочешь их бандлить
			output: {
				exports: 'named'
			}
		},
		sourcemap: true,
		minify: true,
		emptyOutDir: true
	}
});
