console.info("pages/progressSave onInit");

const SAVE_LABELS = ["SAVE 1", "SAVE 2", "SAVE 3"];
const READ_LABELS = ["AUTO", "SAVE 1", "SAVE 2", "SAVE 3"];
const READ_KEYS = ["auto", "manual0", "manual1", "manual2"];
// 新游戏先播放亚托莉视角的序章，再进入主线起点 a。
const newMomentId = "rzq";

let _this;

export default {
  data: {
    uiSizes: $app.getImports().uiSizes,
    mode: "read",
    slots: [],
    showBubble: false,
    bubbleTimer: null,
    showDeleteDialog: false,
    deleteKey: "",
    showFadeMask: false,
    fadeTimer: null,
  },

  onInit() {
    _this = this;

    this.uiSizes = $app.getImports().uiSizes;
    this.mode = $app.getImports().memory.progressMode || "read";
    this.buildSlots();

    if (this.mode === "read") {
      let hasSave = false;
      for (let i = 0; i < this.slots.length; i++) {
        if (!this.slots[i].empty) { hasSave = true; break; }
      }
      if (!hasSave) {
        this.goNew();
      }
    }
  },

  onShow() {
    this.uiSizes = $app.getImports().uiSizes;
    this.mode = $app.getImports().memory.progressMode || "read";
    this.buildSlots();
    this?.$refs?.bindRotation?.rotation?.({ focus: true });
  },

  onHide() {
    this?.$refs?.bindRotation?.rotation?.({ focus: false });
    if (this.bubbleTimer) {
      clearTimeout(this.bubbleTimer);
      this.bubbleTimer = null;
    }
    this.showBubble = false;
    if (this.fadeTimer) {
      clearTimeout(this.fadeTimer);
      this.fadeTimer = null;
    }
    this.showFadeMask = false;
  },

  swipeHandler(d) {
    if (d.direction === "right") {
      if (this.showDeleteDialog) {
        this.cancelDelete();
      } else {
        $app.getImports().router.back();
      }
    }
  },

  buildSlots() {
    const saves = $app.getImports().progress.getSaves();
    const parseMoment = $app.getImports().parseMoment.parseMoment;
    const arr = [];

    let i, slot, empty;

    if (this.mode === "save") {
      for (i = 0; i < 3; i++) {
        slot = saves["manual" + i];
        empty = !slot || !slot.momentId;
        arr.push({
          label: SAVE_LABELS[i],
          empty: empty,
          momentId: empty ? "" : slot.momentId,
          bg: "",
          text: "",
          time: empty ? "---" : _this.formatTime(slot.time),
        });
      }
    } else {
      for (i = 0; i < READ_KEYS.length; i++) {
        slot = saves[READ_KEYS[i]];
        empty = !slot || !slot.momentId;
        arr.push({
          label: READ_LABELS[i],
          empty: empty,
          momentId: empty ? "" : slot.momentId,
          bg: "",
          text: "",
          time: empty ? "---" : _this.formatTime(slot.time),
        });
      }
    }

    this.slots = arr;

    let pending = 0;
    for (i = 0; i < arr.length; i++) {
      if (arr[i].empty || !arr[i].momentId) continue;
      pending++;
      (function (idx, momentId) {
        parseMoment(momentId, function (moment) {
          if (moment) {
            arr[idx].bg = moment.bg || "";
            if (moment.type === "choice") {
              arr[idx].text = (moment.choices && moment.choices.length > 0) ? moment.choices.join(" / ") : "---";
            } else {
              arr[idx].text = moment.dialogCharacter ? (moment.dialogCharacter + "\n" + (moment.dialog || "---")) : (moment.dialog || "---");
            }
          }
          pending--;
          if (pending === 0) {
            _this.slots = arr.slice();
          }
        });
      })(i, arr[i].momentId);
    }
  },

  formatTime(timestamp) {
    if (!timestamp) return "";
    const d = new Date(timestamp);
    const pad = function (n) { return n < 10 ? "0" + n : "" + n; };
    return d.getFullYear() + "/" + pad(d.getMonth() + 1) + "/" + pad(d.getDate()) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
  },

  onSlotClick(idx) {
    if (this.mode === "save") {
      $app.getImports().progress.saveProgress("manual" + idx);
      this.buildSlots();
      this.showSaveBubble();
    } else {
      if (this.slots[idx].empty) return;
      const id = idx === 0 ? "auto" : "manual" + (idx - 1);
      $app.getImports().progress.getProgress(id);
      this.startFadeAndNavigate();
    }
  },

  showSaveBubble() {
    if (this.bubbleTimer) {
      clearTimeout(this.bubbleTimer);
      this.bubbleTimer = null;
    }
    this.showBubble = true;
    this.bubbleTimer = setTimeout(function () {
      _this.showBubble = false;
      _this.bubbleTimer = null;
    }, 3000);
  },

  getDeleteId(slotIdx) {
    if (this.mode === "save") return "manual" + slotIdx;
    return slotIdx === 0 ? "auto" : "manual" + (slotIdx - 1);
  },

  onSlotLongPress(idx) {
    if (this.slots[idx].empty) return;
    this.deleteKey = this.getDeleteId(idx);
    this.showDeleteDialog = true;
  },

  cancelDelete() {
    this.showDeleteDialog = false;
    this.deleteKey = "";
  },

  confirmDelete() {
    if (this.deleteKey) {
      $app.getImports().progress.delProgress(this.deleteKey);
      this.buildSlots();
    }
    this.showDeleteDialog = false;
    this.deleteKey = "";
  },

  startFadeAndNavigate() {
    if (this.fadeTimer) {
      clearTimeout(this.fadeTimer);
      this.fadeTimer = null;
    }
    this.showFadeMask = true;
    this.fadeTimer = setTimeout(function () {
      _this.fadeTimer = null;
      _this.showFadeMask = false;
      $app.getImports().router.replace({ uri: "pages/momentScene/momentScene" });
    }, 1000);
  },

  goNew() {
    $app.getImports().progress.progress.momentId = newMomentId;
    $app.getImports().router.replace({ uri: "pages/momentScene/momentScene" });
  },

  onNewClick() {
    $app.getImports().progress.progress.momentId = newMomentId;
    this.startFadeAndNavigate();
  },

  nullFn() { },

};