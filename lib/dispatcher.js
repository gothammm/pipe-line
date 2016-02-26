'use strict';

const Pipeline = require('./pipe-line');

class Dispatcher {
  constructor(pipelines) {
    if (!pipelines) {
      throw new Error('Invalid arguments - not an array of pipelines');
    }
    if (pipelines && !pipelines.length) {
      throw new Error('Invalid arguments - requires an array of pipe-lines');
    }
    for (let i = 0, length = pipelines.length; i < length; i++) {
      if (!(pipelines[i] instanceof Pipeline)) {
        throw new Error('Invalid arguments - elements need to be of Pipeline type.');
      }
    }

    this.pipelines = pipelines;
  }
  dispatch(predicate, input) {
    if (!predicate || typeof predicate != 'function') {
      return Promise.reject(new Error('Invalid argument - predicate needs to be of type function'));
    }

    let predicateResult = predicate();
    let pipeline = this.pipelines.find((x) => x.name === predicateResult);

    if (!pipeline) {
      return Promise.reject(new Error(`Pipline ${predicateResult} not found..`));
    }
    return Promise.resolve().then(() => pipeline.execute(input));
  }
}

module.exports = Dispatcher;