# Pipe-line [![Build Status](https://travis-ci.org/peek4y/pipe-line.svg?branch=master)](https://travis-ci.org/peek4y/pipe-line)

A task assembler, to divide large tasks into independent and testable small task, and pipe them!


## Usage

  Install Pipe-line.
    
    npm install --save pipe-line
    
  Registering and executing tasks with pipeline.
  
  
  ```javascript
  
  // Import Pipeline
  let Pipeline = require('pipe-line').Pipeline;
  
  let pipe = new Pipeline('myPipe', null);
  
  let something = getValue();
  
  pipe.register((input, next) => { // A custom task with param input and next Function
    // Do something.
    setTimeout(() => {
      if (!something) {
        return next(new Error('Something is undefined'));
      }
      // Pass value to the next task.
      // First param - error
      // Second param - value to be passed to the next task
      return next(null, 10);
    }, 2000);
  });
  
  // Use ES5 function, to get a hold of the current task scope.
  // 'this' scope will be unavailable when using ES6 arrow function.
  
  // Actions parameter is an object containing exit & next Function.
  pipe.register(function(input, next, actions) {
    let _self = this; // Task Scope. 
    
    if (someCondition) {
      return actions.exit(input + 2); // For Graceful pipeline exit.
    }
    
    _self.log('My Log message', 'and more message'); // Triggers the event 'log'
  });
  
  // Handling events
  
  // Error event.
  // params -> err, and name of the task it failed.
  pipe.on('error', (err, taskName) => {
    // Handle stuff
  });
  
  // Log event.
  pipe.on('log', (message, taskName) => {
    myLogger.info(message, taskName);
  });
  
  
  // Task start event.
  // Triggers when a task starts.
  pipe.on('task:start', (taskName) => {
    myLogger.info(`${taskName} started...`);
  });
  
  // Task Complete event.
  // Triggers when a particular task finished executing.
  // params -> taskName and ElapsedTime - Time elapsed for the task.
  pipe.on('task:complete', (taskName, elapsedTime) => {
    myLogger.info(`${taskName} completed in ${elapsedTime}`);
  });
  
  // Done event.
  // triggered when the pipeline completes executing all the tasks.
  pipe.on('done', (result) => {
    // Result of the pipeline.
  });
  
  // Can register multiple tasks, each task's output will be input for the next task.
  // Registering tasks can be chained.
  // pipe.register(fn).register(fn).register(fn) ....
  
  // Execute the pipeline containing the registered tasks, with an initial parameter.
  // it returns a promise.
  let pipePromise = pipe.execute(10); // this will be passed on to (input, next) => console.log(input); // 10;
  
  // Any error thrown inside the task handler, will be handled in promise's catch block 
  pipePromise.then((result) => console.log(result)).catch(console.error);
  
  
  ```
  
## Using a dispatcher
    
  A dispatcher is basically a conditional pipeline runner, Dispatcher takes in array of Pipelines as constructor param,
  and a ```dispatch``` function takes first param as a predicate and second param as the initial input just like ```Pipeline.execute(input)```
     
  
  ```javascript
    // Import dispatcher.
    const Dispatcher = require('pipe-line').Dispatcher;
    
    // Import pipeline
    const Pipeline = require('pipe-line').Pipeline;
    
    // Create pipelines that executes different tasks.
    let pipeOne = new Pipeline('pipeOne');
    let pipeTwo = new Pipeline('pipeTwo');
    
    // Load the pipelines into the dispatcher in the form of an array.
    let dispatcher = new Dispatcher([pipeOne, pipeTwo]);
    
    
    // First param - a predicate function that returns the name of a pipeline.
    // Second param - the initial input value, that needs to be passed onto the selected pipeline.
    // It also executes the pipeline and returns a promise with the result of the pipeline.
    // Returns a promise.
    dispatcher.dispatch(function() {
      if (someCondition) {
        return 'pipeOne'; // Pipeline name
      } else {
        return 'pipeTwo';
      } 
    }, 10).then((result) => {
      console.log(result);
    });;
    
  ```
