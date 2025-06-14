// Use ES module imports and __dirname workaround for ESM
import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { execSync } from 'child_process';
import cors from 'cors';

// Import endpoint definitions directly
import { lambdaEndpointDefinitions } from './lib/services/lambda/lambda-endpoint-definitions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Enable CORS for all routes
app.use(cors());

// Compile lambda-endpoint-definitions.ts to JS before starting the server
try {
  execSync('npx tsc lib/services/lambda/lambda-endpoint-definitions.ts --module NodeNext --target ES2022 --outDir lib/services/lambda', { stdio: 'inherit' });
} catch (e) {
  console.error('Failed to compile lambda-endpoint-definitions.ts:', e);
  process.exit(1);
}

// Serve the micro-frontend.html at / and /ui
app.get(['/', '/ui'], (req, res) => {
  res.sendFile(path.join(__dirname, 'micro-frontend.html'));
});

// Proxy /api and all other non-UI requests to backend on 3001
app.use(
  '/api',
  createProxyMiddleware({
    target: 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
    onProxyRes: (proxyRes, req, res) => {
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
    }
  })
);

app.use((req, res, next) => {
  // Allow /lambda-endpoints.json to fall through to the correct handler
  if (
    req.path === '/' ||
    req.path === '/ui' ||
    req.path === '/micro-frontend.html' ||
    req.path === '/lambda-endpoints.json'
  ) return next();
  createProxyMiddleware({
    target: 'http://localhost:3001',
    changeOrigin: true,
    onProxyRes: (proxyRes, req, res) => {
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
    }
  })(req, res, next);
});

// Serve endpoint definitions as JSON for the UI to fetch
app.get('/lambda-endpoints.json', (req, res) => {
  // Only send the fields needed by the UI
  res.json(lambdaEndpointDefinitions.map(({ name, path, method, description, handler }) => ({ name, path, method, description, handler })));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Micro Frontend UI: http://localhost:${PORT}/ui`);
  console.log(`Backend/API proxied to http://localhost:3001`);
});
