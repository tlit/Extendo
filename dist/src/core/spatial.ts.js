export class SpatialHarvester {
  static nextId = 0;
  /**
   * Scans the DOM for interactive elements and calculates their bounding boxes.
   */
  static getInteractiveElements() {
    this.nextId = 0;
    const selector = 'button, a, input, select, textarea, [onclick], [role="button"], [role="link"]';
    const elements = Array.from(document.querySelectorAll(selector));
    const results = [];
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0 || window.getComputedStyle(el).display === "none") {
        return;
      }
      el.setAttribute("data-extendo-id", this.nextId.toString());
      results.push({
        id: this.nextId,
        rect: {
          x: rect.x + window.scrollX,
          // Absolute coordinates
          y: rect.y + window.scrollY,
          width: rect.width,
          height: rect.height,
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          bottom: rect.bottom + window.scrollY,
          right: rect.right + window.scrollX
        },
        tagName: el.tagName.toLowerCase(),
        text: (el.textContent || el.value || "").slice(0, 50).trim(),
        isVisible: true
      });
      this.nextId++;
    });
    return results;
  }
}
