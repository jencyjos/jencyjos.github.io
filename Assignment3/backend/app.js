const express = require('express');
const app = express();
const port = 3000;  // You can choose any port that's free on your system

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});