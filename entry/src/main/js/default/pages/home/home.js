console.info("pages/home onInit");

export default {
  data: {
    uiSizes: $app.getImports().uiSizes,
    slideAnimName: "slide-bg-right-to-left",
    showTrueEnd: false,
    _slideAnimTimer: null,
  },

  onInit() {
    $app.getImports().brightness.setKeepScreenOn({ keepScreenOn: $app.getImports().memory.keepScreenOn });
    this.updateTrueEndVisibility();
  },

  onShow() {
    this?.$refs?.bindRotation?.rotation?.({ focus: true });
    this.startSlideAnimation();
  },

  updateTrueEndVisibility() {
    const globalData = $app.getImports().memory.globalData || {};
    this.showTrueEnd = globalData.goodEndFinished === true && globalData.badEndFinished === true;
  },

  onHide() {
    this?.$refs?.bindRotation?.rotation?.({ focus: false });
    this.stopSlideAnimation();
  },

  _startSlideAnimation() {
    this.stopSlideAnimation();
    const tick = () => {
      this.slideAnimName = this.slideAnimName === "slide-bg-right-to-left" ? "slide-bg-left-to-right" : "slide-bg-right-to-left";
      this.slideAnimTimer = setTimeout(tick, 30000);
    };
    this.slideAnimTimer = setTimeout(tick, 30000);
  },

  _stopSlideAnimation() {
    if (this.slideAnimTimer) {
      clearTimeout(this.slideAnimTimer);
      this.slideAnimTimer = null;
    }
  },

  swipeHandler(d) {
    if (d.direction === "right") {
      $app.getImports().router.back();
    }
  },

  goPlay() {
    $app.getImports().memory.progressMode = "read";
    $app.getImports().router.push({ uri: "pages/progressSave/progressSave" });
  },

  goTrueEnd() {
    $app.getImports().progress.progress.momentId = "rra";
    $app.getImports().progress.progress.gameData = {};
    $app.getImports().router.push({ uri: "pages/momentScene/momentScene" });
  },

  goSettings() {
    $app.getImports().router.push({ uri: "pages/settings/settings" });
  },

  goAbout() {
    $app.getImports().router.push({ uri: "pages/about/about" });
  },
};
