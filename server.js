const express = require('express');
const app = express();

app.use(express.static('static_files'));

const fakeDatabase = {
  'Chill': {name: 'Chill', locations: 'Library Walk, Sun God Lawn, Revelle Fountain'},
  'Food': {name: 'Food', locations: 'Taco Villa, 64 North'},
  'Study': {name: 'Study', locations: 'Biomedical Library, Geisel Library'}
};

app.get('/:hashtags', (req, res) => {
  const nameToLookup = req.params.hashtags; // matches any of the hashtags from above
  const val = fakeDatabase[nameToLookup];
  console.log(nameToLookup, '->', val); // for debugging
  if (val) {
    res.send(val);
  } else {
    res.send({}); // failed, so return an empty object instead of undefined
  }
});

// start the server at URL: http://localhost:3000/
app.listen(3000, () => {
  console.log('Server started at http://localhost:3000/');
});
