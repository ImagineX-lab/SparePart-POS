const express = require('express');
const path = require('path');

require('./db'); // ensures schema + seed run before the server starts

const partsRoutes = require('./routes/parts');
const salesRoutes = require('./routes/sales');
const miscRoutes = require('./routes/misc');

let dataDir = __dirname;
if (process.versions && process.versions.electron) {
  try { dataDir = require('electron').app.getPath('userData'); } catch (e) {}
}

function createApp() {
  const app = express();

  app.use(express.json());

  app.use('/api/parts', partsRoutes);
  app.use('/api/sales', salesRoutes);
  app.use('/api', miscRoutes); // /api/settings, /api/dashboard, /api/reset
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/images', express.static(path.join(dataDir, 'data', 'images'))); // kept for existing image_path values
  app.use('/data/images', express.static(path.join(dataDir, 'data', 'images'))); // explicit route per spec


  app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong on the server' });
  });

  return app;
}

module.exports = { createApp };

// Only auto-start a listening server when this file is run directly
// (`node server.js` / `npm start`). When required by the Electron main
// process, createApp() is used instead so Electron controls the port.
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`KN Motors POS running at http://localhost:${PORT}`);
  });
}
