const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.use('*', (req, res) => {
    res.status(404).redirect('/');
})

app.set('port', process.env.PORT || 8080);
const server = app.listen(app.get('port'), () => {
    console.log('Server port: ' + server.address().port);
});