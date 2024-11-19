require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const shortid = require('shortid');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// In-memory database to store URLs
const urlDatabase = {};

// API Endpoint to shorten URLs
app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;

  try {
    const urlObject = new URL(url); // Validate URL structure
    dns.lookup(urlObject.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

      const shortUrl = shortid.generate(); // Generate short URL ID
      urlDatabase[shortUrl] = url; // Save to database

      res.json({ original_url: url, short_url: shortUrl });
    });
  } catch (e) {
    res.json({ error: 'invalid url' });
  }
});

// API Endpoint to redirect to original URL
app.get('/api/shorturl/:shortUrl', (req, res) => {
  const { shortUrl } = req.params;

  const originalUrl = urlDatabase[shortUrl];
  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.status(404).json({ error: 'No short URL found for the given input' });
  }
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Start the server
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
