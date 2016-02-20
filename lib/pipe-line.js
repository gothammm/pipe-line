'use strict';
const util = require('util');
const EventEmitter = require('events').EventEmitter;

function Pipeline(name) {
    this.name = name || '';
    this.tasks = [];

    EventEmitter.call(this);
}

util.inherits(Pipeline, EventEmitter);

Pipeline.prototype.register = function register(task, name) {
    let _self = this;
    let count = _self.tasks.length;

    _self.tasks.push({
        handler: task,
        name: name || `task-${count + 1}`
    });

    return _self;
};

Pipeline.prototype.execute = function execute(input) {
    let _self = this;
    _self._tasks = _self.tasks;
    return new Promise((resolve, reject) => {
        let currentTask;
        let currentTaskStart;
        let isInitialRun;
        return new Promise((resolve) => {
            let next = function next(input) {
                if (!isInitialRun) {
                    let currentTaskEndTime = (new Date()).getTime();
                    _self.emit('task-complete', currentTask, (currentTaskEndTime - currentTaskStart));
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
                    taskHandler(input, next);
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