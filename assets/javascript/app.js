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

  var queries = {
    // Vars for data
    'searchEndpoint': 'http://api.giphy.com/v1/gifs/search?',
    'numResults': '&limit=10',
    'apiKey': '&api_key=dc6zaTOxFJmzC', // put this at end of query

    processGiphyResponse: function(resultsArr) {
      appState.currentGifArray = []; //empty gif array first
      for(var i = 0; i < resultsArr.length; i++) {
        var resultObject = {
          'id': resultsArr[i].id,
          'staticUrl': resultsArr[i].images.fixed_height_still.url,
          'animatedUrl': resultsArr[i].images.fixed_height.url, 
          'rating': resultsArr[i].rating,
          'state': 'static'
        };
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
    }, 

    addNewUserTopic: function(userInput){
      if(($.inArray(userInput, appState.topicsArray)) > 0){
        alert(userInput + ' was already added, try adding a new topic!');
      } else if(userInput === '') {
        alert('Please enter a topic with at least one letter!')
      } else { //if not already in topic array
        appState.topicsArray.push(userInput);
        appState.phase = 'addNewUserTopic'
        browser.refreshDisplay();
      }
    }

  };

// ================
// EVENT MANAGEMENT
// ================

// user clicks topic button
// jquery event management so listener is added to buttons created in future too
$(document).on('click', '.topic-button', function() {
    appState.selectedTopic = $(this).attr('data-name');
    queries.sendGifRequest(appState.selectedTopic);
    appState.phase = 'topicSelected';
});

// user clicks a gif image
// call function to animate/static-ify the gif 
$(document).on('click', '.gif-image', function() {
  browser.playPauseGif($(this));
});

$('.topic-form').on('submit', function(){
  event.preventDefault();
  var userInput = $('.topic-input').val().trim();
  queries.addNewUserTopic(userInput);
  //reset input to default placeholder/value
  $('.topic-form').trigger('reset');
});

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
        newButton.addClass('btn btn-default topic-button');
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

// =============
// INTIALIZE APP
// =============

  initializeApp();

});


//=====================================

//PHASES: 
// phase starts as initialize when initializeApp function called 
// phase is initialize until user clicks a topic button
// phase changed to 'topicSelected' in onclick for a topic button


// todo: 
// add a play all button? 
