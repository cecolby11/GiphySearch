$(document).ready(function() {
// =========
// APP STATE
// =========

  var appState;
      
  function resetAppState() {
    return {
      'phase': 'initialize', // possible phases: initialize, addNewUserTopic, topicSelected
      'selectedTopic': null, //from selected button for search
      'topicsArray': ['tom hanks','beyonce', 'herb brooks', 'oprah winfrey', 'richard hendricks', 'erlich bachman'],
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
    'searchEndpoint': 'https://api.giphy.com/v1/gifs/search?',
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
        alert('Hmm, that didn\'t work. We seem to be having a problem on our end. Sorry to keep you waiting!');
      })
      .done(function(response){
        let resultsArray = response.data; //array of objects (each a gif)
        queries.processGiphyResponse(resultsArray);
      });
    }, 

    addNewUserTopic: function(userInput){
      if(($.inArray(userInput, appState.topicsArray)) >= 0){ //returns an index
        alert(userInput + ' was already added, try adding a new topic!');
      } else if(userInput === '') {
        alert('Please enter a topic with at least one letter!')
      } else { //if not already in topic array
        appState.topicsArray.push(userInput);
        appState.phase = 'addNewUserTopic'
        browser.refreshDisplay();
        queries.showGifAddedAlert(userInput);
      }
    }, 

    showGifAddedAlert: function(userInput){
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

    removeUserTopic: function(dataIdNum) {
      //remove from array
      appState.topicsArray.splice(dataIdNum,1);
    }

  };

// ================
// EVENT MANAGEMENT
// ================

// user clicks topic button
// jquery event management so listener is added to buttons created in future too
$('.topic-button-section').on('click', '.topic-button', function() {
    appState.selectedTopic = $(this).attr('data-name');
    queries.sendGifRequest(appState.selectedTopic);
    appState.phase = 'topicSelected';
});

$('.topic-button-section').on('click', '.remove-button', function() {
  var buttonId = $(this).attr('data-id-num');
  queries.removeUserTopic(buttonId);
  $('#button-' + buttonId).remove();
  $(this).remove();
});

// user clicks a gif image, call function to animate/static-ify the gif 
$('.gif-display-section').on('click', '.gif-image', function() {
  browser.playPauseGif($(this));
});

$('.topic-form').on('submit', function(){
  event.preventDefault();
  var userInput = $('.topic-input').val().trim().toLowerCase();
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
        // buttonSection.append(newButton).append(removeButton);
      }
    },

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

    renderGifs: function(array) {
      var gifSection = $('.gif-display-section');
      gifSection.empty(); //empty any previous gifs and replace not append
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

      browser.renderGifInstruction();
    },

    renderGifInstruction: function() {
      var newDiv = $('<div>');
      newDiv.addClass('page-header gif-instruction');
      newDiv.html('<h4>click a gif to play/pause</h4>');
      $('.gif-display-section').prepend(newDiv);
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


//=================mobile-specific====================

  var mobileQueries = {

  };

  var mobileDisplay = {
    createDropdown: function() {
      // drop button panel to the bottom
        $('.topic-button-panel').insertBefore('footer');
        // put them in a dropdown instead of individual buttons
        // 1. create dropdown 
        var dropdown = $('<select>');
        dropdown.addClass('gif-dropdown');
        // 2. create default option with text 
        $('<option>', {
          'selected': 'selected',
          'value': '',
          'text': 'Choose your inspiration...'
        }).appendTo(dropdown);
        // 3. populate with menu item from each button
        $('.topic-button').each(function() {
          var buttonOption = $(this);
          $('<option>', {
            'value': buttonOption.attr('data-name'),
            'text': buttonOption.text()
          }).appendTo(dropdown);
        });
        // append dropdown to section in html
        $(dropdown).insertBefore('.topic-button-panel .topic-form');
        // hide the desktop buttons 
        mobileDisplay.hideButtons();
    },

    hideButtons: function() {
      $('.topic-button-section .btn-group').addClass('hidden');
      $('.topic-button-panel .page-header').addClass('hidden');
    }
  };
  
  var isMobile = window.matchMedia("only screen and (max-width: 760px)");
  // check if document loaded in mobile device
  // note to self - runs on document load so have to refresh page if changing device in chrome simulator 
  if (isMobile.matches) {
      console.log('MOBILE DEVICE FOUND');
      mobileDisplay.createDropdown();

      // ================
      // MOBILE EVENT MANAGEMENT
      // ================
      // dropdown selection
      $('.gif-dropdown').change(function() {
        console.log($(this).find('option:selected').val());
        // method to find the selected option in the scroll selector, get its value
        var selectedTopic = $(this).find('option:selected').val();
        queries.sendGifRequest(appState.selectedTopic);
        appState.phase = 'topicSelected';
      });
  };

});


//PHASES: 
// phase starts as initialize when initializeApp function called 
// phase is initialize until user clicks a topic button
// phase changed to 'topicSelected' in onclick for a topic button
