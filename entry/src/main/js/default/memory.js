console.info("memory.js onImport");

const _this = {
  init,
  save,
  saveGlobalData,
  globalData: {},
};

const defaults = {
  progresses_slot1: {},
  progresses_slot2: {},
  globalData_slot1: { time: 0, data: {} },
  globalData_slot2: { time: 0, data: {} },
  progressMode: "read",
  keepScreenOn: false,
  textAnimation: true,
};

function init(onDone) {
  const keys = Object.keys(defaults);

  function next() {
    if (keys.length === 0) {
      const latest = readLatestGlobalData();
      _this.globalData = latest.data;
      return onDone && onDone(_this);
    }
    const key = keys.shift();
    load(key, next);
  }

  $app.getImports().file.mkdir({
    uri: "internal://app/kvstore",
    fail: (data, code) => {
      console.error(`file.mkdir kvstore fail: ${code} ${data}`);
    },
    complete: next,
  })
}

function readLatestGlobalData() {
  const a = _this.globalData_slot1;
  const b = _this.globalData_slot2;
  if ((a.time || 0) >= (b.time || 0)) return a;
  return b;
}

function saveGlobalData() {
  const a = _this.globalData_slot1;
  const b = _this.globalData_slot2;
  const target = (a.time || 0) <= (b.time || 0) ? "globalData_slot1" : "globalData_slot2";
  _this[target] = {
    time: Date.now(),
    data: _this.globalData,
  };
  save(target);
}

function load(key, then) {
  $app.getImports().file.readText({
    uri: `internal://app/kvstore/${key}`,
    fail: (data, code) => {
      console.info(`file.readText ${key} not exist`);
      _this[key] = defaults[key];
    },
    success: d => {
      console.info(`file.readText ${key} success`);
      _this[key] = JSON.parse(d.text);
    },
    complete: () => {
      return then && setTimeout(() => then(_this[key]), 0);
    },
  });
}

function save(key, then) {
  $app.getImports().file.writeText({
    uri: `internal://app/kvstore/${key}`,
    text: JSON.stringify(_this[key]),
    fail: (data, code) => {
      console.error(`file.writeText ${key} fail: ${code} ${data}`);
    },
    success: () => {
      console.info(`file.writeText ${key} success`);
    },
    complete: () => {
      return then && setTimeout(() => then(_this[key]), 0);
    }
  });
}

export default _this;