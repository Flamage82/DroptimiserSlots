/// <reference types="vitest" />
import eslintPlugin from '@nabla/vite-plugin-eslint'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import type { UserConfig } from 'vite'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import tsconfigPaths from 'vite-tsconfig-paths'

const HTTPS_PORT = 443

export default defineConfig(({ mode }) => {
	const config: UserConfig = {
		test: {
			css: false,
			include: ['src/**/__tests__/*'],
			globals: true,
			environment: 'jsdom',
			setupFiles: 'src/setupTests.ts',
			clearMocks: true
			// coverage: {
			// 	include: ['src/**/*'],
			// 	exclude: ['src/main.tsx'],
			// 	thresholds: {
			// 		'100': true
			// 	},
			// 	provider: 'istanbul',
			// 	enabled: true,
			// 	reporter: ['text', 'lcov'],
			// 	reportsDirectory: 'coverage'
			// }
		},
		plugins: [
			tsconfigPaths(),
			react(),
			...(mode === 'test'
				? []
				: [
						eslintPlugin(),
						VitePWA({
							registerType: 'autoUpdate',
							includeAssets: [
								'favicon.png',
								'robots.txt',
								'apple-touch-icon.png',
								'icons/*.svg',
								'fonts/*.woff2'
							],
							manifest: {
								theme_color: '#BD34FE',
								icons: [
									{
										src: '/android-chrome-192x192.png',
										sizes: '192x192',
										type: 'image/png',
										purpose: 'any maskable'
									},
									{
										src: '/android-chrome-512x512.png',
										sizes: '512x512',
										type: 'image/png'
									}
								]
							}
						})
					])
		]
	}

	if (!process.env.CI) {
		const environment = loadEnv('development', process.cwd(), '')
		const key = environment.SSL_KEY_FILE
		const cert = environment.SSL_CRT_FILE
		config.server = {
			port: HTTPS_PORT,
			https: {
				key: readFileSync(key),
				cert: readFileSync(cert)
			}
		}
	}

	return config
})
