
    
    // Reference to Firebase database.
    var firebase = new Firebase('https://cogs121-4b110.firebaseio.com');
    //Data object to be written to Firebase.
    var data = {
      sender: null,
      timestamp: null,
      lat: null,
      lng: null,
      picture: null
    };
    //The display setting for the google map window
    function makeInfoBox(controlDiv, map) {
      // Set CSS for the control border.
      var controlUI = document.createElement('div');
      controlUI.style.boxShadow = 'rgba(0, 0, 0, 0.298039) 0px 1px 4px -1px';
      controlUI.style.backgroundColor = '#fff';
      controlUI.style.border = '2px solid #fff';
      controlUI.style.borderRadius = '2px';
      controlUI.style.marginBottom = '22px';
      controlUI.style.marginTop = '10px';
      controlUI.style.textAlign = 'center';
      controlDiv.appendChild(controlUI);
      // Set CSS for the control interior.
      var controlText = document.createElement('div');
      controlText.style.color = 'rgb(25,25,25)';
      controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
      controlText.style.fontSize = '100%';
      controlText.style.padding = '6px';
      controlText.textContent = 'The map shows all clicks made in the last week.';
      controlUI.appendChild(controlText);
    }
    /**
     * Starting point for running the program. Authenticates the user.
     * @param {function()} onAuthSuccess - Called when authentication succeeds.
     */
    function initAuthentication(onAuthSuccess) {
      firebase.authAnonymously(function(error, authData) {
        // if (error) {
        // console.log('Login Failed!', error);
        // } else {
        // data.sender = authData.uid;
        // onAuthSuccess();
        // }
        onAuthSuccess();
      }, { remember: 'sessionOnly' }); // Users will get a new id for every session.
    }
    // Global variables
    var gmarkers = [];  // a empty array for storeing the accident clicks on map (without click emoji first)
    var emoji_to_use = 'none';  // used to compare if the emoji is selected
    var map;  //The google map variable 
    var emoji_marker;  // the emoji makter that we draw data from database and display on the map
    var num_length;   // the key length of the data on the database
    var using_filter = false; // check if user clicked the filter or not
    var first_call = true;  // check if this is the first time loading data from the cloud
    var temp_data;  // a tempoary variable that contains a copy of the click data of the users
    var temp_key;   // a tempoary variable that contains a copy of the data key in the cloud
    var emoji_array = [];  // main array for holding all emojis
    var undo_control = false; // used to make sure user are not use the undo button delete more than one variable


    /**
     * Creates a map object with a click listener and a heatmap.
     */
    function initMap() {
      map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 32.8777, lng: -117.2372 },
        zoom: 15,
        disableDoubleClickZoom: true,
        streetViewControl: false,
      });
      // Create the DIV to hold the control and call the makeInfoBox() constructor
      // passing in this DIV.
      var infoBoxDiv = document.createElement('div');
      makeInfoBox(infoBoxDiv, map);
      map.controls[google.maps.ControlPosition.TOP_CENTER].push(infoBoxDiv);
      // Listen for clicks and add the location of the click to firebase.
      map.addListener('click', function(e) {
        placeMarker(e.latLng, map);
        data.lat = e.latLng.lat();
        data.lng = e.latLng.lng();
        data.picture = emoji_to_use;
        addToFirebase(data);
      });
      // Create a heatmap.
      var heatmap = new google.maps.visualization.HeatmapLayer({
        data: [],
        map: map,
        radius: 16
      });
      initAuthentication(initFirebase.bind(undefined, heatmap));
    }
    // add emoji as marker on the map
    function placeMarker(latLng, map) {
      console.log(emoji_to_use);
      var marker = new google.maps.Marker({
        position: latLng,
        map: map,
        icon: emoji_to_use
      });
  	  // a debug message to make sure this line works
      console.log("Placing marker here");
      emoji_array.push(marker);
      marker.setVisible(true);
      // set the undo-control to true so user won't delete more data
    	undo_control = true;
      // if user didn't click emoji first when they are clicking on the map, 
      // the clicks will not shows.
    	if(emoji_to_use == 'none'){ 
        	gmarkers.push(marker);
    		removeMarkers;
    	}
    }
    // the function that remove markers which has no emoji clicked
    function removeMarkers(){
      for(i=0; i<gmarkers.length; i++){
          gmarkers[i].setMap(null);
      }
    }
    // this function will make sure the filter set off
    function unfilter() {
      var drop_property = document.getElementById("toggle");
     for (var i = 0; i < emoji_array.length; i++) {
        emoji_array[i].setVisible(true);
      }
      using_filter = false;
      // change the text color when toggle off
  	  drop_property.style.backgroundColor = "#C0C0C0";
  	  drop_property.style.color = "black";
    }
    // this function makes sure filter works
    function filter(emoji) {
      var drop_property = document.getElementById("toggle");
    // change the text color when toggle on
    	drop_property.style.backgroundColor = "#52B456";
    	drop_property.style.color = "white";
      var change = document.getElementById("toggle");
      if (change.innerHTML == "Filter OFF"){
        change.innerHTML = "Filter ON";
      }
      if (using_filter) {
        unfilter();
      }
      // for different filter options
      switch (emoji) {
        case "burger":
          icon_name = "burger.png";
          break;
        case "book":
          icon_name = "book.png";
          break;
        case "running":
          icon_name = "running.png";
          break;
        case "gym":
          icon_name = "gym.png";
          break;
        case "sleep":
          icon_name = "sleep.png";
          break;
        case "music":
          icon_name = "music.png";
          break;
        default:
          icon_name = "ERROR";
          console.log("Error in filtering");
          // should throw error here
      }
      var filteredEmojis = emoji_array.filter(function(marker){
        return marker.icon != icon_name;
      });
      // set all other emojis to not visible
      for (var i = 0; i < filteredEmojis.length; i++) {
        filteredEmojis[i].setVisible(false);
      }
      using_filter = true;
    }
    /**
     * Set up a Firebase with deletion on clicks older than expirySeconds
     * @param {!google.maps.visualization.HeatmapLayer} heatmap The heatmap to
     * which points are added from Firebase.
     */
    function initFirebase(heatmap) {
      // 10 minutes before current time.
      var startTime = new Date().getTime() - (60 * 10080 * 1000);
      // Reference to the clicks in Firebase.
      var clicks = firebase.child('clicks');
      // Listener for when a click is added.
      clicks.orderByChild('timestamp').startAt(startTime).on('child_added',
        function(snapshot) {
        // Get that click from firebase.
        var newPosition = snapshot.val();
        var point = new google.maps.LatLng(newPosition.lat, newPosition.lng);
        var elapsed = new Date().getTime() - newPosition.timestamp;
        // Add the point to  the heatmap.
        heatmap.getData().push(point);
        // Requests entries older than expiry time (10 minutes).
        var expirySeconds = Math.max(60 * 10080 * 1000 - elapsed, 0);
        // Set client timeout to remove the point after a certain time.
        window.setTimeout(function() {
          // Delete the old point from the database.
          snapshot.ref().remove();
          }, expirySeconds);
        }
      );
        // Remove old data from the heatmap when a point is removed from firebase.
        clicks.on('child_removed', function(snapshot, prevChildKey) {
        var heatmapData = heatmap.getData();
        var i = 0;
        while (snapshot.val().lat != heatmapData.getAt(i).lat() ||
          snapshot.val().lng != heatmapData.getAt(i).lng()) {
          i++;
        }
        heatmapData.removeAt(i);
      });
    }
    /**
     * Updates the last_message/ path with the current timestamp.
     * @param {function(Date)} addClick After the last message timestamp has been updated,
     *     this function is called with the current timestamp to add the
     *     click to the firebase.
     */
    function getTimestamp(addClick) {
      // Reference to location for saving the last click time.
      var ref = firebase.child('last_message/' + data.sender);
      ref.onDisconnect().remove(); // Delete reference from firebase on disconnect.
      // Set value to timestamp.
      ref.set(Firebase.ServerValue.TIMESTAMP, function(err) {
        if (err) { // Write to last message was unsuccessful.
          // console.log(err);
        }
        else { // Write to last message was successful.
          ref.once('value', function(snap) {
          addClick(snap.val()); // Add click with same timestamp.
          }, function(err) {
          // console.warn(err);
          });
        }
      });
    }
    /**
     * Adds a click to firebase.
     * @param {Object} data The data to be added to firebase.
     *     It contains the lat, lng, sender, and the emoji selected and timestamp.
     */
    function addToFirebase(data) {
      getTimestamp(function(timestamp) {
        // Add the new timestamp to the record data.
        data.timestamp = timestamp;
        var ref = firebase.child('clicks').push(data, function(err) {
          if (err) { // Data was not written to firebase.
            // console.warn(err);
          }
        });
      });
    }
    // all these functions will assign different emoji to "emoji_to_use"
    function markBookEmoji() {
      console.log("Book Emoji was clicked on");
      emoji_to_use = 'book.png';
    }
    function markBurgerEmoji() {
      console.log("Burger Emoji was clicked on");
      emoji_to_use = 'burger.png';
    }
    function markRunningEmoji() {
      console.log("Book Emoji was clicked on");
      emoji_to_use = 'running.png';
    }
    function markGymEmoji() {
      console.log("Book Emoji was clicked on");
      emoji_to_use = 'gym.png';
    }
    function markSleepEmoji() {
      console.log("Book Emoji was clicked on");
      emoji_to_use = 'sleep.png';
    }
    function markMusicEmoji() {
      console.log("Book Emoji was clicked on");
      emoji_to_use = 'music.png';
    }
    var working = firebase.child('clicks');
    working.on('value', gotData, errData);
    // we use it to delete/undo the last step while user accidently added a emoji in wrong place
    function deleteEmoji() {
  	  if(undo_control == true){
        working.once('value', (snapshot) => {
        const ourData = snapshot.val();
        console.log('You received some data!', ourData);
        const ourKeys = Object.keys(ourData);
        var lastIndex = ourKeys.length - 1;
        var k = ourKeys[lastIndex];
        working.child(k).remove();
        emoji_array[lastIndex].setVisible(false);
        emoji_array.pop();
        });
        // set the control to false so user will not keep deleting
    	  undo_control = false;
  	  }
      // display worning data
    	else{
    		alert("You don't have any emoji to delete");
    	}
    }
    // get data from cloud and display on the map
    function gotData(data) {
      if (!first_call) {
        return 0;
      }
      console.log("getting data");
      // variables for location and emoji that stored in database
      var latitude;
      var longitude;
      var emoji;
      var clickData = data.val();
      temp_data = clickData;
      var keys = Object.keys(clickData);
      // temp key is a temp variable that holds keys and be used in all filter functions.
      temp_key = keys;
      // console.log(keys);
      num_length = keys.length;
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        latitude = clickData[k].lat;
        longitude = clickData[k].lng;
        emoji = clickData[k].picture;
        //console.log(latitude, longitude);
        var location_to_mark = new google.maps.LatLng(latitude, longitude);
        emoji_marker = new google.maps.Marker({
          position: location_to_mark,
          map: map,
          icon: emoji
        });
        // assign emoji_marker to the emoji array which we are using in filter.
        emoji_array[i] = emoji_marker;
        emoji_marker.setVisible(true);
        //console.log(emoji_array[i]);
      }
      first_call = false;
    }
    // debug function
    function errData(err) {
      console.log('Error!');
      console.log(err);
    }

   
    /* When the user clicks on the button,
    toggle between hiding and showing the dropdown content */
    function myFunction() {
      var change = document.getElementById("toggle");
      if (change.innerHTML == "Filter ON"){ 
        change.innerHTML = "Filter OFF";
        unfilter()
      }
      else{ 
        document.getElementById("myDropdown").classList.toggle("show");
      }
    }
    // function that hide the emoji and show the heatmap only
    function hide_emoji(){
      // used to change the html style
      var property = document.getElementById("hide");
      var change = document.getElementById("hide");
      if (change.innerHTML == "Emoji ON"){
    	  property.style.backgroundColor = "#C0C0C0";
    	  property.style.color = "black";
        change.innerHTML = "Emoji OFF";
        for (var i = 0; i < emoji_array.length; i++) {
          emoji_array[i].setVisible(false);
        }
      }
      else{
        change.innerHTML = "Emoji ON";
      	property.style.backgroundColor = "#52B456";
      	property.style.color = "white";
        for (var i = 0; i < emoji_array.length; i++) {
          emoji_array[i].setVisible(true);
        }
      }
    }
    // Close the dropdown if the user clicks outside of it
    window.onclick = function(event) {
      if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
          var openDropdown = dropdowns[i];
          if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
          }
        }
      }
    }
    // the tutorial function
    function startIntro() {
      introJs().start().oncomplete(function() {
      introJs().exit();
      }).onexit(function() {
      introJs().exit();
      })
    }