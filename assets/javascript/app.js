// =========
// APP STATE
// =========

var appState;
    
function resetAppState() {
  return {
    'selectedTopic': null, //from selected button for search
    'topics': ['kitty','puppy', 'obama', 'joey tribbiani']
  };
}

function initializeApp() {
  appState = resetAppState();
}

// ===============
// FUNCTIONS/LOGIC
// ===============

  var selectedTopic = "kitty"; //TODO get from user-input

  var queries = {
    // Vars for data
    'searchEndpoint': 'http://api.giphy.com/v1/gifs/search?',
    'numResults': '&limit=10',
    'apiKey': '&api_key=dc6zaTOxFJmzC', // put this at end of query

    processGiphyResponse: function(resultsArr) {
      for(var i = 0; i < resultsArr.length; i++) {
        var resultObject = {
          'id': resultsArr[i].id,
          'staticUrl': resultsArr[i].images.fixed_height_still.url,
          'animatedUrl': resultsArr[i].images.original.url, 
          'rating': resultsArr[i].rating 
        };
        console.log(resultObject);
      }
      //display the static url 
    },

    //AJAX request to giphy API - return 10 objects
    getGifs: function(topic) {
      // parameter q=xyz - search term
      var searchTerm = '&q=' + topic;
      var queryURL = this.searchEndpoint +searchTerm + this.numResults + this.apiKey;

      $.ajax({
        url: queryURL,
        method: "GET"
      })
      .error(function() {
        console.log("ERROR: bad API call");
      })
      .done(function(response){
        let resultsArray = response.data; //array of objects (each a gif)
        queries.processGiphyResponse(resultsArray);
      });
    }

  };

  // last step
  // add user form value to topics array 
  // call refresh display to refresh the buttons

$(document).ready(function() {

// ================
// EVENT MANAGEMENT
// ================

// user clicks topic button
// call fxn to make ajax request and get the gifs
// call function to display/refresh the gifs displayed

// user clicks a gif
// call function to animate/static-ify the gif 

// last step
// get value from user input box in form
// trim response 

// ========
// DISPLAY
// ========

  var browser = {

    renderButtons: function(arr) {
      var buttonSection = $('.gif-button-section');
      buttonSection.empty(); //remake all buttons every time called 

      for(var i = 0; i < arr.length; i++){
        var newButton = $("<button></button>");
        newButton.html(arr[i]);
        newButton.addClass('gif-button');
        newButton.attr('data-name',arr[i]);
        buttonSection.append(newButton);
      }
    }

  };

// display gifs 
// should empty the section displaying them first so when user clicks  new button gifs are replaced not appended to previous
// first display as static 
// include a data-state = "static" and the static/animated links. 
// change which is which with an if statement? 
// display gif ratings underneath

// last step
// add form to page
// refresh buttons displayed when user clicks submit button 

// =============
// INTIALIZE APP
// =============

  initializeApp();
  queries.getGifs(selectedTopic);
  browser.renderButtons(appState.topics);

});


//=====================================
// in order: 

// array of button topics
// dynamically create buttons on page load 
// button for each topic in array
// text should be the topic
// FOR LOOP

// user clicks button
// AJAX request to giphy API 
  // api key
// get 10 static non-animated images and display them
  // q parameter
  // limit parameter
// if user clicks another button, the gifs should get replaced, don't just keep appending more gifs 
// display gif ratings underneath
  // rating parameter
// when user clicks gif image, animate the gif. 
// if user clicks again, stop playing and be static again. 

// last step
// add form to page
// get value from user input box
// add it to topics array
// remake the buttons on the page, including that new topic 

