'use strict';
const util = require('util');
const EventEmitter = require('events').EventEmitter;

function Pipeline(name) {
  this.name = name || '';
  this.tasks = [];
  this.totalExecutionTime = 0;
  EventEmitter.call(this);
}

function _extend(source, target) {
  let sourceObj = {};
  for (let i in source) {
    sourceObj[i] = source[i];
  }
  for (let j in target) {
    if (target.hasOwnProperty(j)) {
      sourceObj[j] = target[j];
    }
  }
  return sourceObj;
};

util.inherits(Pipeline, EventEmitter);


Pipeline.prototype.log = function log() {
  let _self = this;
  let args = Array.prototype.slice.call(arguments);
  let taskName = _self.currentTask.name || '';
  _self.emit('log', args.join(' '), taskName);
};

Pipeline.prototype.getTasks = function getTasks() {
  let _self = this;
  return _self.tasks || [];
};

Pipeline.prototype.clean = function clean() {
  let _self = this;
  return _self.removeAllListeners();
};

Pipeline.prototype.register = function register(task, options) {
  let _self = this;
  let count = _self.tasks.length;

  _self.tasks.push({
    handler: task,
    name: (options && options.name) || `task-${count + 1}`,
    options: options || {}
  });

  return _self;
};

Pipeline.prototype.execute = function execute(input) {
  let _self = this;
  let _taskIndex = 0;
  let maxElapsedTask = {
    time: 0,
    name: ''
  };
  _self.totalExecutionTime = 0;
  return new Promise((resolve, reject) => {
    let currentTask;
    let currentTaskStart;
    let isInitialRun;
    return new Promise((resolve, reject) => {
      let fail = (err) => reject(err);
      let actions;
      let next = function next(err, input) {
        if (err) {
          return reject(err);
        }
        if (!isInitialRun) {
          _taskIndex++;
          let currentTaskEndTime = (new Date()).getTime();
          let elapsedTime = (currentTaskEndTime - currentTaskStart);
          if (maxElapsedTask.time < elapsedTime) {
            maxElapsedTask.time = elapsedTime;
            maxElapsedTask.name = currentTask;
          }
          _self.totalExecutionTime += elapsedTime;
          _self.emit('task:complete', currentTask, elapsedTime);
        } else {
          isInitialRun = false;
        }
        if (_taskIndex <= (_self.tasks.length - 1)) {
          let task = _self.tasks[_taskIndex];
          let taskHandler = task.handler;
          let taskName = task.name;
          currentTask = taskName;
          currentTaskStart = (new Date()).getTime();
          _self.emit('task:start', currentTask);
          let taskScope = _extend(_self, {
            fail: fail,
            currentTask: {
              name: currentTask,
              options: task.options || {}
            }
          });
          taskHandler.bind(taskScope)(input, next, actions);
        } else {
          resolve(input);
          return _self.emit('done', input, maxElapsedTask);
        }
      }.bind(_self);
      // Add extra actions.
      actions = {
        next: next,
        exit: (result) => resolve(result)
      };
      isInitialRun = true;
      next(null, input);
    }).then(resolve).catch((err) => {
      reject(err);
      return _self.emit('error', err, currentTask);
    });
  });
};


module.exports = Pipeline;