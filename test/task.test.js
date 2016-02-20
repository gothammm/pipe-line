/* global it */
/* global describe */
/* global after */
/* global process */
/* global before */
'use strict';
const Pipeline = require('../index');
const request = require('superagent');
const Chai = require('chai');
const expect = Chai.expect;

describe('Task cases', () => {
  it('should execute a single task', (done) => {
    let pipe = new Pipeline('myPipe', null);
    
    let addTwo = (input, next) => next(input + 2);
    
    let addThree = (input, next) => next(input + 3);
    
    let addTen = (input, next) => next(input + 10);
     
    pipe.register(addTwo).register(addThree).register(addTen);
    
    pipe.execute(10).then((result) => {
      expect(result).to.be.a('number');
      expect(result).to.equal(25);
      return done();    
    }).catch(done);
  });
  
  it('should handle asynchronous task', (done) => {
    let pipe = new Pipeline('myAsyncPipe', null);
    
    pipe.register((input, next) => {
      let githubUserUrl = 'https://api.github.com/users';
      request.get(`${githubUserUrl}/${input}`).end((err, res) => {
        if (err) {
          throw err;
        }
        return next(res);
      });
    });
    
    pipe.execute('peek4y').then((result) => {      
      let message = JSON.parse(result.text);
      expect(message.login).to.equal('peek4y');
      return done();
    }).catch(done);
  });
  
  it('should handle multiple asynchronous tasks', function(done) {
    // Increase timeout.
    this.timeout(10000);
    
    let pipe = new Pipeline('myGithubPipe', null);
    let githubUserApi = 'https://api.github.com/users';
    let getUser = (input, next) => request.get(`${githubUserApi}/${input}`).end((err, res) => {
      if (err) {
        throw err;
      }
      let response = JSON.parse(res.text);
      return next(response.login);
    });
    
    let getStarredRepos = (input, next) => request.get(`${githubUserApi}/${input}/starred`).end((err, res) => {
      if (err) {
        throw err;
      }
      let response = JSON.parse(res.text);
      return next(response);
    });
    
    pipe.on('task-complete', (name, elapsed) => {
      console.log(`Task '${name}' took ${elapsed}ms to complete`);
    });
    
    pipe.register(getUser, 'Get Github User').register(getStarredRepos, 'Get GitHub Users starred repos');
    
    pipe.execute('peek4y').then((result) => {
      expect(result).to.be.instanceOf(Array);
      expect(result).to.have.length.of.at.least(1);
      return done();
    }).catch(done);
  });
});