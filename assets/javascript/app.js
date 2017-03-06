$(document).ready(function() {
// =========
// APP STATE
// =========

  var appState;
      
  function resetAppState() {
    return {
      'phase': 'initialize', // possible phases: initialize, addNewUserTopic, topicSelected
      'selectedTopic': null, //from selected button for search
      'topicsArray': ['kitty','puppy', 'obama', 'joey tribbiani'],
      'currentGifArray': []
    };
  }

  function initializeApp() {
    appState = resetAppState();
    browser.refreshDisplay();
  }

// ===============
// FUNCTIONS/LOGIC
// ===============

  var selectedTopic = 'kitty'; //TODO get from user-input

  var queries = {
    // Vars for data
    'searchEndpoint': 'http://api.giphy.com/v1/gifs/search?',
    'numResults': '&limit=10',
    'apiKey': '&api_key=dc6zaTOxFJmzC', // put this at end of query

    processGiphyResponse: function(resultsArr) {
      appState.currentGifArray = []; // reset storage array to empty first
      for(var i = 0; i < resultsArr.length; i++) {
        var resultObject = {
          'id': resultsArr[i].id,
          'staticUrl': resultsArr[i].images.original_still.url,
          'animatedUrl': resultsArr[i].images.original.url, 
          'rating': resultsArr[i].rating,
          'state': 'static'
        };
        //reset gif array
        //append gifs for this topic
        appState.currentGifArray.push(resultObject);
      }
      //display the static url 
      browser.refreshDisplay();
    },

    //AJAX request to giphy API - return 10 objects
    sendGifRequest: function(topic) {
      // parameter q=xyz - search term
      var searchTerm = '&q=' + topic;
      var queryURL = this.searchEndpoint +searchTerm + this.numResults + this.apiKey;

      $.ajax({
        url: queryURL,
        method: 'GET'
      })
      .error(function() {
        console.log('ERROR: bad API call');
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

// ================
// EVENT MANAGEMENT
// ================

// user clicks topic button
// jquery event management so listener is added to buttons created in future too
$(document).on('click', '.topic-button', function() {
    console.log($(this).attr('data-name'));
    appState.selectedTopic = $(this).attr('data-name');
    queries.sendGifRequest(appState.selectedTopic);
    appState.phase = 'topicSelected';
});

// user clicks a gif
// call function to animate/static-ify the gif 
$(document).on('click', '.gif-image', function() {
  browser.playPauseGif($(this));
});

// last step
// get value from user input box in form
// trim response 

// ========
// DISPLAY
// ========

  var browser = {

    renderButtons: function(arr) {
      var buttonSection = $('.topic-button-section');
      buttonSection.empty(); //remake all buttons every time called 

      for(var i = 0; i < arr.length; i++){
        var newButton = $('<button></button>');
        newButton.html(arr[i]);
        newButton.addClass('topic-button');
        newButton.attr('data-name',arr[i]);
        buttonSection.append(newButton);
      }
    },

    renderGifs: function(array) {
      var gifSection = $('.gif-display-section');
      gifSection.empty(); //empty any previous gifs and replace not append

      for(var i = 0; i < array.length; i++){
        
        var newImage = $('<img>');
        newImage.attr('src',array[i].staticUrl);
        newImage.attr('data-id',array[i].id);
        newImage.addClass('gif-image');

        var newPar = $('<p></p>');
        newPar.html('Rating: ' + array[i].rating);
        newPar.addClass('gif-rating');

        var newDiv = $('<div></div>');
        newDiv.append(newImage).append(newPar);
        newDiv.addClass('gif');

        gifSection.append(newDiv);
      }
    },

    playPauseGif: function(gifImg){
      var idValue = gifImg.attr('data-id');
      // use grep fxn to search array for id
      // look up the id as a key in the gif array 
      var matchedById = $.grep(appState.
        currentGifArray, function(obj){ 
        return obj.id === idValue; // array of objects matching the criteria 
      });
      var gifObject = matchedById[0]; // only 1 object should match, unique ID. 
      
      // get its state
      if (gifObject.state === 'static'){
        gifImg.attr('src', gifObject.animatedUrl);
        gifObject.state = 'animated';
      } else {
        gifImg.attr('src', gifObject.staticUrl);
        gifObject.state = 'static';
      }
    },

    refreshDisplay: function() {
      switch(appState.phase) {
        case 'initialize':
          browser.renderButtons(appState.topicsArray);
          break;
        case 'addNewUserTopic':
          browser.renderButtons(appState.topicsArray);
          break;
        case 'topicSelected': 
          browser.renderGifs(appState.currentGifArray);
      }
    }

  };

// display gifs 
// should empty the section displaying them first so when user clicks  new button gifs are replaced not appended to previous
// first display as static 
// include a data-state = 'static' and the static/animated links. 
// change which is which with an if statement? 
// display gif ratings underneath

// last step
// add form to page
// refresh buttons displayed when user clicks submit button 

// =============
// INTIALIZE APP
// =============

  initializeApp();

});


//=====================================
// in order: 

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


//PHASES: 
// phase starts as initialize when initializeApp function called 
// phase is initialize until user clicks a topic button
// phase changed to 'topicSelected' in onclick for a topic button