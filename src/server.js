const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const { otoroshiMiddleware } = require('./oto');

const port = process.env.PORT || 8081;
const mode = process.env.MODE || 'dev';

const app = express();

const views = {};

function serveIndex(req, res) {
  const filePath = path.resolve('./src/views/index.html');
  let view = views[filePath];
  if (!view) {
    view = fs.readFileSync(filePath).toString('utf8');
  }
  view = view
    .replace('$jsurl', mode === 'prod' ? '/dist/client.min.js' : 'http://127.0.0.1:3001/client.js')
    .replace('$cssurl', mode === 'prod' ? '/dist/client.min.css' : 'http://127.0.0.1:3001/client.css');
  res.type('html').send(view);
}

app.use(bodyParser.json({ limit: '100mb' }));
app.use('/assets', express.static('assets'));
app.use('/dist', express.static('dist'));
app.use(otoroshiMiddleware());

app.get('/me', (req, res) => {
  res.status(200).send(req.token.user);
});
app.get('/index.html', serveIndex);
app.get('/*', serveIndex);

app.use((err, req, res, next) => {
  console.log(err)
  res.status(500).type('application/json').send({ error: `server error`, root: err });
});

app.listen(port, () => {
  console.log('app listening on http://0.0.0.0:' + port);
});

