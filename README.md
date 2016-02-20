# Pipe-line [![Build Status](https://travis-ci.org/peek4y/pipe-line.svg?branch=master)](https://travis-ci.org/peek4y/pipe-line)

A task assembler, to divide large tasks into independent and testable small task, and pipe them!

## TODO
  - Logger control for each task.
  - Better metrics on each task.

## Usage

  Install Pipe-line.
    
    ``` npm install --save pipe-line ```
    
  Registering and executing tasks with pipeline.
  
  
  ```javascript
  
  // Import Pipeline
  let Pipeline = require('pipe-line');
  
  let pipe = new Pipeline('myPipe', null);
  
  let something = getValue();
  
  pipe.register((input, next) => { // A custom task with param input and next Function
    // Do something.
    setTimeout(() => {
      if (!something) {
        throw new Error('Something is undefined');
      }
      // Pass value to the next task.
      return next(10);
    }, 2000);
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