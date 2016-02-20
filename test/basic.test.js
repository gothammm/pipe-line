/* global it */
/* global describe */
/* global after */
/* global process */
/* global before */
'use strict';
const Pipeline = require('../index');
const Chai = require('chai');
const expect = Chai.expect;

describe('Pipeline cases', () => {
  it('should create instance of Pipeline', (done) => {
    let pipe = new Pipeline('myPipe', null);

    expect(pipe.name).to.equal('myPipe');
    expect(pipe).to.be.instanceOf(Pipeline);
    expect(pipe.tasks).to.have.length.of(0);
    return done();
  });

  it('should register tasks', (done) => {
    let pipe = new Pipeline('myPipe', null);
    
    pipe.register((input, next) => {
      return next(input);
    });
    
    pipe.register((input, next) => {
      return next(input);
    });
    
    expect(pipe.getTasks()).to.have.length(2);
    return done();
  });
  
  it('should regsiter task with a name', (done) => {
    let pipe = new Pipeline('myPipe', null);
    
    pipe.register((input, next) => {
      return next(input);
    }, 'return value');
    
    let tasks = pipe.getTasks();
    
    expect(tasks).to.have.length(1);
    expect(tasks[0].name).to.equal('return value');
    return done();
  });
  
});
