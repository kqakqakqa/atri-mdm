console.info("pages/momentScene onInit");

let _this;
let revealTimer = null;
let endTimer = null;

export default {
  data: {
    uiSizes: $app.getImports().uiSizes,
    moment: {
      id: "",
      type: "",
      bg: "",
      showCharacters: [],
      dialogCharacter: "",
      dialog: "",
      forwards: [],
    },
    dialogDisplay: "",
    isRevealing: false,
    isPaused: false,
    showEndMask: false,
    isEndFading: false,
    endMaskColor: "#00000000",
  },

  onInit() { },

  onShow() {
    _this = this;
    this?.$refs?.bindRotation?.rotation?.({ focus: true });
    this.refresh();
  },

  onHide() {
    this?.$refs?.bindRotation?.rotation?.({ focus: false });
    this.stopReveal();
    if (endTimer) {
      clearTimeout(endTimer);
      endTimer = null;
    }
  },

  swipeHandler(d) {
    if (this.showEndMask) return;
    if (d.direction === "right") {
      if (this.isPaused) {
        this.isPaused = false;
      } else {
        this.isPaused = true;
      }
    }
    if (d.direction === "left") {
      this.togglePause();
    }
  },

  refresh() {
    this.stopReveal();

    const momentId = $app.getImports().progress.progress.momentId;
    console.info("refresh moment " + momentId);

    if (!momentId) return;

    $app.getImports().parseMoment.parseMoment(momentId, function (moment) {
      if (!moment) {
        console.error("moment not found");
        return;
      }

      _this?.$refs?.bindRotation?.scrollTo?.({ index: 0 });

      _this.moment = { id: momentId, ...moment };

      console.info("parseMoment success");
      console.info("moment=" + JSON.stringify(_this.moment));
      console.info("gameData=" + JSON.stringify($app.getImports().progress.progress.gameData));

      _this.startReveal();
    });
  },

  startReveal() {
    const text = this.moment.dialog || "";
    if (!text || this.moment.type !== "dialog") {
      this.dialogDisplay = text;
      return;
    }

    if ($app.getImports().memory.textAnimation === false) {
      this.dialogDisplay = text;
      return;
    }

    this.dialogDisplay = "";
    this.isRevealing = true;
    let i = 0;

    function tick() {
      if (i < text.length) {
        i++;
        _this.dialogDisplay = text.slice(0, i);
        revealTimer = setTimeout(tick, 50);
      } else {
        _this.stopReveal();
      }
    }

    revealTimer = setTimeout(tick, 50);
  },

  stopReveal() {
    if (revealTimer) {
      clearTimeout(revealTimer);
      revealTimer = null;
    }
    this.isRevealing = false;
    this.dialogDisplay = this.moment.dialog || "";
  },

  goForward(idx) {
    console.info("goForward from " + this.moment.id);
    const isChoice = this.moment.type === "choice";
    const execResult = this.runExec(this.moment.exec, isChoice ? idx : undefined);
    if (!this.moment.forwards || this.moment.forwards.length === 0) {
      return;
    }

    // 执行 moment 的 exec：
    // - choice 类型传入 arguments[0] = 用户选择的 index；dialog 类型不传参
    // - 返回值为 number 时决定跳转到哪个 forwards，为空/无返回值/异常时沿用传入 idx
    const targetIdx = execResult !== null ? execResult : idx;

    const nextId = this.moment.forwards[targetIdx] || this.moment.forwards[0];
    console.info("goForward to " + nextId);
    // 先保存进度，再通过 router.replace 重新加载页面，避免闪烁
    $app.getImports().progress.progress.momentId = nextId;
    $app.getImports().progress.saveProgress("auto");
    $app.getImports().router.replace({ uri: "pages/momentScene/momentScene" });
  },

  // 用 new Function 执行 moment 的 exec 字符串。
  // 执行环境中 gameData 指向 progress.gameData，exec 可读写它。
  // 返回 exec 的数值返回值；exec 为空、无返回值或执行异常时返回 null。
  runExec(execStr, idx) {
    if (!execStr) return null;
    const gameData = $app.getImports().progress.progress.gameData;
    const globalData = $app.getImports().memory.globalData;
    const args = typeof idx === "number" ? [idx] : [];
    const atEnd = (color) => {
      if (endTimer) clearTimeout(endTimer);
      this.showEndMask = true;
      this.isEndFading = false;
      this.endMaskColor = color;
      // atEnd(string)：执行淡出画面，延迟退回首页。
      setTimeout(() => {
        this.isEndFading = true;
      }, 0);
      endTimer = setTimeout(() => {
        endTimer = null;
        console.info("atEnd fade complete, return home");
        $app.getImports().router.replace({ uri: "pages/home/home" });
      }, 5000);
    };
    console.info("exec before gameData=" + JSON.stringify(gameData));
    try {
      const fn = new Function("gameData", "globalData", "args", "atEnd", "return function(){" + execStr + "}.apply(null, args);");
      const result = fn(gameData, globalData, args, atEnd);
      $app.getImports().memory.saveGlobalData();
      console.info("exec after gameData=" + JSON.stringify(gameData));
      return typeof result === "number" ? result : null;
    } catch (e) {
      console.error("exec failed: " + e);
      return null;
    }
  },

  advance() {
    if (this.moment.type === "choice") return;
    if (this.isRevealing) {
      this.stopReveal();
      return;
    }
    this.goForward(0);
  },

  choose(idx) {
    this.goForward(idx);
  },

  togglePause() {
    if (this.showEndMask) return;
    this.isPaused = !this.isPaused;
  },

  quitToHome() {
    this.isPaused = false;
    $app.getImports().router.back();
  },

  goSave() {
    this.isPaused = false;
    $app.getImports().memory.progressMode = "save";
    $app.getImports().router.push({ uri: "pages/progressSave/progressSave" });
  },

  goSettings() {
    this.isPaused = false;
    $app.getImports().router.push({ uri: "pages/settings/settings" });
  },

  nullFn() { },

};