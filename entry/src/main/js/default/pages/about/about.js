console.info("pages/about onInit");

export default {
  data: {
    uiSizes: $app.getImports().uiSizes,
  },

  onShow() {
    this?.$refs?.bindRotation?.rotation?.({ focus: true });
  },

  onHide() {
    this?.$refs?.bindRotation?.rotation?.({ focus: false });
  },

  swipeBack(d) {
    if (d.direction === "right") $app.getImports().router.back();
  },
};
