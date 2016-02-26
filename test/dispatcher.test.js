/* global it */
/* global describe */
/* global after */
/* global process */
/* global before */
'use strict';
const Dispatcher = require('../index').Dispatcher;
const Pipeline = require('../index').Pipeline;
const Chai = require('chai');
const expect = Chai.expect;

describe('Dispatcher cases', () => {
  
  it('should create an instance of dispatcher', (done) => {
    let pipeOne = new Pipeline('myPipe1');
    let pipeTwo = new Pipeline('myPipe2');
    
    let pipelineDispatcher = new Dispatcher([pipeOne, pipeTwo]);
    
    expect(pipelineDispatcher).to.be.instanceof(Dispatcher);
    expect(pipelineDispatcher.dispatch).to.not.be.undefined;
    return done();
  });
  
  it('should throw an error while creating an instance of a dispatcher with empty constructor params', (done) => {
    try {
      let dispatcher = new Dispatcher();
      dispatcher.dispatch();
    }
    catch(err) {
      expect(err).to.be.instanceof(Error);
      expect(err.message).to.equal('Invalid arguments - not an array of pipelines');
    }
    return done();
  });
  
  it('should throw an error while creating an instance of a dispatcher with invalid constructor params', (done) => {
    try {
      let dispatcher = new Dispatcher([1, 2, 3, 4, 'test']);
      dispatcher.dispatch();
    }
    catch(err) {
      expect(err).to.be.instanceof(Error);
    }
    return done();
  });
  
  it('should execute a pipeline based on a predicate', (done) => {
    let pipeOne = new Pipeline('pipeOne');
    let pipeTwo = new Pipeline('pipeTwo');
    let selector = (x) => x ? 'pipeTwo' : 'pipeOne';
    
    pipeOne.register((input, next) => {
      return next(null, input + 10);
    });
    
    pipeTwo.register((input, next) => {
      return next(null, input + 20);
    });
    
    let dispatcher = new Dispatcher([pipeOne, pipeTwo]);
    
    dispatcher.dispatch(() => selector(true), 10).then((result) => {
      expect(result).to.not.be.undefined;
      expect(result).to.equal(30);
      return done();
    });
    
  });
});