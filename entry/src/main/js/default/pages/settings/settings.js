console.info("pages/settings onInit");

export default {
  data: {
    uiSizes: $app.getImports().uiSizes,
    keepScreenOn: $app.getImports().memory.keepScreenOn || false,
    textAnimation: $app.getImports().memory.textAnimation !== false,
  },

  onInit() { },

  onShow() {
    this?.$refs?.bindRotation?.rotation?.({ focus: true });
  },

  onHide() {
    this?.$refs?.bindRotation?.rotation?.({ focus: false });
  },

  toggleKeepScreenOn() {
    this.keepScreenOn = !this.keepScreenOn;
    $app.getImports().memory.keepScreenOn = this.keepScreenOn;
    $app.getImports().memory.save("keepScreenOn");
    $app.getImports().brightness.setKeepScreenOn({ keepScreenOn: this.keepScreenOn });
  },

  toggleTextAnimation() {
    this.textAnimation = !this.textAnimation;
    $app.getImports().memory.textAnimation = this.textAnimation;
    $app.getImports().memory.save("textAnimation");
  },

  clickBack() {
    $app.getImports().router.back();
  },

  swipeBack(d) {
    if (d.direction === "right") return this.clickBack();
  },
};
