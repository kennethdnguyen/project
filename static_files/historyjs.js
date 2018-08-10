            // global variables 
            var photo;  //the emoji from the database
            var real_address;  // the address we reversed
            var latitude;   // location from the database
            var longitude;  // location from the database
            var index;  // index for our emoji array
            var emojiArr = [];  // the emoji array
            var len;   // the length of the array
            var latlng;
            // set up with the firebase
            var config = {
                apiKey: "AIzaSyCqsnk4ZFV7jtlCZ-l161iBo7BpQFJueA8",
                authDomain: "cogs121-4b110.firebaseapp.com",
                databaseURL: "https://cogs121-4b110.firebaseio.com",
                projectId: "cogs121-4b110",
                storageBucket: "cogs121-4b110.appspot.com",
                messagingSenderId: "398783944630"
            };
            firebase.initializeApp(config);
            var database; // our database on the cloud
            database = firebase.database();
            // the reference of our data on the cloud
            var ref = database.ref('clicks');
            ref.on('value', gotData, errData);
           
            // a hanging function to make sure geocode works
            function sleep(milliseconds) {
              var start = new Date().getTime();
              for (var i = 0; i < 1e7; i++) {
                if ((new Date().getTime() - start) > milliseconds){
                  break;
                }
              }
            }


            // get data from the firebase
            function gotData(data) {
                var clickData = data.val();
                var keys = Object.keys(clickData);
                len = keys.length;
                console.log(len);
                // for debug puporse
                console.log("printing keys");
                console.log(keys);
                var y = 0;
                 // use geocoder for reverse from latitude and longitude to real address
                var geocoder = new google.maps.Geocoder();
                
                // use a loop to convert the data
                for (index = 0; index < keys.length; index++) {
                    
                // var index = 0;
                // while (index < keys.length) {
                // for (index = 0; index < 1; index++) {
                    // since geocode api only allow 5 request per time. so we have a hanging time to make it work
                    if (index >= 5) {
                      sleep(2000);
                    }
                    // converting to the address.
                    console.log(index);
                    var k = keys[index];
                    latitude = clickData[k].lat;
                    longitude = clickData[k].lng;
                    photo = clickData[k].picture;
                    emojiArr.push(photo);
                    var latLng = {lat: clickData[k].lat, lng: clickData[k].lng};
                    // use geocoder api get the address
                    geocoder.geocode({'location': latLng}, function(results, status) {
                        if (status === 'OK') {
                          if (results[0]) {
                            addr = results[0].formatted_address;
                            console.log(addr);
                            testFunction(addr, y);
                            y++;
                          } 
                          else {
                            console.log('No results found');
                          }
                        } 
                        else {
                          console.log('Geocoder failed due to: ' + status);
                          sleep(2000);
                        }
                    });
                }
            }
            // if we cannot get the data from firebase, it calls this function
            function errData(err) {
                console.log('Error!');
                console.log(err);
            }
            // display the address and the emoji in their added order
            function testFunction(street, num) {
                console.log("num is" + num);
                console.log(len);
                var x = street;
                // display the address and the emoji that works with the emoji. 
                $('#test').append("<li>Address: " + x + "</li>" + "<img src=" + emojiArr[num] + ">" + "<hr>");
                if (num == len - 2) {
                    $('#loading').hide();
                }
            }
         