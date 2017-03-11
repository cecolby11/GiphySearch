$(document).ready(function() {
// =========
// APP STATE
// =========
  
  /* var to hold app state once app is initialized */
  var appState;
      
  /**
    * This function is called on intialization and returns the functions and variables related to the state (e.g. phase, gif topics, etc.) as an object to be stored in a variable. 
  */
  function resetAppState() {
    return {
      'phase': 'initialize', // possible phases: initialize, addNewUserTopic, removeUserTopic, topicSelected
      'selectedTopic': null, //from selected button, used to make API request
      'topicsArray': ['tom hanks','beyonce', 'cookie monster', 'herb brooks', 'oprah winfrey', 'richard hendricks', 'erlich bachman', 'betty white'],
      'currentGifArray': [],
      'userInput': null,
      'removeButtonId': null,
      'nameToRemove': null, 
    };
  }

  /**
    * This function initializes the app by refreshing app data and display. Called on document load. 
  */
  function initializeApp() {
    appState = resetAppState();
    browser.refreshDisplay();
  }

// ===============
// FUNCTIONS/LOGIC
// ===============
  
  /* object for all vars/fxns related to API queries/responses and storing API query topics/terms */
  var queries = {
    /* Vars for Giphy API request */
    'searchEndpoint': 'https://api.giphy.com/v1/gifs/search?',
    'numResults': '&limit=10',
    'rating': '&rating=pg', // only get results that are PG or safer
    'apiKey': '&api_key=dc6zaTOxFJmzC', // include at query url end

    /**
    * This function processes unprocessed gif-objects from the giphy API hit. It extracts & stores the relevant information (e.g. staticURL, animatedURL) in a new object which is appended to the 'currentGifArray' in appState. 
    * @param {array} resultsArr - an array of 10 gif-objects extracted from the response-object. each contains ALL information related to that gif. 
    */
    processGiphyResponse: function(resultsArr) {
      appState.currentGifArray = []; //empty the gif array first
      for(var i = 0; i < resultsArr.length; i++) {
        var resultObject = {
          'id': resultsArr[i].id,
          'staticUrl': resultsArr[i].images.fixed_height_still.url,
          'animatedUrl': resultsArr[i].images.fixed_height.url, 
          'rating': resultsArr[i].rating,
          'state': 'static'
        };
        appState.currentGifArray.push(resultObject);
      }
      //to display the static url 
      appState.phase = 'topicSelected';
      browser.refreshDisplay();
    },

    /**
    * This function makes the ajax request to the Giphy API, and from the resonse extracts and stores the array of 10 gif-objects for later processing. 
    * @param {string} topic - the search topic, as designated by user interaction, (q=topic) to be used in the Giphy API query. 
    */
    sendGifRequest: function(topic) {
      // parameter q=xyz - search term
      var searchTerm = '&q=' + topic;
      var queryURL = this.searchEndpoint + searchTerm + this.numResults + this.rating + this.apiKey;

      $.ajax({
        url: queryURL,
        method: 'GET'
      })
      .error(function() {
        alert('Hmm, that didn\'t work. We seem to be having a problem on our end. Sorry to keep you waiting!');
      })
      .done(function(response){
        let resultsArray = response.data; //array of 10 objects (each with a gif's complete information)
        queries.processGiphyResponse(resultsArray);
      });
    }, 

    /**
    * This function appends a new item ('topic') to the appState.topicsArray if it does not already exist in the array (in lowercase form)
    * @param {string} userInput - the new topic to check/include 
    */
    addNewUserTopic: function(userInput){
      if(($.inArray(userInput, appState.topicsArray)) >= 0){ //returns an index, so if >= 0 it's in the array. -1 if not. 
        alert(userInput + ' was already added, try adding a new topic!');
      } else if(userInput === '') {
        alert('Please enter a topic with at least one letter!')
      } else { //else if not already in topic array
        appState.topicsArray.push(userInput);
        appState.phase = 'addNewUserTopic';
        browser.refreshDisplay();
      }
    },  

    /**
    * This function removes a specified topic item from the appState.topicsArray 
    * @param {string} topicToRemove - the topic to find/remove
    */
    removeUserTopic: function(topicToRemove) {
      var indexOfTopic = appState.topicsArray.indexOf(topicToRemove);
      // to first show removal alert for that topic
      appState.phase = 'removeUserTopic';
      browser.refreshDisplay();
      // then remove 1 element from array at that index
      appState.topicsArray.splice(indexOfTopic,1);
    }

  };

// ========
// DISPLAY
// ========

  /* object for all vars/fxns related to browser layout/display */
  var browser = {

    /**
    * This function renders a button for each item in an array of strings (the appState.topicArray of query topics) and sets the button text to that array item's text. 
    * It renders a second (remove) button for each text-button and stores and stores a matching id-number in the attributes of each button pair. 
    * @param {array} arr - an array of strings to render buttons for. 
    */
    renderButtons: function(arr) {
      var buttonSection = $('.topic-button-section');
      buttonSection.empty(); //remake all buttons every time called 
      for(var i = 0; i < arr.length; i++){
        var formattedWord = browser.formatCapitalization(arr[i]);
        var newButton = $('<button>');
        newButton.html(formattedWord);
        newButton.addClass('btn btn-default topic-button');
        newButton.attr('data-name',arr[i]);
        newButton.attr('id', 'button-'+i);

        var removeButton = $('<button class=\'btn btn-default\'><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>');
        removeButton.attr('data-id-num', i);
        removeButton.addClass('remove-button');

        var newDiv = $('<div class=\'btn-group\'></div>');
        newDiv.append(newButton).append(removeButton);
        buttonSection.append(newDiv);
      }
    },

    /**
    * This function adds title-case to every word (separated by spaces) in a string. Makes it possible to store all topics/user inputs as lowercase in order to easily check/prevent duplicates being added by a user, but allows/standardizes title-case for display. 
    * @param {string} word - a topic/word, usually lowercased. 
    */
    formatCapitalization: function(word){
        var splitBySpaces = word.split(' ');
        var resultingWord = [];
        for(var i = 0; i < splitBySpaces.length; i++){
          var capFirst = splitBySpaces[i].charAt(0).toUpperCase();
          var lowerRest = splitBySpaces[i].slice(1);
          var name = capFirst + lowerRest;
          resultingWord.push(name);
        }
        var combined = resultingWord.join(' ');
        return combined;
    },

    /**
    * This function renders a gif (static) image and displays its rating for each gif-object in an array 
    * @param {array} array - an array of gif-objects (the appState.currentGifArray containing the relevant links/info for each gif returned from the Giphy query)
    */
    renderGifs: function(array) {
      var gifSection = $('.gif-display-section');
      gifSection.empty(); //empty any previous gifs displayed so it's possible to replace all gifs not append more gifs. 
      for(var i = 0; i < array.length; i++){
        
        var newImage = $('<img>');
        newImage.attr('src',array[i].staticUrl);
        newImage.attr('data-id',array[i].id);
        newImage.addClass('gif-image');

        var newPar = $('<p></p>');
        newPar.html('Rating: ' + array[i].rating.toUpperCase());
        newPar.addClass('gif-rating');

        var newDiv = $('<div></div>');
        newDiv.append(newImage).append(newPar);
        newDiv.addClass('gif');

        gifSection.append(newDiv);
      }

      browser.renderGifHeading();
    },

    /**
    * This function reveals a page-header with instructons for playing and pausing gifs by removing its bootstrap hidden class. Called once gifs are rendered on the page. 
    */
    renderGifHeading: function() {
      $('.gif-instruction').removeClass('hidden');
    },

    /**
    * This function plays or pauses a particular rendered gif. 
    * First, looks up a gif-image's id attr in the appState.currentGifArray and finds the corresponding gif object 
    * Second, checks the value (static or animated) of that object's state property
    * Third, updates the img src to the static or animated giphy url depending on its state value.  
    * @param {<img>} gifImg - a particular gif image rendered on the page 
    */
    playPauseGif: function(gifImg){
      // get its id 
      var idValue = gifImg.attr('data-id');
      // use grep fxn to search array for id
      // look up the id as a key in the gif array 
      var matchedById = $.grep(appState.
        currentGifArray, function(obj){ 
        return obj.id === idValue; // grep returns array of objects matching the criteria 
      });
      var gifObject = matchedById[0]; // only 1 object should match, because the ID is unique. 
      
      // get its state
      if (gifObject.state === 'static'){
        gifImg.attr('src', gifObject.animatedUrl);
        gifObject.state = 'animated';
      } else {
        gifImg.attr('src', gifObject.staticUrl);
        gifObject.state = 'static';
      }
    },

    /**
    * When a user adds a new topic button, this function displays an alert on the page, indicating to the user that a topic has been added to the possible topics (appState.topicsArray). Alert fades out on a timer. 
    * @param {string} userInput - the topic added by the user. 
    */
    showTopicAddedAlert: function(userInput){
      var newAlert = $('<div class=\'alert alert-success\'></div>');
      newAlert.html('<strong>Success!</strong> ' + userInput + ' has been added!');
      $('.topic-button-section').prepend(newAlert);
      setTimeout(function() {
        newAlert.fadeOut(1000*2);
      }, 1000*1);
      setTimeout(function() {
        newAlert.remove();
      }, 1000*3);
    },

    /**
    * When a user removes a topic button, this function displays an alert on the page, indicating to the user that a topic has been removed from possible topics (appState.topicsArray). Alert fades out on a timer.  
    */
    showTopicRemovedAlert: function() {
      var name = browser.formatCapitalization(appState.nameToRemove);
      var newAlert = $('<div class=\'alert alert-danger\'></div>');
      newAlert.html(name + ' was successfully removed!');
      $('.topic-button-section').prepend(newAlert);
      setTimeout(function() {
        newAlert.fadeOut(1000*2);
      }, 1000*1);
      setTimeout(function() {
        newAlert.remove();
      }, 1000*3);
    },

    /**
    * This function calls the appropriate browser functions to update the display/layout according to the current phase (stored in appState.phase).
    */
    refreshDisplay: function() {
      switch(appState.phase) {
        case 'initialize':
          browser.renderButtons(appState.topicsArray);
          break;
        case 'addNewUserTopic':
          browser.renderButtons(appState.topicsArray);
          browser.showTopicAddedAlert(appState.userInput);
          // push all (including new) buttons into a dropdown if mobile
          if(isMobile.matches){
            mobileDisplay.createDropdown();
          }
          break;
        case 'topicSelected': 
          browser.renderGifs(appState.currentGifArray);
          break;
        case 'removeUserTopic':
          browser.showTopicRemovedAlert();
          break;
        case 'resizeWindow':
          browser.renderButtons(appState.topicsArray);
          $('.topic-button-panel .page-header').removeClass('hidden');
          $('.gif-instruction').html('Click a gif to play/pause');
          break;
      }
    }
  };

//================
// MOBILE DISPLAY
//================

  /* object for all vars/fxns related to mobile-sized browser layout/display */
  var mobileDisplay = {

    /**
    * This function replaces all of the topic buttons with one html dropdown menu containing the topics. 
    */
    createDropdown: function() {
      //remove any existing topic-dropdown
      $('.topic-dropdown').remove();
      // drop the button panel down to the bottom of the screen
      $('.topic-button-panel').insertBefore('footer');
      // put them in a dropdown instead of individual buttons
      // 1. create new dropdown menu
      var dropdown = $('<select>');
      dropdown.addClass('topic-dropdown');
      // 2. create the default option (starts showing) 
      $('<option>', {
        'selected': 'selected',
        'value': '',
        'text': 'Choose your inspiration...'
      }).appendTo(dropdown);
      // 3. populate menu options with the dext from each button
      $('.topic-button').each(function() {
        var buttonOption = $(this);
        // found nice concise way to add these same attributes using an object instead of repeating .attr for each after creation. 
        $('<option>', {
          'value': buttonOption.attr('data-name'),
          'text': buttonOption.text()
        }).appendTo(dropdown);
      });
      // append entire dropdown to relevant section 
      $(dropdown).insertBefore('.topic-button-panel .topic-form');

      mobileDisplay.hideButtons();
      mobileDisplay.updateGifInstruction();
    },

    /**
    * This function hides the topic-buttons and their header, for smaller screens/windows when the dropdown menu is showing instead.  
    */
    hideButtons: function() {
      $('.topic-button-section .btn-group').addClass('hidden');
      $('.topic-button-panel .page-header').addClass('hidden');
    }, 

    /**
    * This function replaces the word 'click' in the instruction header with 'tap', to be more relevant for mobile sized screens
    */
    updateGifInstruction: function(){
      $('.gif-instruction').html('Tap gifs to play/pause');
    }
  };

// ================
// EVENT MANAGEMENT
// ================
// use jquery event management so the listeners are also added to any buttons etc. created in the future 

  // user clicks topic button
  $('.topic-button-section').on('click', '.topic-button', function() {
      appState.selectedTopic = $(this).attr('data-name');
      queries.sendGifRequest(appState.selectedTopic);
  });

  // user clicks remove button
  $('.topic-button-section').on('click', '.remove-button', function() {
    // get the remove button's id so we know which topic-button to remove
    appState.removeButtonId = $(this).attr('data-id-num');
    // save the corresponding name for removing in the array and showing the alert 
    appState.nameToRemove = $('#button-' + appState.removeButtonId).text().toLowerCase();
    // get that name removed from the array 
    queries.removeUserTopic(appState.nameToRemove);
    // remove the topic-button with that id
    $('#button-' + appState.removeButtonId).remove();
    // and remove its remove-button
    $(this).remove();
  });

  // user clicks a gif-image
  $('.gif-display-section').on('click', '.gif-image', function() {
    browser.playPauseGif($(this));
  });

  // user submits a new topic 
  $('.topic-form').on('submit', function(){
    event.preventDefault();
    appState.userInput = $('.topic-input').val().trim().toLowerCase();
    queries.addNewUserTopic(appState.userInput);
    //reset input to default placeholder/value
    $('.topic-form').trigger('reset');
  });

// =======================
// MOBILE EVENT MANAGEMENT
// ========================
  // make dropdown selection work
  $('.topic-button-panel').on('change', '.topic-dropdown',function() {
    // .find('option:selected') is a method to find the selected option in a dropdown HTML menu 
    var selectedTopic = $(this).find('option:selected').val();
    appState.selectedTopic = selectedTopic;
    queries.sendGifRequest(appState.selectedTopic);
  });


// =============
// INTIALIZE APP
// =============

  initializeApp();


//=======================================
// MEDIA QUERY & handling window resizing
//=======================================

  // window.matchMedia(media) returns an object which includes 2 very helpful properties: 
  // 1. media {string}: stores the query parameter passed in 
  // 2. matches {bool}: true if the viewport matches the media parameter passed in 
  var isMobile = window.matchMedia("only screen and (max-width: 768px)");

  // *** check on page load ***
  if (isMobile.matches) {
      // mobile device found 
      mobileDisplay.createDropdown();
  }
  // *** add listener for WINDOW RESIZING after page load***
  $(window).on('resize', function() {
    if (isMobile.matches) {
      // if it changes to mobile size from larger size : 
      mobileDisplay.createDropdown();
    } else {
      // if it changes from mobile size to larger size 
      //remove existing dropdown
      $('.topic-dropdown').remove();
      // pop button panel to the top
      $('.topic-button-panel').appendTo('.col-md-4');
      // to re-render the buttons as buttons!
      appState.phase = 'resizeWindow';
      browser.refreshDisplay();
    }
  })

});
