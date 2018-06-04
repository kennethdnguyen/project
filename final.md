Team Track2O
Kenneth Nguyen
Pardeep Singh
Zhaoshuo Bi
Jackie Chen

  Kenneth contributed to saving the user data to firebase and implementing the intro.js tutorial. Zhaoshuo contributed to filtering the emojis, turning the emojis on or off and the undo button to delete an emoji. Pardeep contributed to the CSS and styling of the app as well as taking the data from firebase and displaying it. Jackie contributed to the history page by using the google geocoding api to display the addresses of the marked locations on the map.
  
  server.js - This utilizes node.js to start our web app using files from the folder called static_files
  
  index.html - The single file contains the css styling for the homepage. It also contains the javascript code as well for the functionalities on the first page. The javascript code in this file is used for the intro.js tutorial. The javascript code also implements saving the emojis on the map to firebase as well as displaying them out again. Additionally, it implements the filtering functionality, turning the emojis on or off to show the heatmap, and an undo functionality to delete an emoji off the map.
  
  history.html - This file contains the css styling and the javascript code for the history page. The javascript code included in here uses the google geocoding api to convert all the saved coordinates on firebase into addresses and displays them out with their corresponding emojis. 
