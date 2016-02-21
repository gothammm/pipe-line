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
  _self.totalExecutionTime = 0;
  _self._tasks = _self.tasks;
  return new Promise((resolve, reject) => {
    let currentTask;
    let currentTaskStart;
    let isInitialRun;
    return new Promise((resolve) => {
      let next = function next(input) {
        if (!isInitialRun) {
          let currentTaskEndTime = (new Date()).getTime();
          let elapsedTime = (currentTaskEndTime - currentTaskStart);
          _self.totalExecutionTime += elapsedTime;
          _self.emit('task-complete', currentTask, elapsedTime);
        } else {
          isInitialRun = false;
        }
        if (_self.tasks.length) {
          let task = _self.tasks.shift();
          let taskHandler = task.handler;
          let taskName = task.name;
          currentTask = taskName;
          currentTaskStart = (new Date()).getTime();
          _self.emit('task-start', currentTask);
          let taskScope = _extend(_self, {
            currentTask: {
              name: currentTask,
              options: task.options || {}
            }
          });
          taskHandler.bind(taskScope)(input, next);
        } else {
          _self.emit('done', input);
          resolve(input);
          _self.removeAllListeners();
        }
      }.bind(_self);
      isInitialRun = true;
      next(input);
    }).then(resolve).catch((err) => {
      _self.emit('error', err, currentTask);
      reject(err);
    });
  });
};


module.exports = Pipeline;