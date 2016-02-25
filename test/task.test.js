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
    let pipe = new Pipeline('myPipe');

    let addTwo = (input, next) => next(null, input + 2);

    let addThree = (input, next) => next(null, input + 3);

    let addTen = (input, next) => next(null, input + 10);

    pipe.register(addTwo).register(addThree).register(addTen);

    pipe.execute(10).then((result) => {
      expect(result).to.be.a('number');
      expect(result).to.equal(25);
      return done();
    }).catch(done);
  });

  it('should handle asynchronous task', (done) => {
    let pipe = new Pipeline('myAsyncPipe');

    pipe.register((input, next) => {
      let githubUserUrl = 'https://api.github.com/users';
      request.get(`${githubUserUrl}/${input}`).end((err, res) => {
        if (err) {
          return next(err);
        }
        return next(null, res);
      });
    });

    pipe.execute('peek4y').then((result) => {
      let message = JSON.parse(result.text);
      expect(message.login).to.equal('peek4y');
      return done();
    }).catch(done);
  });

  it('should handle multiple asynchronous tasks', function (done) {
    // Increase timeout.
    this.timeout(10000);

    let pipe = new Pipeline('myGithubPipe');
    let githubUserApi = 'https://api.github.com/users';
    let getUser = (input, next) => request.get(`${githubUserApi}/${input}`).end((err, res) => {
      if (err) {
        return next(err);
      }
      let response = JSON.parse(res.text);
      return next(null, response.login);
    });

    let getStarredRepos = (input, next) => request.get(`${githubUserApi}/${input}/starred`).end((err, res) => {
      if (err) {
        return next(err);
      }
      let response = JSON.parse(res.text);
      return next(null, response);
    });

    pipe.on('task:complete', (name, elapsed) => {
      console.log(`Task '${name}' took ${elapsed}ms to complete`);
    });

    pipe.register(getUser, 'Get Github User').register(getStarredRepos, 'Get GitHub Users starred repos');

    pipe.execute('peek4y').then((result) => {
      expect(result).to.be.instanceOf(Array);
      expect(result).to.have.length.of.at.least(1);
      return done();
    }).catch(done);
  });

  it('should handle logs', (done) => {

    let pipe = new Pipeline('myPipe');
    let expectLogs = [];

    pipe.on('log', (message, taskName) => {
      expectLogs.push(message);
      console.log('Logged -', message, taskName);
      if (expectLogs.length >= 2) {
        return done();
      }
    });

    pipe.register(function addOne(input, next) {
      let _self = this;
      _self.log('Some message');
      return next(null, input + 1);
    });

    pipe.register(function addTwo(input, next) {
      let _self = this;
      _self.log('Some message 2');
      return next(null, input + 2);
    });

    pipe.execute(10);
  });

  it('should handle errors in nested callbacks', (done) => {

    let pipe = new Pipeline('myPipe');


    pipe.register((input, next) => {
      setTimeout(() => {
        setTimeout(() => {
          return next(new Error('somethings wrong'));
        }, 200);
      }, 500);
    });

    pipe.execute(10).then(done).catch((err) => {
      expect(err).to.be.instanceOf(Error);
      expect(err.message).to.equal('somethings wrong');
      return done();
    });
  });

  it('should contain exit & next actions in each task arguments', (done) => {
    
    let pipe = new Pipeline('myPipe');
    
    pipe.register((input, next, actions) => {
      expect(actions).to.not.be.undefined;
      expect(actions.next).to.not.be.undefined;
      expect(actions.exit).to.not.be.undefined;
      return done();
    });
    
    pipe.execute(10);
  });
  
  it('should exit pipeline gracefully using actions.exit', (done) => {

    let pipe = new Pipeline('myPipe');

    pipe.register((input, next) => {
      return next(null, input + 2);
    });

    pipe.register((input, next, actions) => {
      if (input === 12) {
        return actions.exit(input);
      }
      return next(null, input + 10);
    });

    pipe.execute(10).then((result) => {
      expect(result).to.equal(12);
      done();
    }).catch(done);
  });
  
  it('should pass param to next task using actions.next', (done) => {
    let pipe = new Pipeline('myPipe');
    
    pipe.register((input, next) => {
      return next(null, input + 2); 
    });
    
    pipe.register((input, next, actions) => {
      return actions.next(null, input + 3);
    });
    
    pipe.execute(10).then((result) => {
      expect(result).to.equal(15);
      return done();
    }).catch(done);
  });
});