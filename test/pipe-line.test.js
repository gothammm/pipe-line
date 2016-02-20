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
    let pipe = new Pipeline('myPipe');
    
    expect(pipe.name).to.equal('myPipe');
    expect(pipe).to.be.instanceOf(Pipeline);
    expect(pipe.tasks).to.have.length.of(0);
    return done();
  });
});
