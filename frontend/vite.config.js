import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: ['.emergentagent.com', 'localhost', '127.0.0.1'],
    cors: true
  },
  // Library build configuration
  build: {
    lib: {
      entry: resolve(__dirname, 'src/lib/index.js'),
      name: 'MicroserviceGraph',
      fileName: (format) => `microservice-graph.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
})
