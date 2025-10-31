var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
var init_utils = __esm({
  "node_modules/unenv/dist/runtime/_internal/utils.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    __name(createNotImplementedError, "createNotImplementedError");
    __name(notImplemented, "notImplemented");
    __name(notImplementedClass, "notImplementedClass");
  }
});

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin, _performanceNow, nodeTiming, PerformanceEntry, PerformanceMark, PerformanceMeasure, PerformanceResourceTiming, PerformanceObserverEntryList, Performance, PerformanceObserver, performance;
var init_performance = __esm({
  "node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_utils();
    _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
    _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
    nodeTiming = {
      name: "node",
      entryType: "node",
      startTime: 0,
      duration: 0,
      nodeStart: 0,
      v8Start: 0,
      bootstrapComplete: 0,
      environment: 0,
      loopStart: 0,
      loopExit: 0,
      idleTime: 0,
      uvMetricsInfo: {
        loopCount: 0,
        events: 0,
        eventsWaiting: 0
      },
      detail: void 0,
      toJSON() {
        return this;
      }
    };
    PerformanceEntry = class {
      static {
        __name(this, "PerformanceEntry");
      }
      __unenv__ = true;
      detail;
      entryType = "event";
      name;
      startTime;
      constructor(name, options) {
        this.name = name;
        this.startTime = options?.startTime || _performanceNow();
        this.detail = options?.detail;
      }
      get duration() {
        return _performanceNow() - this.startTime;
      }
      toJSON() {
        return {
          name: this.name,
          entryType: this.entryType,
          startTime: this.startTime,
          duration: this.duration,
          detail: this.detail
        };
      }
    };
    PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
      static {
        __name(this, "PerformanceMark");
      }
      entryType = "mark";
      constructor() {
        super(...arguments);
      }
      get duration() {
        return 0;
      }
    };
    PerformanceMeasure = class extends PerformanceEntry {
      static {
        __name(this, "PerformanceMeasure");
      }
      entryType = "measure";
    };
    PerformanceResourceTiming = class extends PerformanceEntry {
      static {
        __name(this, "PerformanceResourceTiming");
      }
      entryType = "resource";
      serverTiming = [];
      connectEnd = 0;
      connectStart = 0;
      decodedBodySize = 0;
      domainLookupEnd = 0;
      domainLookupStart = 0;
      encodedBodySize = 0;
      fetchStart = 0;
      initiatorType = "";
      name = "";
      nextHopProtocol = "";
      redirectEnd = 0;
      redirectStart = 0;
      requestStart = 0;
      responseEnd = 0;
      responseStart = 0;
      secureConnectionStart = 0;
      startTime = 0;
      transferSize = 0;
      workerStart = 0;
      responseStatus = 0;
    };
    PerformanceObserverEntryList = class {
      static {
        __name(this, "PerformanceObserverEntryList");
      }
      __unenv__ = true;
      getEntries() {
        return [];
      }
      getEntriesByName(_name, _type) {
        return [];
      }
      getEntriesByType(type) {
        return [];
      }
    };
    Performance = class {
      static {
        __name(this, "Performance");
      }
      __unenv__ = true;
      timeOrigin = _timeOrigin;
      eventCounts = /* @__PURE__ */ new Map();
      _entries = [];
      _resourceTimingBufferSize = 0;
      navigation = void 0;
      timing = void 0;
      timerify(_fn, _options) {
        throw createNotImplementedError("Performance.timerify");
      }
      get nodeTiming() {
        return nodeTiming;
      }
      eventLoopUtilization() {
        return {};
      }
      markResourceTiming() {
        return new PerformanceResourceTiming("");
      }
      onresourcetimingbufferfull = null;
      now() {
        if (this.timeOrigin === _timeOrigin) {
          return _performanceNow();
        }
        return Date.now() - this.timeOrigin;
      }
      clearMarks(markName) {
        this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
      }
      clearMeasures(measureName) {
        this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
      }
      clearResourceTimings() {
        this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
      }
      getEntries() {
        return this._entries;
      }
      getEntriesByName(name, type) {
        return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
      }
      getEntriesByType(type) {
        return this._entries.filter((e) => e.entryType === type);
      }
      mark(name, options) {
        const entry = new PerformanceMark(name, options);
        this._entries.push(entry);
        return entry;
      }
      measure(measureName, startOrMeasureOptions, endMark) {
        let start;
        let end;
        if (typeof startOrMeasureOptions === "string") {
          start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
          end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
        } else {
          start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
          end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
        }
        const entry = new PerformanceMeasure(measureName, {
          startTime: start,
          detail: {
            start,
            end
          }
        });
        this._entries.push(entry);
        return entry;
      }
      setResourceTimingBufferSize(maxSize) {
        this._resourceTimingBufferSize = maxSize;
      }
      addEventListener(type, listener, options) {
        throw createNotImplementedError("Performance.addEventListener");
      }
      removeEventListener(type, listener, options) {
        throw createNotImplementedError("Performance.removeEventListener");
      }
      dispatchEvent(event) {
        throw createNotImplementedError("Performance.dispatchEvent");
      }
      toJSON() {
        return this;
      }
    };
    PerformanceObserver = class {
      static {
        __name(this, "PerformanceObserver");
      }
      __unenv__ = true;
      static supportedEntryTypes = [];
      _callback = null;
      constructor(callback) {
        this._callback = callback;
      }
      takeRecords() {
        return [];
      }
      disconnect() {
        throw createNotImplementedError("PerformanceObserver.disconnect");
      }
      observe(options) {
        throw createNotImplementedError("PerformanceObserver.observe");
      }
      bind(fn) {
        return fn;
      }
      runInAsyncScope(fn, thisArg, ...args) {
        return fn.call(thisArg, ...args);
      }
      asyncId() {
        return 0;
      }
      triggerAsyncId() {
        return 0;
      }
      emitDestroy() {
        return this;
      }
    };
    performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();
  }
});

// node_modules/unenv/dist/runtime/node/perf_hooks.mjs
var init_perf_hooks = __esm({
  "node_modules/unenv/dist/runtime/node/perf_hooks.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_performance();
  }
});

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
var init_performance2 = __esm({
  "node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs"() {
    init_perf_hooks();
    globalThis.performance = performance;
    globalThis.Performance = Performance;
    globalThis.PerformanceEntry = PerformanceEntry;
    globalThis.PerformanceMark = PerformanceMark;
    globalThis.PerformanceMeasure = PerformanceMeasure;
    globalThis.PerformanceObserver = PerformanceObserver;
    globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
    globalThis.PerformanceResourceTiming = PerformanceResourceTiming;
  }
});

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default;
var init_noop = __esm({
  "node_modules/unenv/dist/runtime/mock/noop.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    noop_default = Object.assign(() => {
    }, { __unenv__: true });
  }
});

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";
var _console, _ignoreErrors, _stderr, _stdout, log, info, trace, debug, table, error, warn, createTask, clear, count, countReset, dir, dirxml, group, groupEnd, groupCollapsed, profile, profileEnd, time, timeEnd, timeLog, timeStamp, Console, _times, _stdoutErrorHandler, _stderrErrorHandler;
var init_console = __esm({
  "node_modules/unenv/dist/runtime/node/console.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_noop();
    init_utils();
    _console = globalThis.console;
    _ignoreErrors = true;
    _stderr = new Writable();
    _stdout = new Writable();
    log = _console?.log ?? noop_default;
    info = _console?.info ?? log;
    trace = _console?.trace ?? info;
    debug = _console?.debug ?? log;
    table = _console?.table ?? log;
    error = _console?.error ?? log;
    warn = _console?.warn ?? error;
    createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
    clear = _console?.clear ?? noop_default;
    count = _console?.count ?? noop_default;
    countReset = _console?.countReset ?? noop_default;
    dir = _console?.dir ?? noop_default;
    dirxml = _console?.dirxml ?? noop_default;
    group = _console?.group ?? noop_default;
    groupEnd = _console?.groupEnd ?? noop_default;
    groupCollapsed = _console?.groupCollapsed ?? noop_default;
    profile = _console?.profile ?? noop_default;
    profileEnd = _console?.profileEnd ?? noop_default;
    time = _console?.time ?? noop_default;
    timeEnd = _console?.timeEnd ?? noop_default;
    timeLog = _console?.timeLog ?? noop_default;
    timeStamp = _console?.timeStamp ?? noop_default;
    Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
    _times = /* @__PURE__ */ new Map();
    _stdoutErrorHandler = noop_default;
    _stderrErrorHandler = noop_default;
  }
});

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole, assert, clear2, context, count2, countReset2, createTask2, debug2, dir2, dirxml2, error2, group2, groupCollapsed2, groupEnd2, info2, log2, profile2, profileEnd2, table2, time2, timeEnd2, timeLog2, timeStamp2, trace2, warn2, console_default;
var init_console2 = __esm({
  "node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_console();
    workerdConsole = globalThis["console"];
    ({
      assert,
      clear: clear2,
      context: (
        // @ts-expect-error undocumented public API
        context
      ),
      count: count2,
      countReset: countReset2,
      createTask: (
        // @ts-expect-error undocumented public API
        createTask2
      ),
      debug: debug2,
      dir: dir2,
      dirxml: dirxml2,
      error: error2,
      group: group2,
      groupCollapsed: groupCollapsed2,
      groupEnd: groupEnd2,
      info: info2,
      log: log2,
      profile: profile2,
      profileEnd: profileEnd2,
      table: table2,
      time: time2,
      timeEnd: timeEnd2,
      timeLog: timeLog2,
      timeStamp: timeStamp2,
      trace: trace2,
      warn: warn2
    } = workerdConsole);
    Object.assign(workerdConsole, {
      Console,
      _ignoreErrors,
      _stderr,
      _stderrErrorHandler,
      _stdout,
      _stdoutErrorHandler,
      _times
    });
    console_default = workerdConsole;
  }
});

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
var init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console = __esm({
  "node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console"() {
    init_console2();
    globalThis.console = console_default;
  }
});

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime;
var init_hrtime = __esm({
  "node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
      const now = Date.now();
      const seconds = Math.trunc(now / 1e3);
      const nanos = now % 1e3 * 1e6;
      if (startTime) {
        let diffSeconds = seconds - startTime[0];
        let diffNanos = nanos - startTime[0];
        if (diffNanos < 0) {
          diffSeconds = diffSeconds - 1;
          diffNanos = 1e9 + diffNanos;
        }
        return [diffSeconds, diffNanos];
      }
      return [seconds, nanos];
    }, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
      return BigInt(Date.now() * 1e6);
    }, "bigint") });
  }
});

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream;
var init_read_stream = __esm({
  "node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    ReadStream = class {
      static {
        __name(this, "ReadStream");
      }
      fd;
      isRaw = false;
      isTTY = false;
      constructor(fd) {
        this.fd = fd;
      }
      setRawMode(mode) {
        this.isRaw = mode;
        return this;
      }
    };
  }
});

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream;
var init_write_stream = __esm({
  "node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    WriteStream = class {
      static {
        __name(this, "WriteStream");
      }
      fd;
      columns = 80;
      rows = 24;
      isTTY = false;
      constructor(fd) {
        this.fd = fd;
      }
      clearLine(dir3, callback) {
        callback && callback();
        return false;
      }
      clearScreenDown(callback) {
        callback && callback();
        return false;
      }
      cursorTo(x, y, callback) {
        callback && typeof callback === "function" && callback();
        return false;
      }
      moveCursor(dx, dy, callback) {
        callback && callback();
        return false;
      }
      getColorDepth(env2) {
        return 1;
      }
      hasColors(count3, env2) {
        return false;
      }
      getWindowSize() {
        return [this.columns, this.rows];
      }
      write(str, encoding, cb) {
        if (str instanceof Uint8Array) {
          str = new TextDecoder().decode(str);
        }
        try {
          console.log(str);
        } catch {
        }
        cb && typeof cb === "function" && cb();
        return false;
      }
    };
  }
});

// node_modules/unenv/dist/runtime/node/tty.mjs
var init_tty = __esm({
  "node_modules/unenv/dist/runtime/node/tty.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_read_stream();
    init_write_stream();
  }
});

// node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION;
var init_node_version = __esm({
  "node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    NODE_VERSION = "22.14.0";
  }
});

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";
var Process;
var init_process = __esm({
  "node_modules/unenv/dist/runtime/node/internal/process/process.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_tty();
    init_utils();
    init_node_version();
    Process = class _Process extends EventEmitter {
      static {
        __name(this, "Process");
      }
      env;
      hrtime;
      nextTick;
      constructor(impl) {
        super();
        this.env = impl.env;
        this.hrtime = impl.hrtime;
        this.nextTick = impl.nextTick;
        for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
          const value = this[prop];
          if (typeof value === "function") {
            this[prop] = value.bind(this);
          }
        }
      }
      // --- event emitter ---
      emitWarning(warning, type, code) {
        console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
      }
      emit(...args) {
        return super.emit(...args);
      }
      listeners(eventName) {
        return super.listeners(eventName);
      }
      // --- stdio (lazy initializers) ---
      #stdin;
      #stdout;
      #stderr;
      get stdin() {
        return this.#stdin ??= new ReadStream(0);
      }
      get stdout() {
        return this.#stdout ??= new WriteStream(1);
      }
      get stderr() {
        return this.#stderr ??= new WriteStream(2);
      }
      // --- cwd ---
      #cwd = "/";
      chdir(cwd2) {
        this.#cwd = cwd2;
      }
      cwd() {
        return this.#cwd;
      }
      // --- dummy props and getters ---
      arch = "";
      platform = "";
      argv = [];
      argv0 = "";
      execArgv = [];
      execPath = "";
      title = "";
      pid = 200;
      ppid = 100;
      get version() {
        return `v${NODE_VERSION}`;
      }
      get versions() {
        return { node: NODE_VERSION };
      }
      get allowedNodeEnvironmentFlags() {
        return /* @__PURE__ */ new Set();
      }
      get sourceMapsEnabled() {
        return false;
      }
      get debugPort() {
        return 0;
      }
      get throwDeprecation() {
        return false;
      }
      get traceDeprecation() {
        return false;
      }
      get features() {
        return {};
      }
      get release() {
        return {};
      }
      get connected() {
        return false;
      }
      get config() {
        return {};
      }
      get moduleLoadList() {
        return [];
      }
      constrainedMemory() {
        return 0;
      }
      availableMemory() {
        return 0;
      }
      uptime() {
        return 0;
      }
      resourceUsage() {
        return {};
      }
      // --- noop methods ---
      ref() {
      }
      unref() {
      }
      // --- unimplemented methods ---
      umask() {
        throw createNotImplementedError("process.umask");
      }
      getBuiltinModule() {
        return void 0;
      }
      getActiveResourcesInfo() {
        throw createNotImplementedError("process.getActiveResourcesInfo");
      }
      exit() {
        throw createNotImplementedError("process.exit");
      }
      reallyExit() {
        throw createNotImplementedError("process.reallyExit");
      }
      kill() {
        throw createNotImplementedError("process.kill");
      }
      abort() {
        throw createNotImplementedError("process.abort");
      }
      dlopen() {
        throw createNotImplementedError("process.dlopen");
      }
      setSourceMapsEnabled() {
        throw createNotImplementedError("process.setSourceMapsEnabled");
      }
      loadEnvFile() {
        throw createNotImplementedError("process.loadEnvFile");
      }
      disconnect() {
        throw createNotImplementedError("process.disconnect");
      }
      cpuUsage() {
        throw createNotImplementedError("process.cpuUsage");
      }
      setUncaughtExceptionCaptureCallback() {
        throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
      }
      hasUncaughtExceptionCaptureCallback() {
        throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
      }
      initgroups() {
        throw createNotImplementedError("process.initgroups");
      }
      openStdin() {
        throw createNotImplementedError("process.openStdin");
      }
      assert() {
        throw createNotImplementedError("process.assert");
      }
      binding() {
        throw createNotImplementedError("process.binding");
      }
      // --- attached interfaces ---
      permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
      report = {
        directory: "",
        filename: "",
        signal: "SIGUSR2",
        compact: false,
        reportOnFatalError: false,
        reportOnSignal: false,
        reportOnUncaughtException: false,
        getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
        writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
      };
      finalization = {
        register: /* @__PURE__ */ notImplemented("process.finalization.register"),
        unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
        registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
      };
      memoryUsage = Object.assign(() => ({
        arrayBuffers: 0,
        rss: 0,
        external: 0,
        heapTotal: 0,
        heapUsed: 0
      }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
      // --- undefined props ---
      mainModule = void 0;
      domain = void 0;
      // optional
      send = void 0;
      exitCode = void 0;
      channel = void 0;
      getegid = void 0;
      geteuid = void 0;
      getgid = void 0;
      getgroups = void 0;
      getuid = void 0;
      setegid = void 0;
      seteuid = void 0;
      setgid = void 0;
      setgroups = void 0;
      setuid = void 0;
      // internals
      _events = void 0;
      _eventsCount = void 0;
      _exiting = void 0;
      _maxListeners = void 0;
      _debugEnd = void 0;
      _debugProcess = void 0;
      _fatalException = void 0;
      _getActiveHandles = void 0;
      _getActiveRequests = void 0;
      _kill = void 0;
      _preload_modules = void 0;
      _rawDebug = void 0;
      _startProfilerIdleNotifier = void 0;
      _stopProfilerIdleNotifier = void 0;
      _tickCallback = void 0;
      _disconnect = void 0;
      _handleQueue = void 0;
      _pendingMessage = void 0;
      _channel = void 0;
      _send = void 0;
      _linkedBinding = void 0;
    };
  }
});

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess, getBuiltinModule, workerdProcess, isWorkerdProcessV2, unenvProcess, exit, features, platform, env, hrtime3, nextTick, _channel, _disconnect, _events, _eventsCount, _handleQueue, _maxListeners, _pendingMessage, _send, assert2, disconnect, mainModule, _debugEnd, _debugProcess, _exiting, _fatalException, _getActiveHandles, _getActiveRequests, _kill, _linkedBinding, _preload_modules, _rawDebug, _startProfilerIdleNotifier, _stopProfilerIdleNotifier, _tickCallback, abort, addListener, allowedNodeEnvironmentFlags, arch, argv, argv0, availableMemory, binding, channel, chdir, config, connected, constrainedMemory, cpuUsage, cwd, debugPort, dlopen, domain, emit, emitWarning, eventNames, execArgv, execPath, exitCode, finalization, getActiveResourcesInfo, getegid, geteuid, getgid, getgroups, getMaxListeners, getuid, hasUncaughtExceptionCaptureCallback, initgroups, kill, listenerCount, listeners, loadEnvFile, memoryUsage, moduleLoadList, off, on, once, openStdin, permission, pid, ppid, prependListener, prependOnceListener, rawListeners, reallyExit, ref, release, removeAllListeners, removeListener, report, resourceUsage, send, setegid, seteuid, setgid, setgroups, setMaxListeners, setSourceMapsEnabled, setuid, setUncaughtExceptionCaptureCallback, sourceMapsEnabled, stderr, stdin, stdout, throwDeprecation, title, traceDeprecation, umask, unref, uptime, version, versions, _process, process_default;
var init_process2 = __esm({
  "node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_hrtime();
    init_process();
    globalProcess = globalThis["process"];
    getBuiltinModule = globalProcess.getBuiltinModule;
    workerdProcess = getBuiltinModule("node:process");
    isWorkerdProcessV2 = globalThis.Cloudflare.compatibilityFlags.enable_nodejs_process_v2;
    unenvProcess = new Process({
      env: globalProcess.env,
      // `hrtime` is only available from workerd process v2
      hrtime: isWorkerdProcessV2 ? workerdProcess.hrtime : hrtime,
      // `nextTick` is available from workerd process v1
      nextTick: workerdProcess.nextTick
    });
    ({ exit, features, platform } = workerdProcess);
    ({
      env: (
        // Always implemented by workerd
        env
      ),
      hrtime: (
        // Only implemented in workerd v2
        hrtime3
      ),
      nextTick: (
        // Always implemented by workerd
        nextTick
      )
    } = unenvProcess);
    ({
      _channel,
      _disconnect,
      _events,
      _eventsCount,
      _handleQueue,
      _maxListeners,
      _pendingMessage,
      _send,
      assert: assert2,
      disconnect,
      mainModule
    } = unenvProcess);
    ({
      _debugEnd: (
        // @ts-expect-error `_debugEnd` is missing typings
        _debugEnd
      ),
      _debugProcess: (
        // @ts-expect-error `_debugProcess` is missing typings
        _debugProcess
      ),
      _exiting: (
        // @ts-expect-error `_exiting` is missing typings
        _exiting
      ),
      _fatalException: (
        // @ts-expect-error `_fatalException` is missing typings
        _fatalException
      ),
      _getActiveHandles: (
        // @ts-expect-error `_getActiveHandles` is missing typings
        _getActiveHandles
      ),
      _getActiveRequests: (
        // @ts-expect-error `_getActiveRequests` is missing typings
        _getActiveRequests
      ),
      _kill: (
        // @ts-expect-error `_kill` is missing typings
        _kill
      ),
      _linkedBinding: (
        // @ts-expect-error `_linkedBinding` is missing typings
        _linkedBinding
      ),
      _preload_modules: (
        // @ts-expect-error `_preload_modules` is missing typings
        _preload_modules
      ),
      _rawDebug: (
        // @ts-expect-error `_rawDebug` is missing typings
        _rawDebug
      ),
      _startProfilerIdleNotifier: (
        // @ts-expect-error `_startProfilerIdleNotifier` is missing typings
        _startProfilerIdleNotifier
      ),
      _stopProfilerIdleNotifier: (
        // @ts-expect-error `_stopProfilerIdleNotifier` is missing typings
        _stopProfilerIdleNotifier
      ),
      _tickCallback: (
        // @ts-expect-error `_tickCallback` is missing typings
        _tickCallback
      ),
      abort,
      addListener,
      allowedNodeEnvironmentFlags,
      arch,
      argv,
      argv0,
      availableMemory,
      binding: (
        // @ts-expect-error `binding` is missing typings
        binding
      ),
      channel,
      chdir,
      config,
      connected,
      constrainedMemory,
      cpuUsage,
      cwd,
      debugPort,
      dlopen,
      domain: (
        // @ts-expect-error `domain` is missing typings
        domain
      ),
      emit,
      emitWarning,
      eventNames,
      execArgv,
      execPath,
      exitCode,
      finalization,
      getActiveResourcesInfo,
      getegid,
      geteuid,
      getgid,
      getgroups,
      getMaxListeners,
      getuid,
      hasUncaughtExceptionCaptureCallback,
      initgroups: (
        // @ts-expect-error `initgroups` is missing typings
        initgroups
      ),
      kill,
      listenerCount,
      listeners,
      loadEnvFile,
      memoryUsage,
      moduleLoadList: (
        // @ts-expect-error `moduleLoadList` is missing typings
        moduleLoadList
      ),
      off,
      on,
      once,
      openStdin: (
        // @ts-expect-error `openStdin` is missing typings
        openStdin
      ),
      permission,
      pid,
      ppid,
      prependListener,
      prependOnceListener,
      rawListeners,
      reallyExit: (
        // @ts-expect-error `reallyExit` is missing typings
        reallyExit
      ),
      ref,
      release,
      removeAllListeners,
      removeListener,
      report,
      resourceUsage,
      send,
      setegid,
      seteuid,
      setgid,
      setgroups,
      setMaxListeners,
      setSourceMapsEnabled,
      setuid,
      setUncaughtExceptionCaptureCallback,
      sourceMapsEnabled,
      stderr,
      stdin,
      stdout,
      throwDeprecation,
      title,
      traceDeprecation,
      umask,
      unref,
      uptime,
      version,
      versions
    } = isWorkerdProcessV2 ? workerdProcess : unenvProcess);
    _process = {
      abort,
      addListener,
      allowedNodeEnvironmentFlags,
      hasUncaughtExceptionCaptureCallback,
      setUncaughtExceptionCaptureCallback,
      loadEnvFile,
      sourceMapsEnabled,
      arch,
      argv,
      argv0,
      chdir,
      config,
      connected,
      constrainedMemory,
      availableMemory,
      cpuUsage,
      cwd,
      debugPort,
      dlopen,
      disconnect,
      emit,
      emitWarning,
      env,
      eventNames,
      execArgv,
      execPath,
      exit,
      finalization,
      features,
      getBuiltinModule,
      getActiveResourcesInfo,
      getMaxListeners,
      hrtime: hrtime3,
      kill,
      listeners,
      listenerCount,
      memoryUsage,
      nextTick,
      on,
      off,
      once,
      pid,
      platform,
      ppid,
      prependListener,
      prependOnceListener,
      rawListeners,
      release,
      removeAllListeners,
      removeListener,
      report,
      resourceUsage,
      setMaxListeners,
      setSourceMapsEnabled,
      stderr,
      stdin,
      stdout,
      title,
      throwDeprecation,
      traceDeprecation,
      umask,
      uptime,
      version,
      versions,
      // @ts-expect-error old API
      domain,
      initgroups,
      moduleLoadList,
      reallyExit,
      openStdin,
      assert: assert2,
      binding,
      send,
      exitCode,
      channel,
      getegid,
      geteuid,
      getgid,
      getgroups,
      getuid,
      setegid,
      seteuid,
      setgid,
      setgroups,
      setuid,
      permission,
      mainModule,
      _events,
      _eventsCount,
      _exiting,
      _maxListeners,
      _debugEnd,
      _debugProcess,
      _fatalException,
      _getActiveHandles,
      _getActiveRequests,
      _kill,
      _preload_modules,
      _rawDebug,
      _startProfilerIdleNotifier,
      _stopProfilerIdleNotifier,
      _tickCallback,
      _disconnect,
      _handleQueue,
      _pendingMessage,
      _channel,
      _send,
      _linkedBinding
    };
    process_default = _process;
  }
});

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
var init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process = __esm({
  "node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process"() {
    init_process2();
    globalThis.process = process_default;
  }
});

// wrangler-modules-watch:wrangler:modules-watch
var init_wrangler_modules_watch = __esm({
  "wrangler-modules-watch:wrangler:modules-watch"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
  }
});

// node_modules/wrangler/templates/modules-watch-stub.js
var init_modules_watch_stub = __esm({
  "node_modules/wrangler/templates/modules-watch-stub.js"() {
    init_wrangler_modules_watch();
  }
});

// .open-next/middleware/open-next.config.mjs
var open_next_config_exports = {};
__export(open_next_config_exports, {
  default: () => open_next_config_default
});
function getCloudflareContext(options = { async: false }) {
  return options.async ? getCloudflareContextAsync() : getCloudflareContextSync();
}
function getCloudflareContextFromGlobalScope() {
  const global = globalThis;
  return global[cloudflareContextSymbol];
}
function inSSG() {
  const global = globalThis;
  return global.__NEXT_DATA__?.nextExport === true;
}
function getCloudflareContextSync() {
  const cloudflareContext = getCloudflareContextFromGlobalScope();
  if (cloudflareContext) {
    return cloudflareContext;
  }
  if (inSSG()) {
    throw new Error(`

ERROR: \`getCloudflareContext\` has been called in sync mode in either a static route or at the top level of a non-static one, both cases are not allowed but can be solved by either:
  - make sure that the call is not at the top level and that the route is not static
  - call \`getCloudflareContext({async: true})\` to use the \`async\` mode
  - avoid calling \`getCloudflareContext\` in the route
`);
  }
  throw new Error(initOpenNextCloudflareForDevErrorMsg);
}
async function getCloudflareContextAsync() {
  const cloudflareContext = getCloudflareContextFromGlobalScope();
  if (cloudflareContext) {
    return cloudflareContext;
  }
  const inNodejsRuntime = process.env.NEXT_RUNTIME === "nodejs";
  if (inNodejsRuntime || inSSG()) {
    const cloudflareContext2 = await getCloudflareContextFromWrangler();
    addCloudflareContextToNodejsGlobal(cloudflareContext2);
    return cloudflareContext2;
  }
  throw new Error(initOpenNextCloudflareForDevErrorMsg);
}
function addCloudflareContextToNodejsGlobal(cloudflareContext) {
  const global = globalThis;
  global[cloudflareContextSymbol] = cloudflareContext;
}
async function getCloudflareContextFromWrangler(options) {
  const { getPlatformProxy } = await import(
    /* webpackIgnore: true */
    `${"__wrangler".replaceAll("_", "")}`
  );
  const environment = options?.environment ?? process.env.NEXT_DEV_WRANGLER_ENV;
  const { env: env2, cf, ctx } = await getPlatformProxy({
    ...options,
    // The `env` passed to the fetch handler does not contain variables from `.env*` files.
    // because we invoke wrangler with `CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV`=`"false"`.
    // Initializing `envFiles` with an empty list is the equivalent for this API call.
    envFiles: [],
    environment
  });
  return {
    env: env2,
    cf,
    ctx
  };
}
function isUserWorkerFirst(runWorkerFirst, pathname) {
  if (!Array.isArray(runWorkerFirst)) {
    return runWorkerFirst ?? false;
  }
  let hasPositiveMatch = false;
  for (let rule of runWorkerFirst) {
    let isPositiveRule = true;
    if (rule.startsWith("!")) {
      rule = rule.slice(1);
      isPositiveRule = false;
    } else if (hasPositiveMatch) {
      continue;
    }
    const match2 = new RegExp(`^${rule.replace(/([[\]().*+?^$|{}\\])/g, "\\$1").replace("\\*", ".*")}$`).test(pathname);
    if (match2) {
      if (isPositiveRule) {
        hasPositiveMatch = true;
      } else {
        return false;
      }
    }
  }
  return hasPositiveMatch;
}
function defineCloudflareConfig(config2 = {}) {
  const { incrementalCache, tagCache, queue, cachePurge, enableCacheInterception = false, routePreloadingBehavior = "none" } = config2;
  return {
    default: {
      override: {
        wrapper: "cloudflare-node",
        converter: "edge",
        proxyExternalRequest: "fetch",
        incrementalCache: resolveIncrementalCache(incrementalCache),
        tagCache: resolveTagCache(tagCache),
        queue: resolveQueue(queue),
        cdnInvalidation: resolveCdnInvalidation(cachePurge)
      },
      routePreloadingBehavior
    },
    // node:crypto is used to compute cache keys
    edgeExternals: ["node:crypto"],
    cloudflare: {
      useWorkerdCondition: true
    },
    dangerous: {
      enableCacheInterception
    },
    middleware: {
      external: true,
      override: {
        wrapper: "cloudflare-edge",
        converter: "edge",
        proxyExternalRequest: "fetch",
        incrementalCache: resolveIncrementalCache(incrementalCache),
        tagCache: resolveTagCache(tagCache),
        queue: resolveQueue(queue)
      },
      assetResolver: /* @__PURE__ */ __name(() => asset_resolver_default, "assetResolver")
    }
  };
}
function resolveIncrementalCache(value = "dummy") {
  if (typeof value === "string") {
    return value;
  }
  return typeof value === "function" ? value : () => value;
}
function resolveTagCache(value = "dummy") {
  if (typeof value === "string") {
    return value;
  }
  return typeof value === "function" ? value : () => value;
}
function resolveQueue(value = "dummy") {
  if (typeof value === "string") {
    return value;
  }
  return typeof value === "function" ? value : () => value;
}
function resolveCdnInvalidation(value = "dummy") {
  if (typeof value === "string") {
    return value;
  }
  return typeof value === "function" ? value : () => value;
}
var cloudflareContextSymbol, initOpenNextCloudflareForDevErrorMsg, resolver, asset_resolver_default, open_next_config_default;
var init_open_next_config = __esm({
  ".open-next/middleware/open-next.config.mjs"() {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    cloudflareContextSymbol = Symbol.for("__cloudflare-context__");
    __name(getCloudflareContext, "getCloudflareContext");
    __name(getCloudflareContextFromGlobalScope, "getCloudflareContextFromGlobalScope");
    __name(inSSG, "inSSG");
    __name(getCloudflareContextSync, "getCloudflareContextSync");
    __name(getCloudflareContextAsync, "getCloudflareContextAsync");
    __name(addCloudflareContextToNodejsGlobal, "addCloudflareContextToNodejsGlobal");
    __name(getCloudflareContextFromWrangler, "getCloudflareContextFromWrangler");
    initOpenNextCloudflareForDevErrorMsg = `

ERROR: \`getCloudflareContext\` has been called without having called \`initOpenNextCloudflareForDev\` from the Next.js config file.
You should update your Next.js config file as shown below:

   \`\`\`
   // next.config.mjs

   import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

   initOpenNextCloudflareForDev();

   const nextConfig = { ... };
   export default nextConfig;
   \`\`\`

`;
    resolver = {
      name: "cloudflare-asset-resolver",
      async maybeGetAssetResult(event) {
        const { ASSETS } = getCloudflareContext().env;
        if (!ASSETS || !isUserWorkerFirst(globalThis.__ASSETS_RUN_WORKER_FIRST__, event.rawPath)) {
          return void 0;
        }
        const { method, headers } = event;
        if (method !== "GET" && method != "HEAD") {
          return void 0;
        }
        const url = new URL(event.rawPath, "https://assets.local");
        const response = await ASSETS.fetch(url, {
          headers,
          method
        });
        if (response.status === 404) {
          await response.body?.cancel();
          return void 0;
        }
        return {
          type: "core",
          statusCode: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          // Workers and Node types differ.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          body: response.body || new ReadableStream(),
          isBase64Encoded: false
        };
      }
    };
    __name(isUserWorkerFirst, "isUserWorkerFirst");
    asset_resolver_default = resolver;
    __name(defineCloudflareConfig, "defineCloudflareConfig");
    __name(resolveIncrementalCache, "resolveIncrementalCache");
    __name(resolveTagCache, "resolveTagCache");
    __name(resolveQueue, "resolveQueue");
    __name(resolveCdnInvalidation, "resolveCdnInvalidation");
    open_next_config_default = defineCloudflareConfig({
      // Optional: Configure incremental cache
      // You can use R2, KV, or disable caching
      // See: https://opennext.js.org/cloudflare/caching
    });
  }
});

// .open-next/server-functions/default/handler.mjs
var handler_exports = {};
var init_handler = __esm({
  ".open-next/server-functions/default/handler.mjs"() {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
  }
});

// .wrangler/tmp/bundle-ij8lsP/middleware-loader.entry.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// .wrangler/tmp/bundle-ij8lsP/middleware-insertion-facade.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// .open-next/worker.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// .open-next/cloudflare/images.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var define_IMAGES_LOCAL_PATTERNS_default = [];
var define_IMAGES_REMOTE_PATTERNS_default = [];
var NEXT_IMAGE_REGEXP;
async function fetchImage(fetcher, imageUrl, ctx) {
  if (!imageUrl || imageUrl.length > 3072 || imageUrl.startsWith("//")) {
    return getUrlErrorResponse();
  }
  if (imageUrl.startsWith("/")) {
    const url2 = URL.parse(imageUrl, "http://n");
    if (url2 == null) {
      return getUrlErrorResponse();
    }
    const pathname = decodeURIComponent(url2.pathname);
    NEXT_IMAGE_REGEXP ??= /\/_next\/image($|\/)/;
    if (NEXT_IMAGE_REGEXP.test(pathname)) {
      return getUrlErrorResponse();
    }
    if (define_IMAGES_LOCAL_PATTERNS_default.length > 0 && !define_IMAGES_LOCAL_PATTERNS_default.some((p) => matchLocalPattern(p, url2))) {
      return getUrlErrorResponse();
    }
    return fetcher?.fetch(`http://assets.local${imageUrl}`);
  }
  let url;
  try {
    url = new URL(imageUrl);
  } catch {
    return getUrlErrorResponse();
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return getUrlErrorResponse();
  }
  if (!define_IMAGES_REMOTE_PATTERNS_default.some((p) => matchRemotePattern(p, url))) {
    return getUrlErrorResponse();
  }
  const imgResponse = await fetch(imageUrl, { cf: { cacheEverything: true } });
  if (!imgResponse.body) {
    return imgResponse;
  }
  const buffer = new ArrayBuffer(32);
  try {
    let contentType;
    const [respBody, contentBody] = imgResponse.body.tee();
    const reader = contentBody.getReader({ mode: "byob" });
    const { value } = await reader.read(new Uint8Array(buffer));
    ctx.waitUntil(reader.cancel());
    if (value) {
      contentType = detectContentType(value);
    }
    if (!contentType) {
      contentType = imgResponse.headers.get("content-type") ?? "";
    }
    if (!contentType.startsWith("image/") || contentType.includes(",")) {
      contentType = void 0;
    }
    if (contentType && !(contentType === SVG && true)) {
      const headers = new Headers(imgResponse.headers);
      headers.set("content-type", contentType);
      headers.set("content-disposition", "attachment");
      headers.set("content-security-policy", "script-src 'none'; frame-src 'none'; sandbox;");
      return new Response(respBody, { ...imgResponse, headers });
    }
    ctx.waitUntil(respBody.cancel());
    return new Response('"url" parameter is valid but image type is not allowed', {
      status: 400
    });
  } catch {
    return new Response('"url" parameter is valid but upstream response is invalid', {
      status: 400
    });
  }
}
__name(fetchImage, "fetchImage");
function matchRemotePattern(pattern, url) {
  if (pattern.protocol !== void 0 && pattern.protocol.replace(/:$/, "") !== url.protocol.replace(/:$/, "")) {
    return false;
  }
  if (pattern.port !== void 0 && pattern.port !== url.port) {
    return false;
  }
  if (pattern.hostname === void 0 || !new RegExp(pattern.hostname).test(url.hostname)) {
    return false;
  }
  if (pattern.search !== void 0 && pattern.search !== url.search) {
    return false;
  }
  return new RegExp(pattern.pathname).test(url.pathname);
}
__name(matchRemotePattern, "matchRemotePattern");
function matchLocalPattern(pattern, url) {
  if (pattern.search !== void 0 && pattern.search !== url.search) {
    return false;
  }
  return new RegExp(pattern.pathname).test(url.pathname);
}
__name(matchLocalPattern, "matchLocalPattern");
function getUrlErrorResponse() {
  return new Response(`"url" parameter is not allowed`, { status: 400 });
}
__name(getUrlErrorResponse, "getUrlErrorResponse");
var AVIF = "image/avif";
var WEBP = "image/webp";
var PNG = "image/png";
var JPEG = "image/jpeg";
var JXL = "image/jxl";
var JP2 = "image/jp2";
var HEIC = "image/heic";
var GIF = "image/gif";
var SVG = "image/svg+xml";
var ICO = "image/x-icon";
var ICNS = "image/x-icns";
var TIFF = "image/tiff";
var BMP = "image/bmp";
var PDF = "application/pdf";
function detectContentType(buffer) {
  if ([255, 216, 255].every((b, i) => buffer[i] === b)) {
    return JPEG;
  }
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => buffer[i] === b)) {
    return PNG;
  }
  if ([71, 73, 70, 56].every((b, i) => buffer[i] === b)) {
    return GIF;
  }
  if ([82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80].every((b, i) => !b || buffer[i] === b)) {
    return WEBP;
  }
  if ([60, 63, 120, 109, 108].every((b, i) => buffer[i] === b)) {
    return SVG;
  }
  if ([60, 115, 118, 103].every((b, i) => buffer[i] === b)) {
    return SVG;
  }
  if ([0, 0, 0, 0, 102, 116, 121, 112, 97, 118, 105, 102].every((b, i) => !b || buffer[i] === b)) {
    return AVIF;
  }
  if ([0, 0, 1, 0].every((b, i) => buffer[i] === b)) {
    return ICO;
  }
  if ([105, 99, 110, 115].every((b, i) => buffer[i] === b)) {
    return ICNS;
  }
  if ([73, 73, 42, 0].every((b, i) => buffer[i] === b)) {
    return TIFF;
  }
  if ([66, 77].every((b, i) => buffer[i] === b)) {
    return BMP;
  }
  if ([255, 10].every((b, i) => buffer[i] === b)) {
    return JXL;
  }
  if ([0, 0, 0, 12, 74, 88, 76, 32, 13, 10, 135, 10].every((b, i) => buffer[i] === b)) {
    return JXL;
  }
  if ([0, 0, 0, 0, 102, 116, 121, 112, 104, 101, 105, 99].every((b, i) => !b || buffer[i] === b)) {
    return HEIC;
  }
  if ([37, 80, 68, 70, 45].every((b, i) => buffer[i] === b)) {
    return PDF;
  }
  if ([0, 0, 0, 12, 106, 80, 32, 32, 13, 10, 135, 10].every((b, i) => buffer[i] === b)) {
    return JP2;
  }
}
__name(detectContentType, "detectContentType");

// .open-next/cloudflare/init.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_process2();
import { AsyncLocalStorage } from "node:async_hooks";
import stream from "node:stream";

// .open-next/cloudflare/next-env.mjs
var next_env_exports = {};
__export(next_env_exports, {
  development: () => development,
  production: () => production,
  test: () => test
});
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var production = { "DATABASE_URL": "postgresql://viniuser:pgvinipass@vps.viniciusint.com:5432", "NEXT_PUBLIC_APP_URL": "http://localhost:3000" };
var development = { "DATABASE_URL": "postgresql://viniuser:pgvinipass@vps.viniciusint.com:5432", "NEXT_PUBLIC_APP_URL": "http://localhost:3000" };
var test = { "DATABASE_URL": "postgresql://viniuser:pgvinipass@vps.viniciusint.com:5432", "NEXT_PUBLIC_APP_URL": "http://localhost:3000" };

// .open-next/cloudflare/init.js
var cloudflareContextALS = new AsyncLocalStorage();
Object.defineProperty(globalThis, Symbol.for("__cloudflare-context__"), {
  get() {
    return cloudflareContextALS.getStore();
  }
});
async function runWithCloudflareRequestContext(request, env2, ctx, handler3) {
  init(request, env2);
  return cloudflareContextALS.run({ env: env2, ctx, cf: request.cf }, handler3);
}
__name(runWithCloudflareRequestContext, "runWithCloudflareRequestContext");
var initialized = false;
function init(request, env2) {
  if (initialized) {
    return;
  }
  initialized = true;
  const url = new URL(request.url);
  initRuntime();
  populateProcessEnv(url, env2);
}
__name(init, "init");
function initRuntime() {
  Object.assign(process_default, { version: process_default.version || "v22.14.0" });
  Object.assign(process_default.versions, { node: "22.14.0", ...process_default.versions });
  globalThis.__dirname ??= "";
  globalThis.__filename ??= "";
  import.meta.url ??= "file:///worker.js";
  const __original_fetch = globalThis.fetch;
  globalThis.fetch = (input, init2) => {
    if (init2) {
      delete init2.cache;
    }
    return __original_fetch(input, init2);
  };
  const CustomRequest = class extends globalThis.Request {
    static {
      __name(this, "CustomRequest");
    }
    constructor(input, init2) {
      if (init2) {
        delete init2.cache;
        Object.defineProperty(init2, "body", {
          // @ts-ignore
          value: init2.body instanceof stream.Readable ? ReadableStream.from(init2.body) : init2.body
        });
      }
      super(input, init2);
    }
  };
  Object.assign(globalThis, {
    Request: CustomRequest,
    __BUILD_TIMESTAMP_MS__: 1761940577305,
    __NEXT_BASE_PATH__: "",
    __ASSETS_RUN_WORKER_FIRST__: false,
    __TRAILING_SLASH__: false,
    // The external middleware will use the convertTo function of the `edge` converter
    // by default it will try to fetch the request, but since we are running everything in the same worker
    // we need to use the request as is.
    __dangerous_ON_edge_converter_returns_request: true
  });
}
__name(initRuntime, "initRuntime");
function populateProcessEnv(url, env2) {
  for (const [key, value] of Object.entries(env2)) {
    if (typeof value === "string") {
      process_default.env[key] = value;
    }
  }
  const mode = env2.NEXTJS_ENV ?? "production";
  if (next_env_exports[mode]) {
    for (const key in next_env_exports[mode]) {
      process_default.env[key] ??= next_env_exports[mode][key];
    }
  }
  process_default.env.OPEN_NEXT_ORIGIN = JSON.stringify({
    default: {
      host: url.hostname,
      protocol: url.protocol.slice(0, -1),
      port: url.port
    }
  });
  process_default.env.__NEXT_PRIVATE_ORIGIN = url.origin;
  if ("") {
    process_default.env.DEPLOYMENT_ID = "";
  }
}
__name(populateProcessEnv, "populateProcessEnv");

// .open-next/cloudflare/skew-protection.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function maybeGetSkewProtectionResponse(request) {
  if (false) {
    const url = new URL(request.url);
    if (url.hostname === "localhost" || url.hostname.endsWith(".workers.dev")) {
      return void 0;
    }
    const requestDeploymentId = request.headers.get("x-deployment-id") ?? url.searchParams.get("dpl");
    if (!requestDeploymentId || requestDeploymentId === process_default.env.DEPLOYMENT_ID) {
      return void 0;
    }
    deploymentMapping ??= process_default.env[DEPLOYMENT_MAPPING_ENV_NAME] ? JSON.parse(process_default.env[DEPLOYMENT_MAPPING_ENV_NAME]) : {};
    if (!(requestDeploymentId in deploymentMapping)) {
      return void 0;
    }
    const version2 = deploymentMapping[requestDeploymentId];
    if (!version2 || version2 === CURRENT_VERSION_ID) {
      return void 0;
    }
    const versionDomain = version2.split("-")[0];
    const hostname = `${versionDomain}-${process_default.env.CF_WORKER_NAME}.${process_default.env.CF_PREVIEW_DOMAIN}.workers.dev`;
    url.hostname = hostname;
    const requestToOlderDeployment = new Request(url, request);
    const headers = new Headers(request.headers);
    headers.delete("origin");
    return fetch(requestToOlderDeployment, { headers });
  }
}
__name(maybeGetSkewProtectionResponse, "maybeGetSkewProtectionResponse");

// .open-next/middleware/handler.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
import { Buffer as Buffer2 } from "node:buffer";
import { AsyncLocalStorage as AsyncLocalStorage2 } from "node:async_hooks";
import { Buffer as Buffer22 } from "node:buffer";
import { ReadableStream as ReadableStream2 } from "node:stream/web";
import crypto from "node:crypto";
import { parse as parseQs, stringify as stringifyQs } from "node:querystring";
import path from "node:path";
import { Transform } from "node:stream";
import { ReadableStream as ReadableStream22 } from "node:stream/web";
import { createHash } from "node:crypto";
import path2 from "node:path";
globalThis.Buffer = Buffer2;
globalThis.AsyncLocalStorage = AsyncLocalStorage2;
var defaultDefineProperty = Object.defineProperty;
Object.defineProperty = function(o, p, a) {
  if (p === "__import_unsupported" && Boolean(globalThis.__import_unsupported)) {
    return;
  }
  return defaultDefineProperty(o, p, a);
};
globalThis.openNextDebug = false;
globalThis.openNextVersion = "3.8.5";
var __create = Object.create;
var __defProp2 = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames2 = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm2 = /* @__PURE__ */ __name((fn, res) => /* @__PURE__ */ __name(function __init() {
  return fn && (res = (0, fn[__getOwnPropNames2(fn)[0]])(fn = 0)), res;
}, "__init"), "__esm");
var __commonJS = /* @__PURE__ */ __name((cb, mod) => /* @__PURE__ */ __name(function __require() {
  return mod || (0, cb[__getOwnPropNames2(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
}, "__require"), "__commonJS");
var __export2 = /* @__PURE__ */ __name((target, all) => {
  for (var name in all)
    __defProp2(target, name, { get: all[name], enumerable: true });
}, "__export");
var __copyProps = /* @__PURE__ */ __name((to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames2(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp2(to, key, { get: /* @__PURE__ */ __name(() => from[key], "get"), enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
}, "__copyProps");
var __toESM = /* @__PURE__ */ __name((mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp2(target, "default", { value: mod, enumerable: true }) : target,
  mod
)), "__toESM");
function isOpenNextError(e) {
  try {
    return "__openNextInternal" in e;
  } catch {
    return false;
  }
}
__name(isOpenNextError, "isOpenNextError");
var init_error = __esm2({
  "node_modules/@opennextjs/aws/dist/utils/error.js"() {
  }
});
function debug3(...args) {
  if (globalThis.openNextDebug) {
    console.log(...args);
  }
}
__name(debug3, "debug");
function warn3(...args) {
  console.warn(...args);
}
__name(warn3, "warn");
function error3(...args) {
  if (args.some((arg) => isDownplayedErrorLog(arg))) {
    return debug3(...args);
  }
  if (args.some((arg) => isOpenNextError(arg))) {
    const error22 = args.find((arg) => isOpenNextError(arg));
    if (error22.logLevel < getOpenNextErrorLogLevel()) {
      return;
    }
    if (error22.logLevel === 0) {
      return console.log(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    if (error22.logLevel === 1) {
      return warn3(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    return console.error(...args);
  }
  console.error(...args);
}
__name(error3, "error");
function getOpenNextErrorLogLevel() {
  const strLevel = process.env.OPEN_NEXT_ERROR_LOG_LEVEL ?? "1";
  switch (strLevel.toLowerCase()) {
    case "debug":
    case "0":
      return 0;
    case "error":
    case "2":
      return 2;
    default:
      return 1;
  }
}
__name(getOpenNextErrorLogLevel, "getOpenNextErrorLogLevel");
var DOWNPLAYED_ERROR_LOGS;
var isDownplayedErrorLog;
var init_logger = __esm2({
  "node_modules/@opennextjs/aws/dist/adapters/logger.js"() {
    init_error();
    DOWNPLAYED_ERROR_LOGS = [
      {
        clientName: "S3Client",
        commandName: "GetObjectCommand",
        errorName: "NoSuchKey"
      }
    ];
    isDownplayedErrorLog = /* @__PURE__ */ __name((errorLog) => DOWNPLAYED_ERROR_LOGS.some((downplayedInput) => downplayedInput.clientName === errorLog?.clientName && downplayedInput.commandName === errorLog?.commandName && (downplayedInput.errorName === errorLog?.error?.name || downplayedInput.errorName === errorLog?.error?.Code)), "isDownplayedErrorLog");
  }
});
var require_dist = __commonJS({
  "node_modules/cookie/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parse = parse3;
    exports.serialize = serialize;
    var cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
    var cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
    var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
    var __toString = Object.prototype.toString;
    var NullObject = /* @__PURE__ */ (() => {
      const C = /* @__PURE__ */ __name(function() {
      }, "C");
      C.prototype = /* @__PURE__ */ Object.create(null);
      return C;
    })();
    function parse3(str, options) {
      const obj = new NullObject();
      const len = str.length;
      if (len < 2)
        return obj;
      const dec = options?.decode || decode;
      let index = 0;
      do {
        const eqIdx = str.indexOf("=", index);
        if (eqIdx === -1)
          break;
        const colonIdx = str.indexOf(";", index);
        const endIdx = colonIdx === -1 ? len : colonIdx;
        if (eqIdx > endIdx) {
          index = str.lastIndexOf(";", eqIdx - 1) + 1;
          continue;
        }
        const keyStartIdx = startIndex(str, index, eqIdx);
        const keyEndIdx = endIndex(str, eqIdx, keyStartIdx);
        const key = str.slice(keyStartIdx, keyEndIdx);
        if (obj[key] === void 0) {
          let valStartIdx = startIndex(str, eqIdx + 1, endIdx);
          let valEndIdx = endIndex(str, endIdx, valStartIdx);
          const value = dec(str.slice(valStartIdx, valEndIdx));
          obj[key] = value;
        }
        index = endIdx + 1;
      } while (index < len);
      return obj;
    }
    __name(parse3, "parse3");
    function startIndex(str, index, max) {
      do {
        const code = str.charCodeAt(index);
        if (code !== 32 && code !== 9)
          return index;
      } while (++index < max);
      return max;
    }
    __name(startIndex, "startIndex");
    function endIndex(str, index, min) {
      while (index > min) {
        const code = str.charCodeAt(--index);
        if (code !== 32 && code !== 9)
          return index + 1;
      }
      return min;
    }
    __name(endIndex, "endIndex");
    function serialize(name, val, options) {
      const enc = options?.encode || encodeURIComponent;
      if (!cookieNameRegExp.test(name)) {
        throw new TypeError(`argument name is invalid: ${name}`);
      }
      const value = enc(val);
      if (!cookieValueRegExp.test(value)) {
        throw new TypeError(`argument val is invalid: ${val}`);
      }
      let str = name + "=" + value;
      if (!options)
        return str;
      if (options.maxAge !== void 0) {
        if (!Number.isInteger(options.maxAge)) {
          throw new TypeError(`option maxAge is invalid: ${options.maxAge}`);
        }
        str += "; Max-Age=" + options.maxAge;
      }
      if (options.domain) {
        if (!domainValueRegExp.test(options.domain)) {
          throw new TypeError(`option domain is invalid: ${options.domain}`);
        }
        str += "; Domain=" + options.domain;
      }
      if (options.path) {
        if (!pathValueRegExp.test(options.path)) {
          throw new TypeError(`option path is invalid: ${options.path}`);
        }
        str += "; Path=" + options.path;
      }
      if (options.expires) {
        if (!isDate(options.expires) || !Number.isFinite(options.expires.valueOf())) {
          throw new TypeError(`option expires is invalid: ${options.expires}`);
        }
        str += "; Expires=" + options.expires.toUTCString();
      }
      if (options.httpOnly) {
        str += "; HttpOnly";
      }
      if (options.secure) {
        str += "; Secure";
      }
      if (options.partitioned) {
        str += "; Partitioned";
      }
      if (options.priority) {
        const priority = typeof options.priority === "string" ? options.priority.toLowerCase() : void 0;
        switch (priority) {
          case "low":
            str += "; Priority=Low";
            break;
          case "medium":
            str += "; Priority=Medium";
            break;
          case "high":
            str += "; Priority=High";
            break;
          default:
            throw new TypeError(`option priority is invalid: ${options.priority}`);
        }
      }
      if (options.sameSite) {
        const sameSite = typeof options.sameSite === "string" ? options.sameSite.toLowerCase() : options.sameSite;
        switch (sameSite) {
          case true:
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError(`option sameSite is invalid: ${options.sameSite}`);
        }
      }
      return str;
    }
    __name(serialize, "serialize");
    function decode(str) {
      if (str.indexOf("%") === -1)
        return str;
      try {
        return decodeURIComponent(str);
      } catch (e) {
        return str;
      }
    }
    __name(decode, "decode");
    function isDate(val) {
      return __toString.call(val) === "[object Date]";
    }
    __name(isDate, "isDate");
  }
});
var init_logger2 = __esm2({
  "node_modules/@opennextjs/aws/dist/logger.js"() {
  }
});
function parseSetCookieHeader(cookies) {
  if (!cookies) {
    return [];
  }
  if (typeof cookies === "string") {
    return cookies.split(/(?<!Expires=\w+),/i).map((c) => c.trim());
  }
  return cookies;
}
__name(parseSetCookieHeader, "parseSetCookieHeader");
function getQueryFromIterator(it) {
  const query = {};
  for (const [key, value] of it) {
    if (key in query) {
      if (Array.isArray(query[key])) {
        query[key].push(value);
      } else {
        query[key] = [query[key], value];
      }
    } else {
      query[key] = value;
    }
  }
  return query;
}
__name(getQueryFromIterator, "getQueryFromIterator");
var init_util = __esm2({
  "node_modules/@opennextjs/aws/dist/http/util.js"() {
    init_logger2();
  }
});
function getQueryFromSearchParams(searchParams) {
  return getQueryFromIterator(searchParams.entries());
}
__name(getQueryFromSearchParams, "getQueryFromSearchParams");
var init_utils2 = __esm2({
  "node_modules/@opennextjs/aws/dist/overrides/converters/utils.js"() {
    init_util();
  }
});
var edge_exports = {};
__export2(edge_exports, {
  default: /* @__PURE__ */ __name(() => edge_default, "default")
});
var import_cookie;
var NULL_BODY_STATUSES;
var converter;
var edge_default;
var init_edge = __esm2({
  "node_modules/@opennextjs/aws/dist/overrides/converters/edge.js"() {
    import_cookie = __toESM(require_dist(), 1);
    init_util();
    init_utils2();
    NULL_BODY_STATUSES = /* @__PURE__ */ new Set([101, 103, 204, 205, 304]);
    converter = {
      convertFrom: /* @__PURE__ */ __name(async (event) => {
        const url = new URL(event.url);
        const searchParams = url.searchParams;
        const query = getQueryFromSearchParams(searchParams);
        const headers = {};
        event.headers.forEach((value, key) => {
          headers[key] = value;
        });
        const rawPath = url.pathname;
        const method = event.method;
        const shouldHaveBody = method !== "GET" && method !== "HEAD";
        const body = shouldHaveBody ? Buffer22.from(await event.arrayBuffer()) : void 0;
        const cookieHeader = event.headers.get("cookie");
        const cookies = cookieHeader ? import_cookie.default.parse(cookieHeader) : {};
        return {
          type: "core",
          method,
          rawPath,
          url: event.url,
          body,
          headers,
          remoteAddress: event.headers.get("x-forwarded-for") ?? "::1",
          query,
          cookies
        };
      }, "convertFrom"),
      convertTo: /* @__PURE__ */ __name(async (result) => {
        if ("internalEvent" in result) {
          const request = new Request(result.internalEvent.url, {
            body: result.internalEvent.body,
            method: result.internalEvent.method,
            headers: {
              ...result.internalEvent.headers,
              "x-forwarded-host": result.internalEvent.headers.host
            }
          });
          if (globalThis.__dangerous_ON_edge_converter_returns_request === true) {
            return request;
          }
          const cfCache = (result.isISR || result.internalEvent.rawPath.startsWith("/_next/image")) && process.env.DISABLE_CACHE !== "true" ? { cacheEverything: true } : {};
          return fetch(request, {
            // This is a hack to make sure that the response is cached by Cloudflare
            // See https://developers.cloudflare.com/workers/examples/cache-using-fetch/#caching-html-resources
            // @ts-expect-error - This is a Cloudflare specific option
            cf: cfCache
          });
        }
        const headers = new Headers();
        for (const [key, value] of Object.entries(result.headers)) {
          if (key === "set-cookie" && typeof value === "string") {
            const cookies = parseSetCookieHeader(value);
            for (const cookie of cookies) {
              headers.append(key, cookie);
            }
            continue;
          }
          if (Array.isArray(value)) {
            for (const v of value) {
              headers.append(key, v);
            }
          } else {
            headers.set(key, value);
          }
        }
        const body = NULL_BODY_STATUSES.has(result.statusCode) ? null : result.body;
        return new Response(body, {
          status: result.statusCode,
          headers
        });
      }, "convertTo"),
      name: "edge"
    };
    edge_default = converter;
  }
});
var cloudflare_edge_exports = {};
__export2(cloudflare_edge_exports, {
  default: /* @__PURE__ */ __name(() => cloudflare_edge_default, "default")
});
var cfPropNameMapping;
var handler;
var cloudflare_edge_default;
var init_cloudflare_edge = __esm2({
  "node_modules/@opennextjs/aws/dist/overrides/wrappers/cloudflare-edge.js"() {
    cfPropNameMapping = {
      // The city name is percent-encoded.
      // See https://github.com/vercel/vercel/blob/4cb6143/packages/functions/src/headers.ts#L94C19-L94C37
      city: [encodeURIComponent, "x-open-next-city"],
      country: "x-open-next-country",
      regionCode: "x-open-next-region",
      latitude: "x-open-next-latitude",
      longitude: "x-open-next-longitude"
    };
    handler = /* @__PURE__ */ __name(async (handler3, converter2) => async (request, env2, ctx) => {
      globalThis.process = process;
      for (const [key, value] of Object.entries(env2)) {
        if (typeof value === "string") {
          process.env[key] = value;
        }
      }
      const internalEvent = await converter2.convertFrom(request);
      const cfProperties = request.cf;
      for (const [propName, mapping] of Object.entries(cfPropNameMapping)) {
        const propValue = cfProperties?.[propName];
        if (propValue != null) {
          const [encode, headerName] = Array.isArray(mapping) ? mapping : [null, mapping];
          internalEvent.headers[headerName] = encode ? encode(propValue) : propValue;
        }
      }
      const response = await handler3(internalEvent, {
        waitUntil: ctx.waitUntil.bind(ctx)
      });
      const result = await converter2.convertTo(response);
      return result;
    }, "handler");
    cloudflare_edge_default = {
      wrapper: handler,
      name: "cloudflare-edge",
      supportStreaming: true,
      edgeRuntime: true
    };
  }
});
var pattern_env_exports = {};
__export2(pattern_env_exports, {
  default: /* @__PURE__ */ __name(() => pattern_env_default, "default")
});
function initializeOnce() {
  if (initialized2)
    return;
  cachedOrigins = JSON.parse(process.env.OPEN_NEXT_ORIGIN ?? "{}");
  const functions = globalThis.openNextConfig.functions ?? {};
  for (const key in functions) {
    if (key !== "default") {
      const value = functions[key];
      const regexes = [];
      for (const pattern of value.patterns) {
        const regexPattern = `/${pattern.replace(/\*\*/g, "(.*)").replace(/\*/g, "([^/]*)").replace(/\//g, "\\/").replace(/\?/g, ".")}`;
        regexes.push(new RegExp(regexPattern));
      }
      cachedPatterns.push({
        key,
        patterns: value.patterns,
        regexes
      });
    }
  }
  initialized2 = true;
}
__name(initializeOnce, "initializeOnce");
var cachedOrigins;
var cachedPatterns;
var initialized2;
var envLoader;
var pattern_env_default;
var init_pattern_env = __esm2({
  "node_modules/@opennextjs/aws/dist/overrides/originResolver/pattern-env.js"() {
    init_logger();
    cachedPatterns = [];
    initialized2 = false;
    envLoader = {
      name: "env",
      resolve: /* @__PURE__ */ __name(async (_path) => {
        try {
          initializeOnce();
          for (const { key, patterns, regexes } of cachedPatterns) {
            for (const regex of regexes) {
              if (regex.test(_path)) {
                debug3("Using origin", key, patterns);
                return cachedOrigins[key];
              }
            }
          }
          if (_path.startsWith("/_next/image") && cachedOrigins.imageOptimizer) {
            debug3("Using origin", "imageOptimizer", _path);
            return cachedOrigins.imageOptimizer;
          }
          if (cachedOrigins.default) {
            debug3("Using default origin", cachedOrigins.default, _path);
            return cachedOrigins.default;
          }
          return false;
        } catch (e) {
          error3("Error while resolving origin", e);
          return false;
        }
      }, "resolve")
    };
    pattern_env_default = envLoader;
  }
});
var dummy_exports = {};
__export2(dummy_exports, {
  default: /* @__PURE__ */ __name(() => dummy_default, "default")
});
var resolver2;
var dummy_default;
var init_dummy = __esm2({
  "node_modules/@opennextjs/aws/dist/overrides/assetResolver/dummy.js"() {
    resolver2 = {
      name: "dummy"
    };
    dummy_default = resolver2;
  }
});
function toReadableStream(value, isBase64) {
  return new ReadableStream2({
    pull(controller) {
      controller.enqueue(Buffer2.from(value, isBase64 ? "base64" : "utf8"));
      controller.close();
    }
  }, { highWaterMark: 0 });
}
__name(toReadableStream, "toReadableStream");
function emptyReadableStream() {
  if (process.env.OPEN_NEXT_FORCE_NON_EMPTY_RESPONSE === "true") {
    return new ReadableStream2({
      pull(controller) {
        maybeSomethingBuffer ??= Buffer2.from("SOMETHING");
        controller.enqueue(maybeSomethingBuffer);
        controller.close();
      }
    }, { highWaterMark: 0 });
  }
  return new ReadableStream2({
    start(controller) {
      controller.close();
    }
  });
}
__name(emptyReadableStream, "emptyReadableStream");
var maybeSomethingBuffer;
var init_stream = __esm2({
  "node_modules/@opennextjs/aws/dist/utils/stream.js"() {
  }
});
var fetch_exports = {};
__export2(fetch_exports, {
  default: /* @__PURE__ */ __name(() => fetch_default, "default")
});
var fetchProxy;
var fetch_default;
var init_fetch = __esm2({
  "node_modules/@opennextjs/aws/dist/overrides/proxyExternalRequest/fetch.js"() {
    init_stream();
    fetchProxy = {
      name: "fetch-proxy",
      // @ts-ignore
      proxy: /* @__PURE__ */ __name(async (internalEvent) => {
        const { url, headers: eventHeaders, method, body } = internalEvent;
        const headers = Object.fromEntries(Object.entries(eventHeaders).filter(([key]) => key.toLowerCase() !== "cf-connecting-ip"));
        const response = await fetch(url, {
          method,
          headers,
          body
        });
        const responseHeaders = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });
        return {
          type: "core",
          headers: responseHeaders,
          statusCode: response.status,
          isBase64Encoded: true,
          body: response.body ?? emptyReadableStream()
        };
      }, "proxy")
    };
    fetch_default = fetchProxy;
  }
});
var edgeFunctionHandler_exports = {};
__export2(edgeFunctionHandler_exports, {
  default: /* @__PURE__ */ __name(() => edgeFunctionHandler, "default")
});
async function edgeFunctionHandler(request) {
  const path3 = new URL(request.url).pathname;
  const routes = globalThis._ROUTES;
  const correspondingRoute = routes.find((route) => route.regex.some((r) => new RegExp(r).test(path3)));
  if (!correspondingRoute) {
    throw new Error(`No route found for ${request.url}`);
  }
  const entry = await self._ENTRIES[`middleware_${correspondingRoute.name}`];
  const result = await entry.default({
    page: correspondingRoute.page,
    request: {
      ...request,
      page: {
        name: correspondingRoute.name
      }
    }
  });
  globalThis.__openNextAls.getStore()?.pendingPromiseRunner.add(result.waitUntil);
  const response = result.response;
  return response;
}
__name(edgeFunctionHandler, "edgeFunctionHandler");
var init_edgeFunctionHandler = __esm2({
  "node_modules/@opennextjs/aws/dist/core/edgeFunctionHandler.js"() {
    globalThis._ENTRIES = {};
    globalThis.self = globalThis;
    globalThis._ROUTES = [];
  }
});
init_logger();
var DetachedPromise = class {
  static {
    __name(this, "DetachedPromise");
  }
  resolve;
  reject;
  promise;
  constructor() {
    let resolve;
    let reject;
    this.promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    this.resolve = resolve;
    this.reject = reject;
  }
};
var DetachedPromiseRunner = class {
  static {
    __name(this, "DetachedPromiseRunner");
  }
  promises = [];
  withResolvers() {
    const detachedPromise = new DetachedPromise();
    this.promises.push(detachedPromise);
    return detachedPromise;
  }
  add(promise) {
    const detachedPromise = new DetachedPromise();
    this.promises.push(detachedPromise);
    promise.then(detachedPromise.resolve, detachedPromise.reject);
  }
  async await() {
    debug3(`Awaiting ${this.promises.length} detached promises`);
    const results = await Promise.allSettled(this.promises.map((p) => p.promise));
    const rejectedPromises = results.filter((r) => r.status === "rejected");
    rejectedPromises.forEach((r) => {
      error3(r.reason);
    });
  }
};
async function awaitAllDetachedPromise() {
  const store = globalThis.__openNextAls.getStore();
  const promisesToAwait = store?.pendingPromiseRunner.await() ?? Promise.resolve();
  if (store?.waitUntil) {
    store.waitUntil(promisesToAwait);
    return;
  }
  await promisesToAwait;
}
__name(awaitAllDetachedPromise, "awaitAllDetachedPromise");
function provideNextAfterProvider() {
  const NEXT_REQUEST_CONTEXT_SYMBOL = Symbol.for("@next/request-context");
  const VERCEL_REQUEST_CONTEXT_SYMBOL = Symbol.for("@vercel/request-context");
  const store = globalThis.__openNextAls.getStore();
  const waitUntil = store?.waitUntil ?? ((promise) => store?.pendingPromiseRunner.add(promise));
  const nextAfterContext = {
    get: /* @__PURE__ */ __name(() => ({
      waitUntil
    }), "get")
  };
  globalThis[NEXT_REQUEST_CONTEXT_SYMBOL] = nextAfterContext;
  if (process.env.EMULATE_VERCEL_REQUEST_CONTEXT) {
    globalThis[VERCEL_REQUEST_CONTEXT_SYMBOL] = nextAfterContext;
  }
}
__name(provideNextAfterProvider, "provideNextAfterProvider");
function runWithOpenNextRequestContext({ isISRRevalidation, waitUntil, requestId = Math.random().toString(36) }, fn) {
  return globalThis.__openNextAls.run({
    requestId,
    pendingPromiseRunner: new DetachedPromiseRunner(),
    isISRRevalidation,
    waitUntil,
    writtenTags: /* @__PURE__ */ new Set()
  }, async () => {
    provideNextAfterProvider();
    let result;
    try {
      result = await fn();
    } finally {
      await awaitAllDetachedPromise();
    }
    return result;
  });
}
__name(runWithOpenNextRequestContext, "runWithOpenNextRequestContext");
init_logger();
init_logger();
async function resolveConverter(converter2) {
  if (typeof converter2 === "function") {
    return converter2();
  }
  const m_1 = await Promise.resolve().then(() => (init_edge(), edge_exports));
  return m_1.default;
}
__name(resolveConverter, "resolveConverter");
async function resolveWrapper(wrapper) {
  if (typeof wrapper === "function") {
    return wrapper();
  }
  const m_1 = await Promise.resolve().then(() => (init_cloudflare_edge(), cloudflare_edge_exports));
  return m_1.default;
}
__name(resolveWrapper, "resolveWrapper");
async function resolveOriginResolver(originResolver) {
  if (typeof originResolver === "function") {
    return originResolver();
  }
  const m_1 = await Promise.resolve().then(() => (init_pattern_env(), pattern_env_exports));
  return m_1.default;
}
__name(resolveOriginResolver, "resolveOriginResolver");
async function resolveAssetResolver(assetResolver) {
  if (typeof assetResolver === "function") {
    return assetResolver();
  }
  const m_1 = await Promise.resolve().then(() => (init_dummy(), dummy_exports));
  return m_1.default;
}
__name(resolveAssetResolver, "resolveAssetResolver");
async function resolveProxyRequest(proxyRequest) {
  if (typeof proxyRequest === "function") {
    return proxyRequest();
  }
  const m_1 = await Promise.resolve().then(() => (init_fetch(), fetch_exports));
  return m_1.default;
}
__name(resolveProxyRequest, "resolveProxyRequest");
async function createGenericHandler(handler3) {
  const config2 = await Promise.resolve().then(() => (init_open_next_config(), open_next_config_exports)).then((m) => m.default);
  globalThis.openNextConfig = config2;
  const handlerConfig = config2[handler3.type];
  const override = handlerConfig && "override" in handlerConfig ? handlerConfig.override : void 0;
  const converter2 = await resolveConverter(override?.converter);
  const { name, wrapper } = await resolveWrapper(override?.wrapper);
  debug3("Using wrapper", name);
  return wrapper(handler3.handler, converter2);
}
__name(createGenericHandler, "createGenericHandler");
init_logger();
globalThis.__dirname ??= "";
var NEXT_DIR = path.join(__dirname, ".next");
var OPEN_NEXT_DIR = path.join(__dirname, ".open-next");
debug3({ NEXT_DIR, OPEN_NEXT_DIR });
var NextConfig = { "env": {}, "webpack": null, "eslint": { "ignoreDuringBuilds": true }, "typescript": { "ignoreBuildErrors": true, "tsconfigPath": "tsconfig.json" }, "typedRoutes": false, "distDir": ".next", "cleanDistDir": true, "assetPrefix": "", "cacheMaxMemorySize": 52428800, "configOrigin": "next.config.ts", "useFileSystemPublicRoutes": true, "generateEtags": true, "pageExtensions": ["tsx", "ts", "jsx", "js"], "poweredByHeader": true, "compress": true, "images": { "deviceSizes": [640, 750, 828, 1080, 1200, 1920, 2048, 3840], "imageSizes": [16, 32, 48, 64, 96, 128, 256, 384], "path": "/_next/image", "loader": "default", "loaderFile": "", "domains": [], "disableStaticImages": false, "minimumCacheTTL": 60, "formats": ["image/webp"], "dangerouslyAllowSVG": false, "contentSecurityPolicy": "script-src 'none'; frame-src 'none'; sandbox;", "contentDispositionType": "attachment", "remotePatterns": [], "unoptimized": false }, "devIndicators": { "position": "bottom-left" }, "onDemandEntries": { "maxInactiveAge": 6e4, "pagesBufferLength": 5 }, "amp": { "canonicalBase": "" }, "basePath": "", "sassOptions": {}, "trailingSlash": false, "i18n": null, "productionBrowserSourceMaps": false, "excludeDefaultMomentLocales": true, "serverRuntimeConfig": {}, "publicRuntimeConfig": {}, "reactProductionProfiling": false, "reactStrictMode": null, "reactMaxHeadersLength": 6e3, "httpAgentOptions": { "keepAlive": true }, "logging": {}, "compiler": {}, "expireTime": 31536e3, "staticPageGenerationTimeout": 60, "output": "standalone", "modularizeImports": { "@mui/icons-material": { "transform": "@mui/icons-material/{{member}}" }, "lodash": { "transform": "lodash/{{member}}" } }, "outputFileTracingRoot": "/Users/macbookpro/Desktop/app/vini-fleet", "experimental": { "useSkewCookie": false, "cacheLife": { "default": { "stale": 300, "revalidate": 900, "expire": 4294967294 }, "seconds": { "stale": 30, "revalidate": 1, "expire": 60 }, "minutes": { "stale": 300, "revalidate": 60, "expire": 3600 }, "hours": { "stale": 300, "revalidate": 3600, "expire": 86400 }, "days": { "stale": 300, "revalidate": 86400, "expire": 604800 }, "weeks": { "stale": 300, "revalidate": 604800, "expire": 2592e3 }, "max": { "stale": 300, "revalidate": 2592e3, "expire": 4294967294 } }, "cacheHandlers": {}, "cssChunking": true, "multiZoneDraftMode": false, "appNavFailHandling": false, "prerenderEarlyExit": true, "serverMinification": true, "serverSourceMaps": false, "linkNoTouchStart": false, "caseSensitiveRoutes": false, "clientSegmentCache": false, "clientParamParsing": false, "dynamicOnHover": false, "preloadEntriesOnStart": true, "clientRouterFilter": true, "clientRouterFilterRedirects": false, "fetchCacheKeyPrefix": "", "middlewarePrefetch": "flexible", "optimisticClientCache": true, "manualClientBasePath": false, "cpus": 7, "memoryBasedWorkersCount": false, "imgOptConcurrency": null, "imgOptTimeoutInSeconds": 7, "imgOptMaxInputPixels": 268402689, "imgOptSequentialRead": null, "imgOptSkipMetadata": null, "isrFlushToDisk": true, "workerThreads": false, "optimizeCss": false, "nextScriptWorkers": false, "scrollRestoration": false, "externalDir": false, "disableOptimizedLoading": false, "gzipSize": true, "craCompat": false, "esmExternals": true, "fullySpecified": false, "swcTraceProfiling": false, "forceSwcTransforms": false, "largePageDataBytes": 128e3, "typedEnv": false, "parallelServerCompiles": false, "parallelServerBuildTraces": false, "ppr": false, "authInterrupts": false, "webpackMemoryOptimizations": false, "optimizeServerReact": true, "viewTransition": false, "routerBFCache": false, "removeUncaughtErrorAndRejectionListeners": false, "validateRSCRequestHeaders": false, "staleTimes": { "dynamic": 0, "static": 300 }, "serverComponentsHmrCache": true, "staticGenerationMaxConcurrency": 8, "staticGenerationMinPagesPerWorker": 25, "cacheComponents": false, "inlineCss": false, "useCache": false, "globalNotFound": false, "devtoolSegmentExplorer": true, "browserDebugInfoInTerminal": false, "optimizeRouterScrolling": false, "optimizePackageImports": ["lucide-react", "date-fns", "lodash-es", "ramda", "antd", "react-bootstrap", "ahooks", "@ant-design/icons", "@headlessui/react", "@headlessui-float/react", "@heroicons/react/20/solid", "@heroicons/react/24/solid", "@heroicons/react/24/outline", "@visx/visx", "@tremor/react", "rxjs", "@mui/material", "@mui/icons-material", "recharts", "react-use", "effect", "@effect/schema", "@effect/platform", "@effect/platform-node", "@effect/platform-browser", "@effect/platform-bun", "@effect/sql", "@effect/sql-mssql", "@effect/sql-mysql2", "@effect/sql-pg", "@effect/sql-sqlite-node", "@effect/sql-sqlite-bun", "@effect/sql-sqlite-wasm", "@effect/sql-sqlite-react-native", "@effect/rpc", "@effect/rpc-http", "@effect/typeclass", "@effect/experimental", "@effect/opentelemetry", "@material-ui/core", "@material-ui/icons", "@tabler/icons-react", "mui-core", "react-icons/ai", "react-icons/bi", "react-icons/bs", "react-icons/cg", "react-icons/ci", "react-icons/di", "react-icons/fa", "react-icons/fa6", "react-icons/fc", "react-icons/fi", "react-icons/gi", "react-icons/go", "react-icons/gr", "react-icons/hi", "react-icons/hi2", "react-icons/im", "react-icons/io", "react-icons/io5", "react-icons/lia", "react-icons/lib", "react-icons/lu", "react-icons/md", "react-icons/pi", "react-icons/ri", "react-icons/rx", "react-icons/si", "react-icons/sl", "react-icons/tb", "react-icons/tfi", "react-icons/ti", "react-icons/vsc", "react-icons/wi"], "trustHostHeader": false, "isExperimentalCompile": false }, "htmlLimitedBots": "[\\w-]+-Google|Google-[\\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight", "bundlePagesRouterDependencies": false, "configFileName": "next.config.ts", "turbopack": { "root": "/Users/macbookpro/Desktop/app/vini-fleet" } };
var BuildId = "xeaaE-qVxJpruTylEL_w4";
var RoutesManifest = { "basePath": "", "rewrites": { "beforeFiles": [], "afterFiles": [], "fallback": [] }, "redirects": [{ "source": "/:path+/", "destination": "/:path+", "internal": true, "statusCode": 308, "regex": "^(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))/$" }], "routes": { "static": [{ "page": "/", "regex": "^/(?:/)?$", "routeKeys": {}, "namedRegex": "^/(?:/)?$" }, { "page": "/_not-found", "regex": "^/_not\\-found(?:/)?$", "routeKeys": {}, "namedRegex": "^/_not\\-found(?:/)?$" }, { "page": "/admin/chatbot", "regex": "^/admin/chatbot(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/chatbot(?:/)?$" }, { "page": "/admin/dashboard", "regex": "^/admin/dashboard(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/dashboard(?:/)?$" }, { "page": "/admin/delivery", "regex": "^/admin/delivery(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/delivery(?:/)?$" }, { "page": "/admin/delivery/new", "regex": "^/admin/delivery/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/delivery/new(?:/)?$" }, { "page": "/admin/locations", "regex": "^/admin/locations(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/locations(?:/)?$" }, { "page": "/admin/locations/add", "regex": "^/admin/locations/add(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/locations/add(?:/)?$" }, { "page": "/admin/locations/edit", "regex": "^/admin/locations/edit(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/locations/edit(?:/)?$" }, { "page": "/admin/owners", "regex": "^/admin/owners(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/owners(?:/)?$" }, { "page": "/admin/owners/add", "regex": "^/admin/owners/add(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/owners/add(?:/)?$" }, { "page": "/admin/users", "regex": "^/admin/users(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/users(?:/)?$" }, { "page": "/admin/users/add", "regex": "^/admin/users/add(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/users/add(?:/)?$" }, { "page": "/admin/vehicles", "regex": "^/admin/vehicles(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/vehicles(?:/)?$" }, { "page": "/admin/vehicles/add", "regex": "^/admin/vehicles/add(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/vehicles/add(?:/)?$" }, { "page": "/auth/callback", "regex": "^/auth/callback(?:/)?$", "routeKeys": {}, "namedRegex": "^/auth/callback(?:/)?$" }, { "page": "/auth/login", "regex": "^/auth/login(?:/)?$", "routeKeys": {}, "namedRegex": "^/auth/login(?:/)?$" }, { "page": "/ceo/analytics", "regex": "^/ceo/analytics(?:/)?$", "routeKeys": {}, "namedRegex": "^/ceo/analytics(?:/)?$" }, { "page": "/ceo/dashboard", "regex": "^/ceo/dashboard(?:/)?$", "routeKeys": {}, "namedRegex": "^/ceo/dashboard(?:/)?$" }, { "page": "/ceo/reports", "regex": "^/ceo/reports(?:/)?$", "routeKeys": {}, "namedRegex": "^/ceo/reports(?:/)?$" }, { "page": "/ceo-un/dashboard", "regex": "^/ceo\\-un/dashboard(?:/)?$", "routeKeys": {}, "namedRegex": "^/ceo\\-un/dashboard(?:/)?$" }, { "page": "/ceo-un/reports", "regex": "^/ceo\\-un/reports(?:/)?$", "routeKeys": {}, "namedRegex": "^/ceo\\-un/reports(?:/)?$" }, { "page": "/favicon.ico", "regex": "^/favicon\\.ico(?:/)?$", "routeKeys": {}, "namedRegex": "^/favicon\\.ico(?:/)?$" }, { "page": "/normal/dashboard", "regex": "^/normal/dashboard(?:/)?$", "routeKeys": {}, "namedRegex": "^/normal/dashboard(?:/)?$" }, { "page": "/normal/tracking", "regex": "^/normal/tracking(?:/)?$", "routeKeys": {}, "namedRegex": "^/normal/tracking(?:/)?$" }, { "page": "/normal/vehicles", "regex": "^/normal/vehicles(?:/)?$", "routeKeys": {}, "namedRegex": "^/normal/vehicles(?:/)?$" }, { "page": "/normal/vehicles/add", "regex": "^/normal/vehicles/add(?:/)?$", "routeKeys": {}, "namedRegex": "^/normal/vehicles/add(?:/)?$" }], "dynamic": [{ "page": "/admin/delivery/[id]", "regex": "^/admin/delivery/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/admin/delivery/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/admin/delivery/[id]/edit", "regex": "^/admin/delivery/([^/]+?)/edit(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/admin/delivery/(?<nxtPid>[^/]+?)/edit(?:/)?$" }, { "page": "/admin/locations/[id]", "regex": "^/admin/locations/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/admin/locations/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/admin/owners/edit/[id]", "regex": "^/admin/owners/edit/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/admin/owners/edit/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/admin/owners/[id]", "regex": "^/admin/owners/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/admin/owners/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/admin/users/[id]", "regex": "^/admin/users/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/admin/users/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/admin/users/[id]/edit", "regex": "^/admin/users/([^/]+?)/edit(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/admin/users/(?<nxtPid>[^/]+?)/edit(?:/)?$" }, { "page": "/admin/vehicles/[id]", "regex": "^/admin/vehicles/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/admin/vehicles/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/admin/vehicles/[id]/edit/basic", "regex": "^/admin/vehicles/([^/]+?)/edit/basic(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/admin/vehicles/(?<nxtPid>[^/]+?)/edit/basic(?:/)?$" }, { "page": "/admin/vehicles/[id]/edit/shipping", "regex": "^/admin/vehicles/([^/]+?)/edit/shipping(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/admin/vehicles/(?<nxtPid>[^/]+?)/edit/shipping(?:/)?$" }, { "page": "/api/delivery-notes/[id]", "regex": "^/api/delivery\\-notes/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/delivery\\-notes/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/api/locations/[id]", "regex": "^/api/locations/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/locations/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/api/owners/[id]", "regex": "^/api/owners/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/owners/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/api/users/[id]", "regex": "^/api/users/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/users/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/api/vehicles/[id]", "regex": "^/api/vehicles/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/vehicles/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/api/vehicles/[id]/shipping", "regex": "^/api/vehicles/([^/]+?)/shipping(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/vehicles/(?<nxtPid>[^/]+?)/shipping(?:/)?$" }, { "page": "/normal/vehicles/[id]", "regex": "^/normal/vehicles/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/normal/vehicles/(?<nxtPid>[^/]+?)(?:/)?$" }], "data": { "static": [], "dynamic": [] } }, "locales": [] };
var ConfigHeaders = [];
var PrerenderManifest = { "version": 4, "routes": { "/favicon.ico": { "initialHeaders": { "cache-control": "public, max-age=0, must-revalidate", "content-type": "image/x-icon", "x-next-cache-tags": "_N_T_/layout,_N_T_/favicon.ico/layout,_N_T_/favicon.ico/route,_N_T_/favicon.ico" }, "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/favicon.ico", "dataRoute": null, "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/_not-found": { "initialStatus": 404, "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/_not-found", "dataRoute": "/_not-found.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/ceo-un/dashboard": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/ceo-un/dashboard", "dataRoute": "/ceo-un/dashboard.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/ceo-un/reports": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/ceo-un/reports", "dataRoute": "/ceo-un/reports.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/admin/chatbot": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/admin/chatbot", "dataRoute": "/admin/chatbot.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/admin/locations/edit": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/admin/locations/edit", "dataRoute": "/admin/locations/edit.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/admin/owners/add": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/admin/owners/add", "dataRoute": "/admin/owners/add.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/auth/callback": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/auth/callback", "dataRoute": "/auth/callback.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/auth/login": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/auth/login", "dataRoute": "/auth/login.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/", "dataRoute": "/index.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/admin/users/add": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/admin/users/add", "dataRoute": "/admin/users/add.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/admin/vehicles": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/admin/vehicles", "dataRoute": "/admin/vehicles.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/ceo/dashboard": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/ceo/dashboard", "dataRoute": "/ceo/dashboard.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/ceo/analytics": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/ceo/analytics", "dataRoute": "/ceo/analytics.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/admin/delivery/new": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/admin/delivery/new", "dataRoute": "/admin/delivery/new.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/ceo/reports": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/ceo/reports", "dataRoute": "/ceo/reports.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/normal/dashboard": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/normal/dashboard", "dataRoute": "/normal/dashboard.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/normal/vehicles": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/normal/vehicles", "dataRoute": "/normal/vehicles.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/admin/dashboard": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/admin/dashboard", "dataRoute": "/admin/dashboard.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/normal/vehicles/add": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/normal/vehicles/add", "dataRoute": "/normal/vehicles/add.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/admin/locations/add": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/admin/locations/add", "dataRoute": "/admin/locations/add.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/admin/delivery": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/admin/delivery", "dataRoute": "/admin/delivery.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/admin/vehicles/add": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/admin/vehicles/add", "dataRoute": "/admin/vehicles/add.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/normal/tracking": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/normal/tracking", "dataRoute": "/normal/tracking.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] } }, "dynamicRoutes": {}, "notFoundRoutes": [], "preview": { "previewModeId": "6c1ca7697671b86d6338fb3a39cfd725", "previewModeSigningKey": "11ae0c04ed05eb80692140b31ac7d13f353a60ad2819789752c93e47ba97089d", "previewModeEncryptionKey": "9c4e07a7281a4bd7424ccfa724667e9621962d1ade10db6b451fd52f41c18fcc" } };
var MiddlewareManifest = { "version": 3, "middleware": {}, "functions": {}, "sortedMiddleware": [] };
var AppPathRoutesManifest = { "/_not-found/page": "/_not-found", "/api/ceo/analytics/route": "/api/ceo/analytics", "/api/ceo/dashboard/route": "/api/ceo/dashboard", "/api/chatbot/chat/route": "/api/chatbot/chat", "/api/chatbot/context/route": "/api/chatbot/context", "/api/dashboard/stats/route": "/api/dashboard/stats", "/api/delivery-notes/[id]/route": "/api/delivery-notes/[id]", "/api/delivery-notes/route": "/api/delivery-notes", "/api/locations/[id]/route": "/api/locations/[id]", "/api/locations/stats/route": "/api/locations/stats", "/api/locations/route": "/api/locations", "/api/owners/by-email/route": "/api/owners/by-email", "/api/owners/stats/route": "/api/owners/stats", "/api/owners/route": "/api/owners", "/api/owners/[id]/route": "/api/owners/[id]", "/api/users/[id]/route": "/api/users/[id]", "/api/users/route": "/api/users", "/api/users/by-email/route": "/api/users/by-email", "/api/vehicles/[id]/route": "/api/vehicles/[id]", "/api/vehicles/[id]/shipping/route": "/api/vehicles/[id]/shipping", "/api/vehicles/route": "/api/vehicles", "/api/vehicles/upload/route": "/api/vehicles/upload", "/api/users/stats/route": "/api/users/stats", "/api/vehicles/stats/route": "/api/vehicles/stats", "/favicon.ico/route": "/favicon.ico", "/auth/login/page": "/auth/login", "/auth/callback/page": "/auth/callback", "/ceo-un/reports/page": "/ceo-un/reports", "/ceo-un/dashboard/page": "/ceo-un/dashboard", "/page": "/", "/admin/dashboard/page": "/admin/dashboard", "/admin/delivery/[id]/edit/page": "/admin/delivery/[id]/edit", "/admin/delivery/page": "/admin/delivery", "/admin/delivery/new/page": "/admin/delivery/new", "/admin/delivery/[id]/page": "/admin/delivery/[id]", "/admin/locations/add/page": "/admin/locations/add", "/admin/locations/[id]/page": "/admin/locations/[id]", "/admin/locations/edit/page": "/admin/locations/edit", "/admin/owners/add/page": "/admin/owners/add", "/admin/locations/page": "/admin/locations", "/admin/users/[id]/edit/page": "/admin/users/[id]/edit", "/admin/owners/edit/[id]/page": "/admin/owners/edit/[id]", "/admin/chatbot/page": "/admin/chatbot", "/admin/users/add/page": "/admin/users/add", "/admin/owners/[id]/page": "/admin/owners/[id]", "/admin/users/[id]/page": "/admin/users/[id]", "/admin/users/page": "/admin/users", "/admin/vehicles/[id]/edit/basic/page": "/admin/vehicles/[id]/edit/basic", "/admin/vehicles/[id]/edit/shipping/page": "/admin/vehicles/[id]/edit/shipping", "/admin/vehicles/[id]/page": "/admin/vehicles/[id]", "/admin/vehicles/page": "/admin/vehicles", "/admin/vehicles/add/page": "/admin/vehicles/add", "/admin/owners/page": "/admin/owners", "/normal/dashboard/page": "/normal/dashboard", "/ceo/dashboard/page": "/ceo/dashboard", "/ceo/reports/page": "/ceo/reports", "/normal/vehicles/[id]/page": "/normal/vehicles/[id]", "/normal/vehicles/page": "/normal/vehicles", "/normal/tracking/page": "/normal/tracking", "/ceo/analytics/page": "/ceo/analytics", "/normal/vehicles/add/page": "/normal/vehicles/add" };
var FunctionsConfigManifest = { "version": 1, "functions": {} };
var PagesManifest = { "/_app": "pages/_app.js", "/_error": "pages/_error.js", "/_document": "pages/_document.js", "/404": "pages/404.html" };
process.env.NEXT_BUILD_ID = BuildId;
init_logger();
init_util();
init_util();
init_logger();
var commonBinaryMimeTypes = /* @__PURE__ */ new Set([
  "application/octet-stream",
  // Docs
  "application/epub+zip",
  "application/msword",
  "application/pdf",
  "application/rtf",
  "application/vnd.amazon.ebook",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Fonts
  "font/otf",
  "font/woff",
  "font/woff2",
  // Images
  "image/bmp",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/vnd.microsoft.icon",
  "image/webp",
  // Audio
  "audio/3gpp",
  "audio/aac",
  "audio/basic",
  "audio/flac",
  "audio/mpeg",
  "audio/ogg",
  "audio/wavaudio/webm",
  "audio/x-aiff",
  "audio/x-midi",
  "audio/x-wav",
  // Video
  "video/3gpp",
  "video/mp2t",
  "video/mpeg",
  "video/ogg",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  // Archives
  "application/java-archive",
  "application/vnd.apple.installer+xml",
  "application/x-7z-compressed",
  "application/x-apple-diskimage",
  "application/x-bzip",
  "application/x-bzip2",
  "application/x-gzip",
  "application/x-java-archive",
  "application/x-rar-compressed",
  "application/x-tar",
  "application/x-zip",
  "application/zip",
  // Serialized data
  "application/x-protobuf"
]);
function isBinaryContentType(contentType) {
  if (!contentType)
    return false;
  const value = contentType.split(";")[0];
  return commonBinaryMimeTypes.has(value);
}
__name(isBinaryContentType, "isBinaryContentType");
init_stream();
init_logger();
function parse(raw, preferences, options) {
  const lowers = /* @__PURE__ */ new Map();
  const header = raw.replace(/[ \t]/g, "");
  if (preferences) {
    let pos = 0;
    for (const preference of preferences) {
      const lower = preference.toLowerCase();
      lowers.set(lower, { orig: preference, pos: pos++ });
      if (options.prefixMatch) {
        const parts2 = lower.split("-");
        while (parts2.pop(), parts2.length > 0) {
          const joined = parts2.join("-");
          if (!lowers.has(joined)) {
            lowers.set(joined, { orig: preference, pos: pos++ });
          }
        }
      }
    }
  }
  const parts = header.split(",");
  const selections = [];
  const map = /* @__PURE__ */ new Set();
  for (let i = 0; i < parts.length; ++i) {
    const part = parts[i];
    if (!part) {
      continue;
    }
    const params = part.split(";");
    if (params.length > 2) {
      throw new Error(`Invalid ${options.type} header`);
    }
    const token = params[0].toLowerCase();
    if (!token) {
      throw new Error(`Invalid ${options.type} header`);
    }
    const selection = { token, pos: i, q: 1 };
    if (preferences && lowers.has(token)) {
      selection.pref = lowers.get(token).pos;
    }
    map.add(selection.token);
    if (params.length === 2) {
      const q = params[1];
      const [key, value] = q.split("=");
      if (!value || key !== "q" && key !== "Q") {
        throw new Error(`Invalid ${options.type} header`);
      }
      const score = Number.parseFloat(value);
      if (score === 0) {
        continue;
      }
      if (Number.isFinite(score) && score <= 1 && score >= 1e-3) {
        selection.q = score;
      }
    }
    selections.push(selection);
  }
  selections.sort((a, b) => {
    if (b.q !== a.q) {
      return b.q - a.q;
    }
    if (b.pref !== a.pref) {
      if (a.pref === void 0) {
        return 1;
      }
      if (b.pref === void 0) {
        return -1;
      }
      return a.pref - b.pref;
    }
    return a.pos - b.pos;
  });
  const values = selections.map((selection) => selection.token);
  if (!preferences || !preferences.length) {
    return values;
  }
  const preferred = [];
  for (const selection of values) {
    if (selection === "*") {
      for (const [preference, value] of lowers) {
        if (!map.has(preference)) {
          preferred.push(value.orig);
        }
      }
    } else {
      const lower = selection.toLowerCase();
      if (lowers.has(lower)) {
        preferred.push(lowers.get(lower).orig);
      }
    }
  }
  return preferred;
}
__name(parse, "parse");
function acceptLanguage(header = "", preferences) {
  return parse(header, preferences, {
    type: "accept-language",
    prefixMatch: true
  })[0] || void 0;
}
__name(acceptLanguage, "acceptLanguage");
function isLocalizedPath(path3) {
  return NextConfig.i18n?.locales.includes(path3.split("/")[1].toLowerCase()) ?? false;
}
__name(isLocalizedPath, "isLocalizedPath");
function getLocaleFromCookie(cookies) {
  const i18n = NextConfig.i18n;
  const nextLocale = cookies.NEXT_LOCALE?.toLowerCase();
  return nextLocale ? i18n?.locales.find((locale) => nextLocale === locale.toLowerCase()) : void 0;
}
__name(getLocaleFromCookie, "getLocaleFromCookie");
function detectDomainLocale({ hostname, detectedLocale }) {
  const i18n = NextConfig.i18n;
  const domains = i18n?.domains;
  if (!domains) {
    return;
  }
  const lowercasedLocale = detectedLocale?.toLowerCase();
  for (const domain2 of domains) {
    const domainHostname = domain2.domain.split(":", 1)[0].toLowerCase();
    if (hostname === domainHostname || lowercasedLocale === domain2.defaultLocale.toLowerCase() || domain2.locales?.some((locale) => lowercasedLocale === locale.toLowerCase())) {
      return domain2;
    }
  }
}
__name(detectDomainLocale, "detectDomainLocale");
function detectLocale(internalEvent, i18n) {
  const domainLocale = detectDomainLocale({
    hostname: internalEvent.headers.host
  });
  if (i18n.localeDetection === false) {
    return domainLocale?.defaultLocale ?? i18n.defaultLocale;
  }
  const cookiesLocale = getLocaleFromCookie(internalEvent.cookies);
  const preferredLocale = acceptLanguage(internalEvent.headers["accept-language"], i18n?.locales);
  debug3({
    cookiesLocale,
    preferredLocale,
    defaultLocale: i18n.defaultLocale,
    domainLocale
  });
  return domainLocale?.defaultLocale ?? cookiesLocale ?? preferredLocale ?? i18n.defaultLocale;
}
__name(detectLocale, "detectLocale");
function localizePath(internalEvent) {
  const i18n = NextConfig.i18n;
  if (!i18n) {
    return internalEvent.rawPath;
  }
  if (isLocalizedPath(internalEvent.rawPath)) {
    return internalEvent.rawPath;
  }
  const detectedLocale = detectLocale(internalEvent, i18n);
  return `/${detectedLocale}${internalEvent.rawPath}`;
}
__name(localizePath, "localizePath");
function handleLocaleRedirect(internalEvent) {
  const i18n = NextConfig.i18n;
  if (!i18n || i18n.localeDetection === false || internalEvent.rawPath !== "/") {
    return false;
  }
  const preferredLocale = acceptLanguage(internalEvent.headers["accept-language"], i18n?.locales);
  const detectedLocale = detectLocale(internalEvent, i18n);
  const domainLocale = detectDomainLocale({
    hostname: internalEvent.headers.host
  });
  const preferredDomain = detectDomainLocale({
    detectedLocale: preferredLocale
  });
  if (domainLocale && preferredDomain) {
    const isPDomain = preferredDomain.domain === domainLocale.domain;
    const isPLocale = preferredDomain.defaultLocale === preferredLocale;
    if (!isPDomain || !isPLocale) {
      const scheme = `http${preferredDomain.http ? "" : "s"}`;
      const rlocale = isPLocale ? "" : preferredLocale;
      return {
        type: "core",
        statusCode: 307,
        headers: {
          Location: `${scheme}://${preferredDomain.domain}/${rlocale}`
        },
        body: emptyReadableStream(),
        isBase64Encoded: false
      };
    }
  }
  const defaultLocale = domainLocale?.defaultLocale ?? i18n.defaultLocale;
  if (detectedLocale.toLowerCase() !== defaultLocale.toLowerCase()) {
    return {
      type: "core",
      statusCode: 307,
      headers: {
        Location: constructNextUrl(internalEvent.url, `/${detectedLocale}`)
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
  return false;
}
__name(handleLocaleRedirect, "handleLocaleRedirect");
function generateShardId(rawPath, maxConcurrency, prefix) {
  let a = cyrb128(rawPath);
  let t = a += 1831565813;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  const randomFloat = ((t ^ t >>> 14) >>> 0) / 4294967296;
  const randomInt = Math.floor(randomFloat * maxConcurrency);
  return `${prefix}-${randomInt}`;
}
__name(generateShardId, "generateShardId");
function generateMessageGroupId(rawPath) {
  const maxConcurrency = Number.parseInt(process.env.MAX_REVALIDATE_CONCURRENCY ?? "10");
  return generateShardId(rawPath, maxConcurrency, "revalidate");
}
__name(generateMessageGroupId, "generateMessageGroupId");
function cyrb128(str) {
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ h1 >>> 18, 597399067);
  h2 = Math.imul(h4 ^ h2 >>> 22, 2869860233);
  h3 = Math.imul(h1 ^ h3 >>> 17, 951274213);
  h4 = Math.imul(h2 ^ h4 >>> 19, 2716044179);
  h1 ^= h2 ^ h3 ^ h4, h2 ^= h1, h3 ^= h1, h4 ^= h1;
  return h1 >>> 0;
}
__name(cyrb128, "cyrb128");
function isExternal(url, host) {
  if (!url)
    return false;
  const pattern = /^https?:\/\//;
  if (host) {
    return pattern.test(url) && !url.includes(host);
  }
  return pattern.test(url);
}
__name(isExternal, "isExternal");
function convertFromQueryString(query) {
  if (query === "")
    return {};
  const queryParts = query.split("&");
  return getQueryFromIterator(queryParts.map((p) => {
    const [key, value] = p.split("=");
    return [key, value];
  }));
}
__name(convertFromQueryString, "convertFromQueryString");
function getUrlParts(url, isExternal2) {
  if (!isExternal2) {
    const regex2 = /\/([^?]*)\??(.*)/;
    const match3 = url.match(regex2);
    return {
      hostname: "",
      pathname: match3?.[1] ? `/${match3[1]}` : url,
      protocol: "",
      queryString: match3?.[2] ?? ""
    };
  }
  const regex = /^(https?:)\/\/?([^\/\s]+)(\/[^?]*)?(\?.*)?/;
  const match2 = url.match(regex);
  if (!match2) {
    throw new Error(`Invalid external URL: ${url}`);
  }
  return {
    protocol: match2[1] ?? "https:",
    hostname: match2[2],
    pathname: match2[3] ?? "",
    queryString: match2[4]?.slice(1) ?? ""
  };
}
__name(getUrlParts, "getUrlParts");
function constructNextUrl(baseUrl, path3) {
  const nextBasePath = NextConfig.basePath ?? "";
  const url = new URL(`${nextBasePath}${path3}`, baseUrl);
  return url.href;
}
__name(constructNextUrl, "constructNextUrl");
function convertToQueryString(query) {
  const queryStrings = [];
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => queryStrings.push(`${key}=${entry}`));
    } else {
      queryStrings.push(`${key}=${value}`);
    }
  });
  return queryStrings.length > 0 ? `?${queryStrings.join("&")}` : "";
}
__name(convertToQueryString, "convertToQueryString");
function getMiddlewareMatch(middlewareManifest2, functionsManifest) {
  if (functionsManifest?.functions?.["/_middleware"]) {
    return functionsManifest.functions["/_middleware"].matchers?.map(({ regexp }) => new RegExp(regexp)) ?? [/.*/];
  }
  const rootMiddleware = middlewareManifest2.middleware["/"];
  if (!rootMiddleware?.matchers)
    return [];
  return rootMiddleware.matchers.map(({ regexp }) => new RegExp(regexp));
}
__name(getMiddlewareMatch, "getMiddlewareMatch");
function escapeRegex(str, { isPath } = {}) {
  const result = str.replaceAll("(.)", "_\xB51_").replaceAll("(..)", "_\xB52_").replaceAll("(...)", "_\xB53_");
  return isPath ? result : result.replaceAll("+", "_\xB54_");
}
__name(escapeRegex, "escapeRegex");
function unescapeRegex(str) {
  return str.replaceAll("_\xB51_", "(.)").replaceAll("_\xB52_", "(..)").replaceAll("_\xB53_", "(...)").replaceAll("_\xB54_", "+");
}
__name(unescapeRegex, "unescapeRegex");
function convertBodyToReadableStream(method, body) {
  if (method === "GET" || method === "HEAD")
    return void 0;
  if (!body)
    return void 0;
  return new ReadableStream22({
    start(controller) {
      controller.enqueue(body);
      controller.close();
    }
  });
}
__name(convertBodyToReadableStream, "convertBodyToReadableStream");
var CommonHeaders;
(function(CommonHeaders2) {
  CommonHeaders2["CACHE_CONTROL"] = "cache-control";
  CommonHeaders2["NEXT_CACHE"] = "x-nextjs-cache";
})(CommonHeaders || (CommonHeaders = {}));
function normalizeLocationHeader(location, baseUrl, encodeQuery = false) {
  if (!URL.canParse(location)) {
    return location;
  }
  const locationURL = new URL(location);
  const origin = new URL(baseUrl).origin;
  let search = locationURL.search;
  if (encodeQuery && search) {
    search = `?${stringifyQs(parseQs(search.slice(1)))}`;
  }
  const href = `${locationURL.origin}${locationURL.pathname}${search}${locationURL.hash}`;
  if (locationURL.origin === origin) {
    return href.slice(origin.length);
  }
  return href;
}
__name(normalizeLocationHeader, "normalizeLocationHeader");
init_logger();
init_stream();
init_logger();
async function hasBeenRevalidated(key, tags, cacheEntry) {
  if (globalThis.openNextConfig.dangerous?.disableTagCache) {
    return false;
  }
  const value = cacheEntry.value;
  if (!value) {
    return true;
  }
  if ("type" in cacheEntry && cacheEntry.type === "page") {
    return false;
  }
  const lastModified = cacheEntry.lastModified ?? Date.now();
  if (globalThis.tagCache.mode === "nextMode") {
    return tags.length === 0 ? false : await globalThis.tagCache.hasBeenRevalidated(tags, lastModified);
  }
  const _lastModified = await globalThis.tagCache.getLastModified(key, lastModified);
  return _lastModified === -1;
}
__name(hasBeenRevalidated, "hasBeenRevalidated");
function getTagsFromValue(value) {
  if (!value) {
    return [];
  }
  try {
    const cacheTags = value.meta?.headers?.["x-next-cache-tags"]?.split(",") ?? [];
    delete value.meta?.headers?.["x-next-cache-tags"];
    return cacheTags;
  } catch (e) {
    return [];
  }
}
__name(getTagsFromValue, "getTagsFromValue");
init_logger();
var CACHE_ONE_YEAR = 60 * 60 * 24 * 365;
var CACHE_ONE_MONTH = 60 * 60 * 24 * 30;
var VARY_HEADER = "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch, Next-Url";
async function computeCacheControl(path3, body, host, revalidate, lastModified) {
  let finalRevalidate = CACHE_ONE_YEAR;
  const existingRoute = Object.entries(PrerenderManifest.routes).find((p) => p[0] === path3)?.[1];
  if (revalidate === void 0 && existingRoute) {
    finalRevalidate = existingRoute.initialRevalidateSeconds === false ? CACHE_ONE_YEAR : existingRoute.initialRevalidateSeconds;
  } else if (revalidate !== void 0) {
    finalRevalidate = revalidate === false ? CACHE_ONE_YEAR : revalidate;
  }
  const age = Math.round((Date.now() - (lastModified ?? 0)) / 1e3);
  const hash = /* @__PURE__ */ __name((str) => createHash("md5").update(str).digest("hex"), "hash");
  const etag = hash(body);
  if (revalidate === 0) {
    return {
      "cache-control": "private, no-cache, no-store, max-age=0, must-revalidate",
      "x-opennext-cache": "ERROR",
      etag
    };
  }
  if (finalRevalidate !== CACHE_ONE_YEAR) {
    const sMaxAge = Math.max(finalRevalidate - age, 1);
    debug3("sMaxAge", {
      finalRevalidate,
      age,
      lastModified,
      revalidate
    });
    const isStale = sMaxAge === 1;
    if (isStale) {
      let url = NextConfig.trailingSlash ? `${path3}/` : path3;
      if (NextConfig.basePath) {
        url = `${NextConfig.basePath}${url}`;
      }
      await globalThis.queue.send({
        MessageBody: {
          host,
          url,
          eTag: etag,
          lastModified: lastModified ?? Date.now()
        },
        MessageDeduplicationId: hash(`${path3}-${lastModified}-${etag}`),
        MessageGroupId: generateMessageGroupId(path3)
      });
    }
    return {
      "cache-control": `s-maxage=${sMaxAge}, stale-while-revalidate=${CACHE_ONE_MONTH}`,
      "x-opennext-cache": isStale ? "STALE" : "HIT",
      etag
    };
  }
  return {
    "cache-control": `s-maxage=${CACHE_ONE_YEAR}, stale-while-revalidate=${CACHE_ONE_MONTH}`,
    "x-opennext-cache": "HIT",
    etag
  };
}
__name(computeCacheControl, "computeCacheControl");
async function generateResult(event, localizedPath, cachedValue, lastModified) {
  debug3("Returning result from experimental cache");
  let body = "";
  let type = "application/octet-stream";
  let isDataRequest = false;
  switch (cachedValue.type) {
    case "app":
      isDataRequest = Boolean(event.headers.rsc);
      body = isDataRequest ? cachedValue.rsc : cachedValue.html;
      type = isDataRequest ? "text/x-component" : "text/html; charset=utf-8";
      break;
    case "page":
      isDataRequest = Boolean(event.query.__nextDataReq);
      body = isDataRequest ? JSON.stringify(cachedValue.json) : cachedValue.html;
      type = isDataRequest ? "application/json" : "text/html; charset=utf-8";
      break;
  }
  const cacheControl = await computeCacheControl(localizedPath, body, event.headers.host, cachedValue.revalidate, lastModified);
  return {
    type: "core",
    // Sometimes other status codes can be cached, like 404. For these cases, we should return the correct status code
    // Also set the status code to the rewriteStatusCode if defined
    // This can happen in handleMiddleware in routingHandler.
    // `NextResponse.rewrite(url, { status: xxx})
    // The rewrite status code should take precedence over the cached one
    statusCode: event.rewriteStatusCode ?? cachedValue.meta?.status ?? 200,
    body: toReadableStream(body, false),
    isBase64Encoded: false,
    headers: {
      ...cacheControl,
      "content-type": type,
      ...cachedValue.meta?.headers,
      vary: VARY_HEADER
    }
  };
}
__name(generateResult, "generateResult");
function escapePathDelimiters(segment, escapeEncoded) {
  return segment.replace(new RegExp(`([/#?]${escapeEncoded ? "|%(2f|23|3f|5c)" : ""})`, "gi"), (char) => encodeURIComponent(char));
}
__name(escapePathDelimiters, "escapePathDelimiters");
function decodePathParams(pathname) {
  return pathname.split("/").map((segment) => {
    try {
      return escapePathDelimiters(decodeURIComponent(segment), true);
    } catch (e) {
      return segment;
    }
  }).join("/");
}
__name(decodePathParams, "decodePathParams");
async function cacheInterceptor(event) {
  if (Boolean(event.headers["next-action"]) || Boolean(event.headers["x-prerender-revalidate"]))
    return event;
  const cookies = event.headers.cookie || "";
  const hasPreviewData = cookies.includes("__prerender_bypass") || cookies.includes("__next_preview_data");
  if (hasPreviewData) {
    debug3("Preview mode detected, passing through to handler");
    return event;
  }
  let localizedPath = localizePath(event);
  if (NextConfig.basePath) {
    localizedPath = localizedPath.replace(NextConfig.basePath, "");
  }
  localizedPath = localizedPath.replace(/\/$/, "");
  localizedPath = decodePathParams(localizedPath);
  debug3("Checking cache for", localizedPath, PrerenderManifest);
  const isISR = Object.keys(PrerenderManifest.routes).includes(localizedPath ?? "/") || Object.values(PrerenderManifest.dynamicRoutes).some((dr) => new RegExp(dr.routeRegex).test(localizedPath));
  debug3("isISR", isISR);
  if (isISR) {
    try {
      const cachedData = await globalThis.incrementalCache.get(localizedPath ?? "/index");
      debug3("cached data in interceptor", cachedData);
      if (!cachedData?.value) {
        return event;
      }
      if (cachedData.value?.type === "app" || cachedData.value?.type === "route") {
        const tags = getTagsFromValue(cachedData.value);
        const _hasBeenRevalidated = cachedData.shouldBypassTagCache ? false : await hasBeenRevalidated(localizedPath, tags, cachedData);
        if (_hasBeenRevalidated) {
          return event;
        }
      }
      const host = event.headers.host;
      switch (cachedData?.value?.type) {
        case "app":
        case "page":
          return generateResult(event, localizedPath, cachedData.value, cachedData.lastModified);
        case "redirect": {
          const cacheControl = await computeCacheControl(localizedPath, "", host, cachedData.value.revalidate, cachedData.lastModified);
          return {
            type: "core",
            statusCode: cachedData.value.meta?.status ?? 307,
            body: emptyReadableStream(),
            headers: {
              ...cachedData.value.meta?.headers ?? {},
              ...cacheControl
            },
            isBase64Encoded: false
          };
        }
        case "route": {
          const cacheControl = await computeCacheControl(localizedPath, cachedData.value.body, host, cachedData.value.revalidate, cachedData.lastModified);
          const isBinary = isBinaryContentType(String(cachedData.value.meta?.headers?.["content-type"]));
          return {
            type: "core",
            statusCode: event.rewriteStatusCode ?? cachedData.value.meta?.status ?? 200,
            body: toReadableStream(cachedData.value.body, isBinary),
            headers: {
              ...cacheControl,
              ...cachedData.value.meta?.headers,
              vary: VARY_HEADER
            },
            isBase64Encoded: isBinary
          };
        }
        default:
          return event;
      }
    } catch (e) {
      debug3("Error while fetching cache", e);
      return event;
    }
  }
  return event;
}
__name(cacheInterceptor, "cacheInterceptor");
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count3 = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count3--;
          if (count3 === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count3++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count3)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse2(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path3 = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path3 += prefix;
        prefix = "";
      }
      if (path3) {
        result.push(path3);
        path3 = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path3 += value;
      continue;
    }
    if (path3) {
      result.push(path3);
      path3 = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse2, "parse2");
function compile(str, options) {
  return tokensToFunction(parse2(str, options), options);
}
__name(compile, "compile");
function tokensToFunction(tokens, options) {
  if (options === void 0) {
    options = {};
  }
  var reFlags = flags(options);
  var _a = options.encode, encode = _a === void 0 ? function(x) {
    return x;
  } : _a, _b = options.validate, validate = _b === void 0 ? true : _b;
  var matches = tokens.map(function(token) {
    if (typeof token === "object") {
      return new RegExp("^(?:".concat(token.pattern, ")$"), reFlags);
    }
  });
  return function(data) {
    var path3 = "";
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if (typeof token === "string") {
        path3 += token;
        continue;
      }
      var value = data ? data[token.name] : void 0;
      var optional = token.modifier === "?" || token.modifier === "*";
      var repeat = token.modifier === "*" || token.modifier === "+";
      if (Array.isArray(value)) {
        if (!repeat) {
          throw new TypeError('Expected "'.concat(token.name, '" to not repeat, but got an array'));
        }
        if (value.length === 0) {
          if (optional)
            continue;
          throw new TypeError('Expected "'.concat(token.name, '" to not be empty'));
        }
        for (var j = 0; j < value.length; j++) {
          var segment = encode(value[j], token);
          if (validate && !matches[i].test(segment)) {
            throw new TypeError('Expected all "'.concat(token.name, '" to match "').concat(token.pattern, '", but got "').concat(segment, '"'));
          }
          path3 += token.prefix + segment + token.suffix;
        }
        continue;
      }
      if (typeof value === "string" || typeof value === "number") {
        var segment = encode(String(value), token);
        if (validate && !matches[i].test(segment)) {
          throw new TypeError('Expected "'.concat(token.name, '" to match "').concat(token.pattern, '", but got "').concat(segment, '"'));
        }
        path3 += token.prefix + segment + token.suffix;
        continue;
      }
      if (optional)
        continue;
      var typeOfMessage = repeat ? "an array" : "a string";
      throw new TypeError('Expected "'.concat(token.name, '" to be ').concat(typeOfMessage));
    }
    return path3;
  };
}
__name(tokensToFunction, "tokensToFunction");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path3 = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path: path3, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path3, keys) {
  if (!keys)
    return path3;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path3.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path3.source);
  }
  return path3;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path3) {
    return pathToRegexp(path3, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path3, keys, options) {
  return tokensToRegexp(parse2(path3, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path3, keys, options) {
  if (path3 instanceof RegExp)
    return regexpToRegexp(path3, keys);
  if (Array.isArray(path3))
    return arrayToRegexp(path3, keys, options);
  return stringToRegexp(path3, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
function normalizeRepeatedSlashes(url) {
  const urlNoQuery = url.host + url.pathname;
  return `${url.protocol}//${urlNoQuery.replace(/\\/g, "/").replace(/\/\/+/g, "/")}${url.search}`;
}
__name(normalizeRepeatedSlashes, "normalizeRepeatedSlashes");
init_stream();
init_logger();
var optionalLocalePrefixRegex = `^/(?:${RoutesManifest.locales.map((locale) => `${locale}/?`).join("|")})?`;
var optionalBasepathPrefixRegex = RoutesManifest.basePath ? `^${RoutesManifest.basePath}/?` : "^/";
var optionalPrefix = optionalLocalePrefixRegex.replace("^/", optionalBasepathPrefixRegex);
function routeMatcher(routeDefinitions) {
  const regexp = routeDefinitions.map((route) => ({
    page: route.page,
    regexp: new RegExp(route.regex.replace("^/", optionalPrefix))
  }));
  const appPathsSet = /* @__PURE__ */ new Set();
  const routePathsSet = /* @__PURE__ */ new Set();
  for (const [k, v] of Object.entries(AppPathRoutesManifest)) {
    if (k.endsWith("page")) {
      appPathsSet.add(v);
    } else if (k.endsWith("route")) {
      routePathsSet.add(v);
    }
  }
  return /* @__PURE__ */ __name(function matchRoute(path3) {
    const foundRoutes = regexp.filter((route) => route.regexp.test(path3));
    return foundRoutes.map((foundRoute) => {
      let routeType = "page";
      if (appPathsSet.has(foundRoute.page)) {
        routeType = "app";
      } else if (routePathsSet.has(foundRoute.page)) {
        routeType = "route";
      }
      return {
        route: foundRoute.page,
        type: routeType
      };
    });
  }, "matchRoute");
}
__name(routeMatcher, "routeMatcher");
var staticRouteMatcher = routeMatcher([
  ...RoutesManifest.routes.static,
  ...getStaticAPIRoutes()
]);
var dynamicRouteMatcher = routeMatcher(RoutesManifest.routes.dynamic);
function getStaticAPIRoutes() {
  const createRouteDefinition = /* @__PURE__ */ __name((route) => ({
    page: route,
    regex: `^${route}(?:/)?$`
  }), "createRouteDefinition");
  const dynamicRoutePages = new Set(RoutesManifest.routes.dynamic.map(({ page }) => page));
  const pagesStaticAPIRoutes = Object.keys(PagesManifest).filter((route) => route.startsWith("/api/") && !dynamicRoutePages.has(route)).map(createRouteDefinition);
  const appPathsStaticAPIRoutes = Object.values(AppPathRoutesManifest).filter((route) => (route.startsWith("/api/") || route === "/api") && !dynamicRoutePages.has(route)).map(createRouteDefinition);
  return [...pagesStaticAPIRoutes, ...appPathsStaticAPIRoutes];
}
__name(getStaticAPIRoutes, "getStaticAPIRoutes");
var routeHasMatcher = /* @__PURE__ */ __name((headers, cookies, query) => (redirect) => {
  switch (redirect.type) {
    case "header":
      return !!headers?.[redirect.key.toLowerCase()] && new RegExp(redirect.value ?? "").test(headers[redirect.key.toLowerCase()] ?? "");
    case "cookie":
      return !!cookies?.[redirect.key] && new RegExp(redirect.value ?? "").test(cookies[redirect.key] ?? "");
    case "query":
      return query[redirect.key] && Array.isArray(redirect.value) ? redirect.value.reduce((prev, current) => prev || new RegExp(current).test(query[redirect.key]), false) : new RegExp(redirect.value ?? "").test(query[redirect.key] ?? "");
    case "host":
      return headers?.host !== "" && new RegExp(redirect.value ?? "").test(headers.host);
    default:
      return false;
  }
}, "routeHasMatcher");
function checkHas(matcher, has, inverted = false) {
  return has ? has.reduce((acc, cur) => {
    if (acc === false)
      return false;
    return inverted ? !matcher(cur) : matcher(cur);
  }, true) : true;
}
__name(checkHas, "checkHas");
var getParamsFromSource = /* @__PURE__ */ __name((source) => (value) => {
  debug3("value", value);
  const _match = source(value);
  return _match ? _match.params : {};
}, "getParamsFromSource");
var computeParamHas = /* @__PURE__ */ __name((headers, cookies, query) => (has) => {
  if (!has.value)
    return {};
  const matcher = new RegExp(`^${has.value}$`);
  const fromSource = /* @__PURE__ */ __name((value) => {
    const matches = value.match(matcher);
    return matches?.groups ?? {};
  }, "fromSource");
  switch (has.type) {
    case "header":
      return fromSource(headers[has.key.toLowerCase()] ?? "");
    case "cookie":
      return fromSource(cookies[has.key] ?? "");
    case "query":
      return Array.isArray(query[has.key]) ? fromSource(query[has.key].join(",")) : fromSource(query[has.key] ?? "");
    case "host":
      return fromSource(headers.host ?? "");
  }
}, "computeParamHas");
function convertMatch(match2, toDestination, destination) {
  if (!match2) {
    return destination;
  }
  const { params } = match2;
  const isUsingParams = Object.keys(params).length > 0;
  return isUsingParams ? toDestination(params) : destination;
}
__name(convertMatch, "convertMatch");
function getNextConfigHeaders(event, configHeaders) {
  if (!configHeaders) {
    return {};
  }
  const matcher = routeHasMatcher(event.headers, event.cookies, event.query);
  const requestHeaders = {};
  const localizedRawPath = localizePath(event);
  for (const { headers, has, missing, regex, source, locale } of configHeaders) {
    const path3 = locale === false ? event.rawPath : localizedRawPath;
    if (new RegExp(regex).test(path3) && checkHas(matcher, has) && checkHas(matcher, missing, true)) {
      const fromSource = match(source);
      const _match = fromSource(path3);
      headers.forEach((h) => {
        try {
          const key = convertMatch(_match, compile(h.key), h.key);
          const value = convertMatch(_match, compile(h.value), h.value);
          requestHeaders[key] = value;
        } catch {
          debug3(`Error matching header ${h.key} with value ${h.value}`);
          requestHeaders[h.key] = h.value;
        }
      });
    }
  }
  return requestHeaders;
}
__name(getNextConfigHeaders, "getNextConfigHeaders");
function handleRewrites(event, rewrites) {
  const { rawPath, headers, query, cookies, url } = event;
  const localizedRawPath = localizePath(event);
  const matcher = routeHasMatcher(headers, cookies, query);
  const computeHas = computeParamHas(headers, cookies, query);
  const rewrite = rewrites.find((route) => {
    const path3 = route.locale === false ? rawPath : localizedRawPath;
    return new RegExp(route.regex).test(path3) && checkHas(matcher, route.has) && checkHas(matcher, route.missing, true);
  });
  let finalQuery = query;
  let rewrittenUrl = url;
  const isExternalRewrite = isExternal(rewrite?.destination);
  debug3("isExternalRewrite", isExternalRewrite);
  if (rewrite) {
    const { pathname, protocol, hostname, queryString } = getUrlParts(rewrite.destination, isExternalRewrite);
    const pathToUse = rewrite.locale === false ? rawPath : localizedRawPath;
    debug3("urlParts", { pathname, protocol, hostname, queryString });
    const toDestinationPath = compile(escapeRegex(pathname, { isPath: true }));
    const toDestinationHost = compile(escapeRegex(hostname));
    const toDestinationQuery = compile(escapeRegex(queryString));
    const params = {
      // params for the source
      ...getParamsFromSource(match(escapeRegex(rewrite.source, { isPath: true })))(pathToUse),
      // params for the has
      ...rewrite.has?.reduce((acc, cur) => {
        return Object.assign(acc, computeHas(cur));
      }, {}),
      // params for the missing
      ...rewrite.missing?.reduce((acc, cur) => {
        return Object.assign(acc, computeHas(cur));
      }, {})
    };
    const isUsingParams = Object.keys(params).length > 0;
    let rewrittenQuery = queryString;
    let rewrittenHost = hostname;
    let rewrittenPath = pathname;
    if (isUsingParams) {
      rewrittenPath = unescapeRegex(toDestinationPath(params));
      rewrittenHost = unescapeRegex(toDestinationHost(params));
      rewrittenQuery = unescapeRegex(toDestinationQuery(params));
    }
    if (NextConfig.i18n && !isExternalRewrite) {
      const strippedPathLocale = rewrittenPath.replace(new RegExp(`^/(${NextConfig.i18n.locales.join("|")})`), "");
      if (strippedPathLocale.startsWith("/api/")) {
        rewrittenPath = strippedPathLocale;
      }
    }
    rewrittenUrl = isExternalRewrite ? `${protocol}//${rewrittenHost}${rewrittenPath}` : new URL(rewrittenPath, event.url).href;
    finalQuery = {
      ...query,
      ...convertFromQueryString(rewrittenQuery)
    };
    rewrittenUrl += convertToQueryString(finalQuery);
    debug3("rewrittenUrl", { rewrittenUrl, finalQuery, isUsingParams });
  }
  return {
    internalEvent: {
      ...event,
      query: finalQuery,
      rawPath: new URL(rewrittenUrl).pathname,
      url: rewrittenUrl
    },
    __rewrite: rewrite,
    isExternalRewrite
  };
}
__name(handleRewrites, "handleRewrites");
function handleRepeatedSlashRedirect(event) {
  if (event.rawPath.match(/(\\|\/\/)/)) {
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: normalizeRepeatedSlashes(new URL(event.url))
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
  return false;
}
__name(handleRepeatedSlashRedirect, "handleRepeatedSlashRedirect");
function handleTrailingSlashRedirect(event) {
  const url = new URL(event.rawPath, "http://localhost");
  if (
    // Someone is trying to redirect to a different origin, let's not do that
    url.host !== "localhost" || NextConfig.skipTrailingSlashRedirect || // We should not apply trailing slash redirect to API routes
    event.rawPath.startsWith("/api/")
  ) {
    return false;
  }
  const emptyBody = emptyReadableStream();
  if (NextConfig.trailingSlash && !event.headers["x-nextjs-data"] && !event.rawPath.endsWith("/") && !event.rawPath.match(/[\w-]+\.[\w]+$/g)) {
    const headersLocation = event.url.split("?");
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: `${headersLocation[0]}/${headersLocation[1] ? `?${headersLocation[1]}` : ""}`
      },
      body: emptyBody,
      isBase64Encoded: false
    };
  }
  if (!NextConfig.trailingSlash && event.rawPath.endsWith("/") && event.rawPath !== "/") {
    const headersLocation = event.url.split("?");
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: `${headersLocation[0].replace(/\/$/, "")}${headersLocation[1] ? `?${headersLocation[1]}` : ""}`
      },
      body: emptyBody,
      isBase64Encoded: false
    };
  }
  return false;
}
__name(handleTrailingSlashRedirect, "handleTrailingSlashRedirect");
function handleRedirects(event, redirects) {
  const repeatedSlashRedirect = handleRepeatedSlashRedirect(event);
  if (repeatedSlashRedirect)
    return repeatedSlashRedirect;
  const trailingSlashRedirect = handleTrailingSlashRedirect(event);
  if (trailingSlashRedirect)
    return trailingSlashRedirect;
  const localeRedirect = handleLocaleRedirect(event);
  if (localeRedirect)
    return localeRedirect;
  const { internalEvent, __rewrite } = handleRewrites(event, redirects.filter((r) => !r.internal));
  if (__rewrite && !__rewrite.internal) {
    return {
      type: event.type,
      statusCode: __rewrite.statusCode ?? 308,
      headers: {
        Location: internalEvent.url
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
}
__name(handleRedirects, "handleRedirects");
function fixDataPage(internalEvent, buildId) {
  const { rawPath, query } = internalEvent;
  const basePath = NextConfig.basePath ?? "";
  const dataPattern = `${basePath}/_next/data/${buildId}`;
  if (rawPath.startsWith("/_next/data") && !rawPath.startsWith(dataPattern)) {
    return {
      type: internalEvent.type,
      statusCode: 404,
      body: toReadableStream("{}"),
      headers: {
        "Content-Type": "application/json"
      },
      isBase64Encoded: false
    };
  }
  if (rawPath.startsWith(dataPattern) && rawPath.endsWith(".json")) {
    const newPath = `${basePath}${rawPath.slice(dataPattern.length, -".json".length).replace(/^\/index$/, "/")}`;
    query.__nextDataReq = "1";
    return {
      ...internalEvent,
      rawPath: newPath,
      query,
      url: new URL(`${newPath}${convertToQueryString(query)}`, internalEvent.url).href
    };
  }
  return internalEvent;
}
__name(fixDataPage, "fixDataPage");
function handleFallbackFalse(internalEvent, prerenderManifest) {
  const { rawPath } = internalEvent;
  const { dynamicRoutes, routes } = prerenderManifest;
  const prerenderedFallbackRoutes = Object.entries(dynamicRoutes).filter(([, { fallback }]) => fallback === false);
  const routeFallback = prerenderedFallbackRoutes.some(([, { routeRegex }]) => {
    const routeRegexExp = new RegExp(routeRegex);
    return routeRegexExp.test(rawPath);
  });
  const locales = NextConfig.i18n?.locales;
  const routesAlreadyHaveLocale = locales?.includes(rawPath.split("/")[1]) || // If we don't use locales, we don't need to add the default locale
  locales === void 0;
  let localizedPath = routesAlreadyHaveLocale ? rawPath : `/${NextConfig.i18n?.defaultLocale}${rawPath}`;
  if (
    // Not if localizedPath is "/" tho, because that would not make it find `isPregenerated` below since it would be try to match an empty string.
    localizedPath !== "/" && NextConfig.trailingSlash && localizedPath.endsWith("/")
  ) {
    localizedPath = localizedPath.slice(0, -1);
  }
  const matchedStaticRoute = staticRouteMatcher(localizedPath);
  const prerenderedFallbackRoutesName = prerenderedFallbackRoutes.map(([name]) => name);
  const matchedDynamicRoute = dynamicRouteMatcher(localizedPath).filter(({ route }) => !prerenderedFallbackRoutesName.includes(route));
  const isPregenerated = Object.keys(routes).includes(localizedPath);
  if (routeFallback && !isPregenerated && matchedStaticRoute.length === 0 && matchedDynamicRoute.length === 0) {
    return {
      event: {
        ...internalEvent,
        rawPath: "/404",
        url: constructNextUrl(internalEvent.url, "/404"),
        headers: {
          ...internalEvent.headers,
          "x-invoke-status": "404"
        }
      },
      isISR: false
    };
  }
  return {
    event: internalEvent,
    isISR: routeFallback || isPregenerated
  };
}
__name(handleFallbackFalse, "handleFallbackFalse");
init_stream();
init_utils2();
var middlewareManifest = MiddlewareManifest;
var functionsConfigManifest = FunctionsConfigManifest;
var middleMatch = getMiddlewareMatch(middlewareManifest, functionsConfigManifest);
var REDIRECTS = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
function defaultMiddlewareLoader() {
  return Promise.resolve().then(() => (init_edgeFunctionHandler(), edgeFunctionHandler_exports));
}
__name(defaultMiddlewareLoader, "defaultMiddlewareLoader");
async function handleMiddleware(internalEvent, initialSearch, middlewareLoader = defaultMiddlewareLoader) {
  const headers = internalEvent.headers;
  if (headers["x-isr"] && headers["x-prerender-revalidate"] === PrerenderManifest.preview.previewModeId)
    return internalEvent;
  const normalizedPath = localizePath(internalEvent);
  const hasMatch = middleMatch.some((r) => r.test(normalizedPath));
  if (!hasMatch)
    return internalEvent;
  const initialUrl = new URL(normalizedPath, internalEvent.url);
  initialUrl.search = initialSearch;
  const url = initialUrl.href;
  const middleware = await middlewareLoader();
  const result = await middleware.default({
    // `geo` is pre Next 15.
    geo: {
      // The city name is percent-encoded.
      // See https://github.com/vercel/vercel/blob/4cb6143/packages/functions/src/headers.ts#L94C19-L94C37
      city: decodeURIComponent(headers["x-open-next-city"]),
      country: headers["x-open-next-country"],
      region: headers["x-open-next-region"],
      latitude: headers["x-open-next-latitude"],
      longitude: headers["x-open-next-longitude"]
    },
    headers,
    method: internalEvent.method || "GET",
    nextConfig: {
      basePath: NextConfig.basePath,
      i18n: NextConfig.i18n,
      trailingSlash: NextConfig.trailingSlash
    },
    url,
    body: convertBodyToReadableStream(internalEvent.method, internalEvent.body)
  });
  const statusCode = result.status;
  const responseHeaders = result.headers;
  const reqHeaders = {};
  const resHeaders = {};
  const filteredHeaders = [
    "x-middleware-override-headers",
    "x-middleware-next",
    "x-middleware-rewrite",
    // We need to drop `content-encoding` because it will be decoded
    "content-encoding"
  ];
  const xMiddlewareKey = "x-middleware-request-";
  responseHeaders.forEach((value, key) => {
    if (key.startsWith(xMiddlewareKey)) {
      const k = key.substring(xMiddlewareKey.length);
      reqHeaders[k] = value;
    } else {
      if (filteredHeaders.includes(key.toLowerCase()))
        return;
      if (key.toLowerCase() === "set-cookie") {
        resHeaders[key] = resHeaders[key] ? [...resHeaders[key], value] : [value];
      } else if (REDIRECTS.has(statusCode) && key.toLowerCase() === "location") {
        resHeaders[key] = normalizeLocationHeader(value, internalEvent.url);
      } else {
        resHeaders[key] = value;
      }
    }
  });
  const rewriteUrl = responseHeaders.get("x-middleware-rewrite");
  let isExternalRewrite = false;
  let middlewareQuery = internalEvent.query;
  let newUrl = internalEvent.url;
  if (rewriteUrl) {
    newUrl = rewriteUrl;
    if (isExternal(newUrl, internalEvent.headers.host)) {
      isExternalRewrite = true;
    } else {
      const rewriteUrlObject = new URL(rewriteUrl);
      middlewareQuery = getQueryFromSearchParams(rewriteUrlObject.searchParams);
      if ("__nextDataReq" in internalEvent.query) {
        middlewareQuery.__nextDataReq = internalEvent.query.__nextDataReq;
      }
    }
  }
  if (!rewriteUrl && !responseHeaders.get("x-middleware-next")) {
    const body = result.body ?? emptyReadableStream();
    return {
      type: internalEvent.type,
      statusCode,
      headers: resHeaders,
      body,
      isBase64Encoded: false
    };
  }
  return {
    responseHeaders: resHeaders,
    url: newUrl,
    rawPath: new URL(newUrl).pathname,
    type: internalEvent.type,
    headers: { ...internalEvent.headers, ...reqHeaders },
    body: internalEvent.body,
    method: internalEvent.method,
    query: middlewareQuery,
    cookies: internalEvent.cookies,
    remoteAddress: internalEvent.remoteAddress,
    isExternalRewrite,
    rewriteStatusCode: rewriteUrl && !isExternalRewrite ? statusCode : void 0
  };
}
__name(handleMiddleware, "handleMiddleware");
var MIDDLEWARE_HEADER_PREFIX = "x-middleware-response-";
var MIDDLEWARE_HEADER_PREFIX_LEN = MIDDLEWARE_HEADER_PREFIX.length;
var INTERNAL_HEADER_PREFIX = "x-opennext-";
var INTERNAL_HEADER_INITIAL_URL = `${INTERNAL_HEADER_PREFIX}initial-url`;
var INTERNAL_HEADER_LOCALE = `${INTERNAL_HEADER_PREFIX}locale`;
var INTERNAL_HEADER_RESOLVED_ROUTES = `${INTERNAL_HEADER_PREFIX}resolved-routes`;
var INTERNAL_HEADER_REWRITE_STATUS_CODE = `${INTERNAL_HEADER_PREFIX}rewrite-status-code`;
var INTERNAL_EVENT_REQUEST_ID = `${INTERNAL_HEADER_PREFIX}request-id`;
var geoHeaderToNextHeader = {
  "x-open-next-city": "x-vercel-ip-city",
  "x-open-next-country": "x-vercel-ip-country",
  "x-open-next-region": "x-vercel-ip-country-region",
  "x-open-next-latitude": "x-vercel-ip-latitude",
  "x-open-next-longitude": "x-vercel-ip-longitude"
};
function applyMiddlewareHeaders(eventOrResult, middlewareHeaders) {
  const isResult = isInternalResult(eventOrResult);
  const headers = eventOrResult.headers;
  const keyPrefix = isResult ? "" : MIDDLEWARE_HEADER_PREFIX;
  Object.entries(middlewareHeaders).forEach(([key, value]) => {
    if (value) {
      headers[keyPrefix + key] = Array.isArray(value) ? value.join(",") : value;
    }
  });
}
__name(applyMiddlewareHeaders, "applyMiddlewareHeaders");
async function routingHandler(event, { assetResolver }) {
  try {
    for (const [openNextGeoName, nextGeoName] of Object.entries(geoHeaderToNextHeader)) {
      const value = event.headers[openNextGeoName];
      if (value) {
        event.headers[nextGeoName] = value;
      }
    }
    for (const key of Object.keys(event.headers)) {
      if (key.startsWith(INTERNAL_HEADER_PREFIX) || key.startsWith(MIDDLEWARE_HEADER_PREFIX)) {
        delete event.headers[key];
      }
    }
    let headers = getNextConfigHeaders(event, ConfigHeaders);
    let eventOrResult = fixDataPage(event, BuildId);
    if (isInternalResult(eventOrResult)) {
      return eventOrResult;
    }
    const redirect = handleRedirects(eventOrResult, RoutesManifest.redirects);
    if (redirect) {
      redirect.headers.Location = normalizeLocationHeader(redirect.headers.Location, event.url, true);
      debug3("redirect", redirect);
      return redirect;
    }
    const middlewareEventOrResult = await handleMiddleware(
      eventOrResult,
      // We need to pass the initial search without any decoding
      // TODO: we'd need to refactor InternalEvent to include the initial querystring directly
      // Should be done in another PR because it is a breaking change
      new URL(event.url).search
    );
    if (isInternalResult(middlewareEventOrResult)) {
      return middlewareEventOrResult;
    }
    const middlewareHeadersPrioritized = globalThis.openNextConfig.dangerous?.middlewareHeadersOverrideNextConfigHeaders ?? false;
    if (middlewareHeadersPrioritized) {
      headers = {
        ...headers,
        ...middlewareEventOrResult.responseHeaders
      };
    } else {
      headers = {
        ...middlewareEventOrResult.responseHeaders,
        ...headers
      };
    }
    let isExternalRewrite = middlewareEventOrResult.isExternalRewrite ?? false;
    eventOrResult = middlewareEventOrResult;
    if (!isExternalRewrite) {
      const beforeRewrite = handleRewrites(eventOrResult, RoutesManifest.rewrites.beforeFiles);
      eventOrResult = beforeRewrite.internalEvent;
      isExternalRewrite = beforeRewrite.isExternalRewrite;
      if (!isExternalRewrite) {
        const assetResult = await assetResolver?.maybeGetAssetResult?.(eventOrResult);
        if (assetResult) {
          applyMiddlewareHeaders(assetResult, headers);
          return assetResult;
        }
      }
    }
    const foundStaticRoute = staticRouteMatcher(eventOrResult.rawPath);
    const isStaticRoute = !isExternalRewrite && foundStaticRoute.length > 0;
    if (!(isStaticRoute || isExternalRewrite)) {
      const afterRewrite = handleRewrites(eventOrResult, RoutesManifest.rewrites.afterFiles);
      eventOrResult = afterRewrite.internalEvent;
      isExternalRewrite = afterRewrite.isExternalRewrite;
    }
    let isISR = false;
    if (!isExternalRewrite) {
      const fallbackResult = handleFallbackFalse(eventOrResult, PrerenderManifest);
      eventOrResult = fallbackResult.event;
      isISR = fallbackResult.isISR;
    }
    const foundDynamicRoute = dynamicRouteMatcher(eventOrResult.rawPath);
    const isDynamicRoute = !isExternalRewrite && foundDynamicRoute.length > 0;
    if (!(isDynamicRoute || isStaticRoute || isExternalRewrite)) {
      const fallbackRewrites = handleRewrites(eventOrResult, RoutesManifest.rewrites.fallback);
      eventOrResult = fallbackRewrites.internalEvent;
      isExternalRewrite = fallbackRewrites.isExternalRewrite;
    }
    const isNextImageRoute = eventOrResult.rawPath.startsWith("/_next/image");
    const isRouteFoundBeforeAllRewrites = isStaticRoute || isDynamicRoute || isExternalRewrite;
    if (!(isRouteFoundBeforeAllRewrites || isNextImageRoute || // We need to check again once all rewrites have been applied
    staticRouteMatcher(eventOrResult.rawPath).length > 0 || dynamicRouteMatcher(eventOrResult.rawPath).length > 0)) {
      eventOrResult = {
        ...eventOrResult,
        rawPath: "/404",
        url: constructNextUrl(eventOrResult.url, "/404"),
        headers: {
          ...eventOrResult.headers,
          "x-middleware-response-cache-control": "private, no-cache, no-store, max-age=0, must-revalidate"
        }
      };
    }
    if (globalThis.openNextConfig.dangerous?.enableCacheInterception && !isInternalResult(eventOrResult)) {
      debug3("Cache interception enabled");
      eventOrResult = await cacheInterceptor(eventOrResult);
      if (isInternalResult(eventOrResult)) {
        applyMiddlewareHeaders(eventOrResult, headers);
        return eventOrResult;
      }
    }
    applyMiddlewareHeaders(eventOrResult, headers);
    const resolvedRoutes = [
      ...foundStaticRoute,
      ...foundDynamicRoute
    ];
    debug3("resolvedRoutes", resolvedRoutes);
    return {
      internalEvent: eventOrResult,
      isExternalRewrite,
      origin: false,
      isISR,
      resolvedRoutes,
      initialURL: event.url,
      locale: NextConfig.i18n ? detectLocale(eventOrResult, NextConfig.i18n) : void 0,
      rewriteStatusCode: middlewareEventOrResult.rewriteStatusCode
    };
  } catch (e) {
    error3("Error in routingHandler", e);
    return {
      internalEvent: {
        type: "core",
        method: "GET",
        rawPath: "/500",
        url: constructNextUrl(event.url, "/500"),
        headers: {
          ...event.headers
        },
        query: event.query,
        cookies: event.cookies,
        remoteAddress: event.remoteAddress
      },
      isExternalRewrite: false,
      origin: false,
      isISR: false,
      resolvedRoutes: [],
      initialURL: event.url,
      locale: NextConfig.i18n ? detectLocale(event, NextConfig.i18n) : void 0
    };
  }
}
__name(routingHandler, "routingHandler");
function isInternalResult(eventOrResult) {
  return eventOrResult != null && "statusCode" in eventOrResult;
}
__name(isInternalResult, "isInternalResult");
globalThis.internalFetch = fetch;
globalThis.__openNextAls = new AsyncLocalStorage2();
var defaultHandler = /* @__PURE__ */ __name(async (internalEvent, options) => {
  const middlewareConfig = globalThis.openNextConfig.middleware;
  const originResolver = await resolveOriginResolver(middlewareConfig?.originResolver);
  const externalRequestProxy = await resolveProxyRequest(middlewareConfig?.override?.proxyExternalRequest);
  const assetResolver = await resolveAssetResolver(middlewareConfig?.assetResolver);
  const requestId = Math.random().toString(36);
  return runWithOpenNextRequestContext({
    isISRRevalidation: internalEvent.headers["x-isr"] === "1",
    waitUntil: options?.waitUntil,
    requestId
  }, async () => {
    const result = await routingHandler(internalEvent, { assetResolver });
    if ("internalEvent" in result) {
      debug3("Middleware intercepted event", internalEvent);
      if (!result.isExternalRewrite) {
        const origin = await originResolver.resolve(result.internalEvent.rawPath);
        return {
          type: "middleware",
          internalEvent: {
            ...result.internalEvent,
            headers: {
              ...result.internalEvent.headers,
              [INTERNAL_HEADER_INITIAL_URL]: internalEvent.url,
              [INTERNAL_HEADER_RESOLVED_ROUTES]: JSON.stringify(result.resolvedRoutes),
              [INTERNAL_EVENT_REQUEST_ID]: requestId,
              [INTERNAL_HEADER_REWRITE_STATUS_CODE]: String(result.rewriteStatusCode)
            }
          },
          isExternalRewrite: result.isExternalRewrite,
          origin,
          isISR: result.isISR,
          initialURL: result.initialURL,
          resolvedRoutes: result.resolvedRoutes
        };
      }
      try {
        return externalRequestProxy.proxy(result.internalEvent);
      } catch (e) {
        error3("External request failed.", e);
        return {
          type: "middleware",
          internalEvent: {
            ...result.internalEvent,
            headers: {
              ...result.internalEvent.headers,
              [INTERNAL_EVENT_REQUEST_ID]: requestId
            },
            rawPath: "/500",
            url: constructNextUrl(result.internalEvent.url, "/500"),
            method: "GET"
          },
          // On error we need to rewrite to the 500 page which is an internal rewrite
          isExternalRewrite: false,
          origin: false,
          isISR: result.isISR,
          initialURL: result.internalEvent.url,
          resolvedRoutes: [{ route: "/500", type: "page" }]
        };
      }
    }
    if (process.env.OPEN_NEXT_REQUEST_ID_HEADER || globalThis.openNextDebug) {
      result.headers[INTERNAL_EVENT_REQUEST_ID] = requestId;
    }
    debug3("Middleware response", result);
    return result;
  });
}, "defaultHandler");
var handler2 = await createGenericHandler({
  handler: defaultHandler,
  type: "middleware"
});

// .open-next/.build/durable-objects/queue.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
import { DurableObject } from "cloudflare:workers";
globalThis.openNextDebug = false;
globalThis.openNextVersion = "3.8.5";
var IgnorableError = class extends Error {
  static {
    __name(this, "IgnorableError");
  }
  __openNextInternal = true;
  canIgnore = true;
  logLevel = 0;
  constructor(message) {
    super(message);
    this.name = "IgnorableError";
  }
};
var RecoverableError = class extends Error {
  static {
    __name(this, "RecoverableError");
  }
  __openNextInternal = true;
  canIgnore = true;
  logLevel = 1;
  constructor(message) {
    super(message);
    this.name = "RecoverableError";
  }
};
var FatalError = class extends Error {
  static {
    __name(this, "FatalError");
  }
  __openNextInternal = true;
  canIgnore = false;
  logLevel = 2;
  constructor(message) {
    super(message);
    this.name = "FatalError";
  }
};
function isOpenNextError2(e) {
  try {
    return "__openNextInternal" in e;
  } catch {
    return false;
  }
}
__name(isOpenNextError2, "isOpenNextError");
function debug4(...args) {
  if (globalThis.openNextDebug) {
    console.log(...args);
  }
}
__name(debug4, "debug");
function warn4(...args) {
  console.warn(...args);
}
__name(warn4, "warn");
var DOWNPLAYED_ERROR_LOGS2 = [
  {
    clientName: "S3Client",
    commandName: "GetObjectCommand",
    errorName: "NoSuchKey"
  }
];
var isDownplayedErrorLog2 = /* @__PURE__ */ __name((errorLog) => DOWNPLAYED_ERROR_LOGS2.some((downplayedInput) => downplayedInput.clientName === errorLog?.clientName && downplayedInput.commandName === errorLog?.commandName && (downplayedInput.errorName === errorLog?.error?.name || downplayedInput.errorName === errorLog?.error?.Code)), "isDownplayedErrorLog");
function error4(...args) {
  if (args.some((arg) => isDownplayedErrorLog2(arg))) {
    return debug4(...args);
  }
  if (args.some((arg) => isOpenNextError2(arg))) {
    const error22 = args.find((arg) => isOpenNextError2(arg));
    if (error22.logLevel < getOpenNextErrorLogLevel2()) {
      return;
    }
    if (error22.logLevel === 0) {
      return console.log(...args.map((arg) => isOpenNextError2(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    if (error22.logLevel === 1) {
      return warn4(...args.map((arg) => isOpenNextError2(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    return console.error(...args);
  }
  console.error(...args);
}
__name(error4, "error");
function getOpenNextErrorLogLevel2() {
  const strLevel = process.env.OPEN_NEXT_ERROR_LOG_LEVEL ?? "1";
  switch (strLevel.toLowerCase()) {
    case "debug":
    case "0":
      return 0;
    case "error":
    case "2":
      return 2;
    default:
      return 1;
  }
}
__name(getOpenNextErrorLogLevel2, "getOpenNextErrorLogLevel");
var DEFAULT_MAX_REVALIDATION = 5;
var DEFAULT_REVALIDATION_TIMEOUT_MS = 1e4;
var DEFAULT_RETRY_INTERVAL_MS = 2e3;
var DEFAULT_MAX_RETRIES = 6;
var DOQueueHandler = class extends DurableObject {
  static {
    __name(this, "DOQueueHandler");
  }
  // Ongoing revalidations are deduped by the deduplication id
  // Since this is running in waitUntil, we expect the durable object state to persist this during the duration of the revalidation
  // TODO: handle incremental cache with only eventual consistency (i.e. KV or R2/D1 with the optional cache layer on top)
  ongoingRevalidations = /* @__PURE__ */ new Map();
  sql;
  routeInFailedState = /* @__PURE__ */ new Map();
  service;
  // Configurable params
  maxRevalidations;
  revalidationTimeout;
  revalidationRetryInterval;
  maxRetries;
  disableSQLite;
  constructor(ctx, env2) {
    super(ctx, env2);
    this.service = env2.WORKER_SELF_REFERENCE;
    if (!this.service)
      throw new IgnorableError("No service binding for cache revalidation worker");
    this.sql = ctx.storage.sql;
    this.maxRevalidations = env2.NEXT_CACHE_DO_QUEUE_MAX_REVALIDATION ? parseInt(env2.NEXT_CACHE_DO_QUEUE_MAX_REVALIDATION) : DEFAULT_MAX_REVALIDATION;
    this.revalidationTimeout = env2.NEXT_CACHE_DO_QUEUE_REVALIDATION_TIMEOUT_MS ? parseInt(env2.NEXT_CACHE_DO_QUEUE_REVALIDATION_TIMEOUT_MS) : DEFAULT_REVALIDATION_TIMEOUT_MS;
    this.revalidationRetryInterval = env2.NEXT_CACHE_DO_QUEUE_RETRY_INTERVAL_MS ? parseInt(env2.NEXT_CACHE_DO_QUEUE_RETRY_INTERVAL_MS) : DEFAULT_RETRY_INTERVAL_MS;
    this.maxRetries = env2.NEXT_CACHE_DO_QUEUE_MAX_RETRIES ? parseInt(env2.NEXT_CACHE_DO_QUEUE_MAX_RETRIES) : DEFAULT_MAX_RETRIES;
    this.disableSQLite = env2.NEXT_CACHE_DO_QUEUE_DISABLE_SQLITE === "true";
    ctx.blockConcurrencyWhile(async () => {
      debug4(`Restoring the state of the durable object`);
      await this.initState();
    });
    debug4(`Durable object initialized`);
  }
  async revalidate(msg) {
    if (this.ongoingRevalidations.size > 2 * this.maxRevalidations) {
      warn4(`Your durable object has 2 times the maximum number of revalidations (${this.maxRevalidations}) in progress. If this happens often, you should consider increasing the NEXT_CACHE_DO_QUEUE_MAX_REVALIDATION or the number of durable objects with the MAX_REVALIDATE_CONCURRENCY env var.`);
    }
    if (this.ongoingRevalidations.has(msg.MessageDeduplicationId))
      return;
    if (this.routeInFailedState.has(msg.MessageDeduplicationId))
      return;
    if (this.checkSyncTable(msg))
      return;
    if (this.ongoingRevalidations.size >= this.maxRevalidations) {
      debug4(`The maximum number of revalidations (${this.maxRevalidations}) is reached. Blocking until one of the revalidations finishes.`);
      while (this.ongoingRevalidations.size >= this.maxRevalidations) {
        const ongoingRevalidations = this.ongoingRevalidations.values();
        debug4(`Waiting for one of the revalidations to finish`);
        await Promise.race(ongoingRevalidations);
      }
    }
    const revalidationPromise = this.executeRevalidation(msg);
    this.ongoingRevalidations.set(msg.MessageDeduplicationId, revalidationPromise);
    this.ctx.waitUntil(revalidationPromise);
  }
  async executeRevalidation(msg) {
    let response;
    try {
      debug4(`Revalidating ${msg.MessageBody.host}${msg.MessageBody.url}`);
      const { MessageBody: { host, url } } = msg;
      const protocol = host.includes("localhost") ? "http" : "https";
      response = await this.service.fetch(`${protocol}://${host}${url}`, {
        method: "HEAD",
        headers: {
          // This is defined during build
          "x-prerender-revalidate": "6c1ca7697671b86d6338fb3a39cfd725",
          "x-isr": "1"
        },
        // This one is kind of problematic, it will always show the wall time of the revalidation to `this.revalidationTimeout`
        signal: AbortSignal.timeout(this.revalidationTimeout)
      });
      if (response.status === 200 && response.headers.get("x-nextjs-cache") !== "REVALIDATED") {
        this.routeInFailedState.delete(msg.MessageDeduplicationId);
        throw new FatalError(`The revalidation for ${host}${url} cannot be done. This error should never happen.`);
      } else if (response.status === 404) {
        this.routeInFailedState.delete(msg.MessageDeduplicationId);
        throw new IgnorableError(`The revalidation for ${host}${url} cannot be done because the page is not found. It's either expected or an error in user code itself`);
      } else if (response.status === 500) {
        await this.addToFailedState(msg);
        throw new IgnorableError(`Something went wrong while revalidating ${host}${url}`);
      } else if (response.status !== 200) {
        await this.addToFailedState(msg);
        throw new RecoverableError(`An unknown error occurred while revalidating ${host}${url}`);
      }
      if (!this.disableSQLite) {
        this.sql.exec(
          "INSERT OR REPLACE INTO sync (id, lastSuccess, buildId) VALUES (?, unixepoch(), ?)",
          // We cannot use the deduplication id because it's not unique per route - every time a route is revalidated, the deduplication id is different.
          `${host}${url}`,
          "xeaaE-qVxJpruTylEL_w4"
        );
      }
      this.routeInFailedState.delete(msg.MessageDeduplicationId);
    } catch (e) {
      if (!isOpenNextError2(e)) {
        await this.addToFailedState(msg);
      }
      error4(e);
    } finally {
      this.ongoingRevalidations.delete(msg.MessageDeduplicationId);
      try {
        await response?.body?.cancel();
      } catch {
      }
    }
  }
  async alarm() {
    const currentDateTime = Date.now();
    const nextEventToRetry = Array.from(this.routeInFailedState.values()).filter(({ nextAlarmMs }) => nextAlarmMs > currentDateTime).sort(({ nextAlarmMs: a }, { nextAlarmMs: b }) => a - b)[0];
    const expiredEvents = Array.from(this.routeInFailedState.values()).filter(({ nextAlarmMs }) => nextAlarmMs <= currentDateTime);
    const allEventsToRetry = nextEventToRetry ? [nextEventToRetry, ...expiredEvents] : expiredEvents;
    for (const event of allEventsToRetry) {
      debug4(`Retrying revalidation for ${event.msg.MessageBody.host}${event.msg.MessageBody.url}`);
      await this.executeRevalidation(event.msg);
    }
  }
  async addToFailedState(msg) {
    debug4(`Adding ${msg.MessageBody.host}${msg.MessageBody.url} to the failed state`);
    const existingFailedState = this.routeInFailedState.get(msg.MessageDeduplicationId);
    let updatedFailedState;
    if (existingFailedState) {
      if (existingFailedState.retryCount >= this.maxRetries) {
        error4(`The revalidation for ${msg.MessageBody.host}${msg.MessageBody.url} has failed after ${this.maxRetries} retries. It will not be tried again, but subsequent ISR requests will retry.`);
        this.routeInFailedState.delete(msg.MessageDeduplicationId);
        return;
      }
      const nextAlarmMs = Date.now() + Math.pow(2, existingFailedState.retryCount + 1) * this.revalidationRetryInterval;
      updatedFailedState = {
        ...existingFailedState,
        retryCount: existingFailedState.retryCount + 1,
        nextAlarmMs
      };
    } else {
      updatedFailedState = {
        msg,
        retryCount: 1,
        nextAlarmMs: Date.now() + 2e3
      };
    }
    this.routeInFailedState.set(msg.MessageDeduplicationId, updatedFailedState);
    if (!this.disableSQLite) {
      this.sql.exec("INSERT OR REPLACE INTO failed_state (id, data, buildId) VALUES (?, ?, ?)", msg.MessageDeduplicationId, JSON.stringify(updatedFailedState), "xeaaE-qVxJpruTylEL_w4");
    }
    await this.addAlarm();
  }
  async addAlarm() {
    const existingAlarm = await this.ctx.storage.getAlarm({ allowConcurrency: false });
    if (existingAlarm)
      return;
    if (this.routeInFailedState.size === 0)
      return;
    let nextAlarmToSetup = Math.min(...Array.from(this.routeInFailedState.values()).map(({ nextAlarmMs }) => nextAlarmMs));
    if (nextAlarmToSetup < Date.now()) {
      nextAlarmToSetup = Date.now() + this.revalidationRetryInterval;
    }
    await this.ctx.storage.setAlarm(nextAlarmToSetup);
  }
  // This function is used to restore the state of the durable object
  // We don't restore the ongoing revalidations because we cannot know in which state they are
  // We only restore the failed state and the alarm
  async initState() {
    if (this.disableSQLite)
      return;
    this.sql.exec("CREATE TABLE IF NOT EXISTS failed_state (id TEXT PRIMARY KEY, data TEXT, buildId TEXT)");
    this.sql.exec("CREATE TABLE IF NOT EXISTS sync (id TEXT PRIMARY KEY, lastSuccess INTEGER, buildId TEXT)");
    this.sql.exec("DELETE FROM failed_state WHERE buildId != ?", "xeaaE-qVxJpruTylEL_w4");
    this.sql.exec("DELETE FROM sync WHERE buildId != ?", "xeaaE-qVxJpruTylEL_w4");
    const failedStateCursor = this.sql.exec("SELECT * FROM failed_state");
    for (const row of failedStateCursor) {
      this.routeInFailedState.set(row.id, JSON.parse(row.data));
    }
    await this.addAlarm();
  }
  /**
   *
   * @param msg
   * @returns `true` if the route has been revalidated since the lastModified from the message, `false` otherwise
   */
  checkSyncTable(msg) {
    try {
      if (this.disableSQLite)
        return false;
      return this.sql.exec("SELECT 1 FROM sync WHERE id = ? AND lastSuccess > ? LIMIT 1", `${msg.MessageBody.host}${msg.MessageBody.url}`, Math.round(msg.MessageBody.lastModified / 1e3)).toArray().length > 0;
    } catch {
      return false;
    }
  }
};

// .open-next/.build/durable-objects/sharded-tag-cache.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
import { DurableObject as DurableObject2 } from "cloudflare:workers";
globalThis.openNextDebug = false;
globalThis.openNextVersion = "3.8.5";
var cloudflareContextSymbol2 = Symbol.for("__cloudflare-context__");
var debugCache = /* @__PURE__ */ __name((name, ...args) => {
  if (process.env.NEXT_PRIVATE_DEBUG_CACHE) {
    console.log(`[${name}] `, ...args);
  }
}, "debugCache");
var DOShardedTagCache = class extends DurableObject2 {
  static {
    __name(this, "DOShardedTagCache");
  }
  sql;
  constructor(state, env2) {
    super(state, env2);
    this.sql = state.storage.sql;
    state.blockConcurrencyWhile(async () => {
      this.sql.exec(`CREATE TABLE IF NOT EXISTS revalidations (tag TEXT PRIMARY KEY, revalidatedAt INTEGER)`);
    });
  }
  async getLastRevalidated(tags) {
    try {
      const result = this.sql.exec(`SELECT MAX(revalidatedAt) AS time FROM revalidations WHERE tag IN (${tags.map(() => "?").join(", ")})`, ...tags).toArray();
      const timeMs = result[0]?.time ?? 0;
      debugCache("DOShardedTagCache", `getLastRevalidated tags=${tags} -> time=${timeMs}`);
      return timeMs;
    } catch (e) {
      console.error(e);
      return 0;
    }
  }
  async hasBeenRevalidated(tags, lastModified) {
    const revalidated = this.sql.exec(`SELECT 1 FROM revalidations WHERE tag IN (${tags.map(() => "?").join(", ")}) AND revalidatedAt > ? LIMIT 1`, ...tags, lastModified ?? Date.now()).toArray().length > 0;
    debugCache("DOShardedTagCache", `hasBeenRevalidated tags=${tags} -> revalidated=${revalidated}`);
    return revalidated;
  }
  async writeTags(tags, lastModified) {
    debugCache("DOShardedTagCache", `writeTags tags=${tags} time=${lastModified}`);
    tags.forEach((tag) => {
      this.sql.exec(`INSERT OR REPLACE INTO revalidations (tag, revalidatedAt) VALUES (?, ?)`, tag, lastModified);
    });
  }
  async getRevalidationTimes(tags) {
    const result = this.sql.exec(`SELECT tag, revalidatedAt FROM revalidations WHERE tag IN (${tags.map(() => "?").join(", ")})`, ...tags).toArray();
    return Object.fromEntries(result.map((row) => [row.tag, row.revalidatedAt]));
  }
};

// .open-next/.build/durable-objects/bucket-cache-purge.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
import { DurableObject as DurableObject3 } from "cloudflare:workers";
globalThis.openNextDebug = false;
globalThis.openNextVersion = "3.8.5";
function isOpenNextError3(e) {
  try {
    return "__openNextInternal" in e;
  } catch {
    return false;
  }
}
__name(isOpenNextError3, "isOpenNextError");
function debug5(...args) {
  if (globalThis.openNextDebug) {
    console.log(...args);
  }
}
__name(debug5, "debug");
function warn5(...args) {
  console.warn(...args);
}
__name(warn5, "warn");
var DOWNPLAYED_ERROR_LOGS3 = [
  {
    clientName: "S3Client",
    commandName: "GetObjectCommand",
    errorName: "NoSuchKey"
  }
];
var isDownplayedErrorLog3 = /* @__PURE__ */ __name((errorLog) => DOWNPLAYED_ERROR_LOGS3.some((downplayedInput) => downplayedInput.clientName === errorLog?.clientName && downplayedInput.commandName === errorLog?.commandName && (downplayedInput.errorName === errorLog?.error?.name || downplayedInput.errorName === errorLog?.error?.Code)), "isDownplayedErrorLog");
function error5(...args) {
  if (args.some((arg) => isDownplayedErrorLog3(arg))) {
    return debug5(...args);
  }
  if (args.some((arg) => isOpenNextError3(arg))) {
    const error22 = args.find((arg) => isOpenNextError3(arg));
    if (error22.logLevel < getOpenNextErrorLogLevel3()) {
      return;
    }
    if (error22.logLevel === 0) {
      return console.log(...args.map((arg) => isOpenNextError3(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    if (error22.logLevel === 1) {
      return warn5(...args.map((arg) => isOpenNextError3(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    return console.error(...args);
  }
  console.error(...args);
}
__name(error5, "error");
function getOpenNextErrorLogLevel3() {
  const strLevel = process.env.OPEN_NEXT_ERROR_LOG_LEVEL ?? "1";
  switch (strLevel.toLowerCase()) {
    case "debug":
    case "0":
      return 0;
    case "error":
    case "2":
      return 2;
    default:
      return 1;
  }
}
__name(getOpenNextErrorLogLevel3, "getOpenNextErrorLogLevel");
var cloudflareContextSymbol3 = Symbol.for("__cloudflare-context__");
var debugCache2 = /* @__PURE__ */ __name((name, ...args) => {
  if (process.env.NEXT_PRIVATE_DEBUG_CACHE) {
    console.log(`[${name}] `, ...args);
  }
}, "debugCache");
async function internalPurgeCacheByTags(env2, tags) {
  if (!env2.CACHE_PURGE_ZONE_ID || !env2.CACHE_PURGE_API_TOKEN) {
    error5("No cache zone ID or API token provided. Skipping cache purge.");
    return "missing-credentials";
  }
  let response;
  try {
    response = await fetch(`https://api.cloudflare.com/client/v4/zones/${env2.CACHE_PURGE_ZONE_ID}/purge_cache`, {
      headers: {
        Authorization: `Bearer ${env2.CACHE_PURGE_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({
        tags
      })
    });
    if (response.status === 429) {
      error5("purgeCacheByTags: Rate limit exceeded. Skipping cache purge.");
      return "rate-limit-exceeded";
    }
    const bodyResponse = await response.json();
    if (!bodyResponse.success) {
      error5("purgeCacheByTags: Cache purge failed. Errors:", bodyResponse.errors.map((error22) => `${error22.code}: ${error22.message}`));
      return "purge-failed";
    }
    debugCache2("purgeCacheByTags", "Cache purged successfully for tags:", tags);
    return "purge-success";
  } catch (error22) {
    console.error("Error purging cache by tags:", error22);
    return "purge-failed";
  } finally {
    try {
      await response?.body?.cancel();
    } catch {
    }
  }
}
__name(internalPurgeCacheByTags, "internalPurgeCacheByTags");
var DEFAULT_BUFFER_TIME_IN_SECONDS = 5;
var MAX_NUMBER_OF_TAGS_PER_PURGE = 100;
var BucketCachePurge = class extends DurableObject3 {
  static {
    __name(this, "BucketCachePurge");
  }
  bufferTimeInSeconds;
  constructor(state, env2) {
    super(state, env2);
    this.bufferTimeInSeconds = env2.NEXT_CACHE_DO_PURGE_BUFFER_TIME_IN_SECONDS ? parseInt(env2.NEXT_CACHE_DO_PURGE_BUFFER_TIME_IN_SECONDS) : DEFAULT_BUFFER_TIME_IN_SECONDS;
    state.blockConcurrencyWhile(async () => {
      state.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS cache_purge (
        tag TEXT NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS tag_index ON cache_purge (tag);
      `);
    });
  }
  async purgeCacheByTags(tags) {
    for (const tag of tags) {
      this.ctx.storage.sql.exec(`
        INSERT OR REPLACE INTO cache_purge (tag)
        VALUES (?)`, [tag]);
    }
    const nextAlarm = await this.ctx.storage.getAlarm();
    if (!nextAlarm) {
      this.ctx.storage.setAlarm(Date.now() + this.bufferTimeInSeconds * 1e3);
    }
  }
  async alarm() {
    let tags = this.ctx.storage.sql.exec(`
      SELECT * FROM cache_purge LIMIT ${MAX_NUMBER_OF_TAGS_PER_PURGE}
    `).toArray();
    do {
      if (tags.length === 0) {
        return;
      }
      const result = await internalPurgeCacheByTags(this.env, tags.map((row) => row.tag));
      if (result === "rate-limit-exceeded") {
        throw new Error("Rate limit exceeded");
      }
      this.ctx.storage.sql.exec(`
        DELETE FROM cache_purge
        WHERE tag IN (${tags.map(() => "?").join(",")})
      `, tags.map((row) => row.tag));
      if (tags.length < MAX_NUMBER_OF_TAGS_PER_PURGE) {
        tags = [];
      } else {
        tags = this.ctx.storage.sql.exec(`
          SELECT * FROM cache_purge LIMIT ${MAX_NUMBER_OF_TAGS_PER_PURGE}
        `).toArray();
      }
    } while (tags.length >= 0);
  }
};

// .open-next/worker.js
var worker_default = {
  async fetch(request, env2, ctx) {
    return runWithCloudflareRequestContext(request, env2, ctx, async () => {
      const response = maybeGetSkewProtectionResponse(request);
      if (response) {
        return response;
      }
      const url = new URL(request.url);
      if (url.pathname.startsWith("/cdn-cgi/image/")) {
        const m = url.pathname.match(/\/cdn-cgi\/image\/.+?\/(?<url>.+)$/);
        if (m === null) {
          return new Response("Not Found!", { status: 404 });
        }
        const imageUrl = m.groups.url;
        return imageUrl.match(/^https?:\/\//) ? fetch(imageUrl, { cf: { cacheEverything: true } }) : env2.ASSETS?.fetch(new URL(`/${imageUrl}`, url));
      }
      if (url.pathname === `${globalThis.__NEXT_BASE_PATH__}/_next/image${globalThis.__TRAILING_SLASH__ ? "/" : ""}`) {
        const imageUrl = url.searchParams.get("url") ?? "";
        return await fetchImage(env2.ASSETS, imageUrl, ctx);
      }
      const reqOrResp = await handler2(request, env2, ctx);
      if (reqOrResp instanceof Response) {
        return reqOrResp;
      }
      const { handler: handler3 } = await Promise.resolve().then(() => (init_handler(), handler_exports));
      return handler3(reqOrResp, env2, ctx, request.signal);
    });
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error6 = reduceError(e);
    return Response.json(error6, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-ij8lsP/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// node_modules/wrangler/templates/middleware/common.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-ij8lsP/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init2) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init2.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init2) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init2.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  BucketCachePurge,
  DOQueueHandler,
  DOShardedTagCache,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
