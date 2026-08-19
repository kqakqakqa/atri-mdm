import router from "../../router.js";
import uiSizes from "../../uiSizes.js";
import memory from "../../memory.js";
import lookupDictV5 from "../../lookupDictV5.js";
import parseMoment from "../../parseMoment.js";
import progress from "../../progress.js";

const imports = {
  app: requireNative("system.app"),
  battery: requireNative("system.battery"),
  brightness: requireNative("system.brightness"),
  // configuration: requireNative("system.configuration"),
  device: requireNative("system.device"),
  // fetch: requireNative("system.fetch"),
  file: requireNative("system.file"),
  // geolocation: requireNative("system.geolocation"),
  router: router, // requireNative("system.router"),
  // sensor: requireNative("system.sensor"),
  storage: requireNative("system.storage"),
  // vibrator: requireNative("system.vibrator"),
  vibrator: requireNative("system.vibrator"),

  uiSizes: uiSizes,
  memory: memory,
  lookupDictV5: lookupDictV5,
  parseMoment: parseMoment,
  progress: progress,
};

console.info("pages/init/init onInit");

export default {
  data: {},

  onInit() {
    $app.setImports(imports);

    initImports(() => {
      imports.router.replace({ uri: "pages/home/home" });
    });
  },
};

function initImports(onAllDone) {
  console.info("initImports");
  const keys = Object.keys(imports);
  let idx = 0;

  function next() {
    if (idx >= keys.length) {
      console.info("all init done");
      onAllDone();
      return;
    }

    const key = keys[idx++];
    console.info("init " + key);

    if (imports[key] && imports[key].init) {
      let done = false;

      const timer = setTimeout(() => {
        if (!done) {
          console.warn("init " + key + " timeout, skip");
          done = true;
          setTimeout(next, 0);
        }
      }, 3000);

      imports[key].init(() => {
        if (!done) {
          done = true;
          clearTimeout(timer);
          console.info("init " + key + " done");
          setTimeout(next, 0);
        }
      });
    } else {
      console.info("init " + key + " not needed");
      setTimeout(next, 0);
    }
  }

  setTimeout(next, 0);
}