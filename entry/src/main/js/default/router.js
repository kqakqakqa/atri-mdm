console.info("router.js onImport");

// 简单的历史记录管理
const historyStack = [];

const _this = {

  /**
   *
   * @param {Object} d
   * @param {string} d.uri
   * @param {Object} [d.params]
   *
   */
  replace(d) {
    console.info("router.replace to " + d.uri);

    // 先删除栈顶，再push新页面
    if (historyStack.length > 0) {
      historyStack.pop();
    }
    historyStack.push({ uri: d.uri, params: d.params || {} });

    setTimeout(() => requireNative("system.router").replace({
      uri: "pages/router/router",
      params: {
        uri: d.uri,
        params: d.params || {},
      },
    }), 0);
  },

  /**
   * Push a new page onto the stack
   * @param {Object} d
   * @param {string} d.uri
   * @param {Object} [d.params]
   *
   */
  push(d) {
    console.info("router.push to " + d.uri);

    // 添加到历史记录
    historyStack.push({ uri: d.uri, params: d.params || {} });

    setTimeout(() => requireNative("system.router").replace({
      uri: "pages/router/router",
      params: {
        uri: d.uri,
        params: d.params || {},
      },
    }), 0);
  },

  /**
   * Go back to the previous page
   *
   */
  back() {
    console.info("router.back");

    // 如果有上一个页面，返回到它
    if (historyStack.length > 1) {
      historyStack.pop(); // 移除当前页面
      const prevPage = historyStack[historyStack.length - 1];

      setTimeout(() => requireNative("system.router").replace({
        uri: "pages/router/router",
        params: {
          uri: prevPage.uri,
          params: prevPage.params,
        },
      }), 0);
    } else {
      console.info("no prev page, exit app");
      return requireNative("system.app").terminate();
    }
  },

  /**
   * Clear all pages except the latest one
   *
   */
  clear() {
    console.info("router.clear");

    // 保留最新页面，清除其他所有页面
    if (historyStack.length > 1) {
      const latestPage = historyStack[historyStack.length - 1];
      historyStack.length = 0; // 清空栈
      historyStack.push(latestPage); // 只保留最新页面
      console.info("cleared all pages except latest: " + latestPage.uri);
    } else {
      console.info("no pages to clear");
    }
  },

};

export default _this;