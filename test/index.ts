const fs = require('fs');
const events = require('events');
const path = require('path');
import { bricks_fn, toolbox } from '../example/toolbox';

import { compile, Interpreter } from 'froggy-interpreter';

import * as runtime_mgr from '../example/runtime_mgr';

const event_emitter = new events.EventEmitter();

const test_name_to_result = {
  test_condition_if: [1, 4, 5, 7, 10, 13, 15, 17],
  test_condition_repeat: [2, 3, 3, 3, 4, 4, 4, 5, 6, 8],
  test_procedure_params: [3, 3, 3, 3, 3, 3, 30],
  test_procedure_recursion: [125250, 15],
  test_procedure_recursion_perf: [1],
};

let outputs = [];
global['document'] = {
  addEventListener: () => {},
  removeEventListener: () => {},
};
global['Event'] = class Event {name; constructor(name) { this.name = name; }};
global['dispatchEvent'] = (e) => {
  outputs.push(e.data);
  event_emitter.emit(e.name);
};
global['requestAnimationFrame'] = (f) => setTimeout(f, 1);
global['cancelAnimationFrame'] = () => {};

const run_test = async () => {
  const tests = Object.keys(test_name_to_result);
  for (let index = 0; index < tests.length; ++index) {
    const name = tests[index];
    console.log(name);
    outputs = [];
    const res = JSON.parse(fs.readFileSync(`${name}.json`, {encoding: 'utf-8'}));
    const compiled_bricks = compile(res);

    runtime_mgr.init(bricks_fn, compiled_bricks.procedures, compiled_bricks.root_bricks);
    console.time(name);
    runtime_mgr.start();
    await new Promise((resolve) => {
      event_emitter.once('finished', () => {
        console.timeEnd(name);
        resolve();
      });
    });
    for (let i = 0; i < outputs.length; ++i) {
      if (outputs[i] !== test_name_to_result[name][i]) {
        throw Error(`fail: ${name}`);
      }
    }
  }
};

run_test();