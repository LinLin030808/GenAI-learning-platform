// Runs learner code against tests inside a throwaway Web Worker (no DOM, no cookies,
// killed after a timeout so infinite loops cannot freeze the page).
import type { TestResult } from './schema';

const WORKER_SOURCE = `
self.onmessage = (e) => {
  const { code, functionName, tests } = e.data;
  const logs = [];
  const fakeConsole = { log: (...a) => logs.push(a.map(String).join(' ')) };
  let fn;
  try {
    fn = new Function('console', code + '\\n;return typeof ' + functionName + ' === "function" ? ' + functionName + ' : undefined;')(fakeConsole);
  } catch (err) {
    self.postMessage({ fatal: 'Your code has a syntax error: ' + err.message, logs });
    return;
  }
  if (typeof fn !== 'function') {
    self.postMessage({ fatal: 'Could not find a function called ' + functionName + '. Did you rename it?', logs });
    return;
  }
  const results = tests.map((t, i) => {
    const label = t.label || (functionName + '(' + t.args.map((a) => JSON.stringify(a)).join(', ') + ')');
    try {
      const actual = fn(...t.args);
      const a = JSON.stringify(actual);
      const ex = JSON.stringify(t.expected);
      return { label, passed: a === ex, expected: ex, actual: a === undefined ? 'undefined' : a };
    } catch (err) {
      return { label, passed: false, expected: JSON.stringify(t.expected), actual: 'error', error: String(err && err.message || err) };
    }
  });
  self.postMessage({ results, logs });
};
`;

export interface RunOutput {
  results: TestResult[];
  logs: string[];
  fatal?: string;
}

export function runTests(
  code: string,
  functionName: string,
  tests: { args: unknown[]; expected: unknown; label?: string }[],
  timeoutMs = 3000,
): Promise<RunOutput> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: 'text/javascript' }));
    const worker = new Worker(url);
    const done = (out: RunOutput) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(out);
    };
    const timer = setTimeout(
      () => done({ results: [], logs: [], fatal: `Your code ran for more than ${timeoutMs / 1000}s. Is there an infinite loop?` }),
      timeoutMs,
    );
    worker.onmessage = (e: MessageEvent<RunOutput>) => done({ results: e.data.results ?? [], logs: e.data.logs ?? [], fatal: e.data.fatal });
    worker.onerror = (e) => done({ results: [], logs: [], fatal: e.message || 'The code crashed.' });
    worker.postMessage({ code, functionName, tests });
  });
}
