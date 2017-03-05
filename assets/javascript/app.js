// =========
// APP STATE
// =========

// array of button topics 

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

// ===============
// FUNCTIONS/LOGIC
// ===============

// GET THE GIFs 
// AJAX request to giphy API 
  // api key
// get 10 static non-animated images and display them
  // q parameter
  // limit parameter
// get the rating for display
  // rating parameter 
// static and non-static links 

// last step
// add user form value to topics array 
// call refresh display to refresh the buttons



// ========
// DISPLAY
// ========

// dynamically create buttons on page load 
// FOR LOOP
// button for each topic in the array
// set text to the topic from the array

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