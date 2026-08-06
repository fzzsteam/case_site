import "@testing-library/jest-dom/vitest";

// 绝大多数测试跑在 jsdom 下，但涉及 multipart 上传的服务端路由必须用 node 环境
// （jsdom 的 FormData/File 和 undici 的实现对不上），那些文件用 @vitest-environment node
// 声明，此时下面这些 DOM 垫片既不需要也无法执行。
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({ matches: false, media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false }),
  });

  if (!window.HTMLDialogElement.prototype.showModal) {
    window.HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) { this.open = true; };
    window.HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) { this.open = false; };
  }

  if (!window.ResizeObserver) {
    window.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
    Element.prototype.setPointerCapture = () => {};
    Element.prototype.releasePointerCapture = () => {};
  }

  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
}
