const express = require('express');
const app = express();

app.use(express.static('static_files'));

const fakeDatabase = {
  'Chill': {locations: 'Library Walk, Sun God Lawn, Revelle Fountain'},
  'Food': {locations: 'Taco Villa, 64 North'},
  'Study': {locations: 'Biomedical Library, Geisel Library'}
};


//const fakeDatabase2 = [
//  {
//    "name": 'Chill': {locations: 'Library Walk, Sun God Lawn, Revelle Fountain'}
//  },
//  {
//    "name": 'Food': {locations: 'Taco Villa, 64 North'}
//  },
//  {
//    "name": 'Study': {locations: 'Biomedical Library, Geisel Library'}
//  }


function myFunction(arr)
{
  var out = "";
  var i;
  for (i=0; i <arr.length; i++) {
    out = arr[i].display;
  }
  document.getElementById("id01").innerHTML = out;
}



app.get('/users/:userid', (req, res) => {
  const nameToLookup = req.params.userid; // matches ':userid' above
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
