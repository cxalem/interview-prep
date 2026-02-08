import { describe, it, expect, vi } from "vitest";
import { VirtualList, VirtualGrid } from "./index";

describe("VirtualList", () => {
  describe("fixed height items", () => {
    // 100 items, 50px each, 500px container = 10 visible at a time
    const createList = (overscan?: number) =>
      new VirtualList({
        itemCount: 100,
        itemHeight: 50,
        containerHeight: 500,
        overscan,
      });

    describe("getTotalHeight", () => {
      it("should return total height of all items", () => {
        const list = createList();
        expect(list.getTotalHeight()).toBe(5000); // 100 * 50
      });
    });

    describe("getItemHeight", () => {
      it("should return the fixed height for any index", () => {
        const list = createList();
        expect(list.getItemHeight(0)).toBe(50);
        expect(list.getItemHeight(50)).toBe(50);
        expect(list.getItemHeight(99)).toBe(50);
      });
    });

    describe("getItemOffset", () => {
      it("should return correct offset for each item", () => {
        const list = createList();
        expect(list.getItemOffset(0)).toBe(0);
        expect(list.getItemOffset(1)).toBe(50);
        expect(list.getItemOffset(10)).toBe(500);
        expect(list.getItemOffset(99)).toBe(4950);
      });
    });

    describe("getVisibleRange", () => {
      it("should return correct range at scrollTop 0", () => {
        const list = createList(0); // no overscan for clarity
        const range = list.getVisibleRange(0);
        expect(range.startIndex).toBe(0);
        expect(range.endIndex).toBe(10); // exclusive: items 0-9
        expect(range.offsetTop).toBe(0);
        expect(range.totalHeight).toBe(5000);
      });

      it("should return correct range when scrolled", () => {
        const list = createList(0);
        const range = list.getVisibleRange(250); // scrolled 5 items down
        expect(range.startIndex).toBe(5);
        expect(range.endIndex).toBe(15);
        expect(range.offsetTop).toBe(250);
      });

      it("should include overscan items", () => {
        const list = createList(3); // 3 items overscan
        const range = list.getVisibleRange(250);
        expect(range.startIndex).toBe(2); // 5 - 3
        expect(range.endIndex).toBe(18); // 15 + 3
      });

      it("should clamp overscan to valid bounds", () => {
        const list = createList(10); // large overscan
        const range = list.getVisibleRange(0);
        expect(range.startIndex).toBe(0); // can't go below 0
      });

      it("should clamp endIndex to itemCount", () => {
        const list = createList(0);
        const range = list.getVisibleRange(4600); // near the end
        expect(range.endIndex).toBeLessThanOrEqual(100);
      });

      it("should handle scrollTop beyond content", () => {
        const list = createList(0);
        const range = list.getVisibleRange(10000); // way past end
        expect(range.endIndex).toBeLessThanOrEqual(100);
        expect(range.startIndex).toBeLessThanOrEqual(range.endIndex);
      });
    });

    describe("scrollToIndex", () => {
      it("should scroll to start alignment", () => {
        const list = createList();
        expect(list.scrollToIndex(10, "start")).toBe(500);
      });

      it("should scroll to center alignment", () => {
        const list = createList();
        // Item 10 at offset 500, center of container is 250px
        // scrollTop = 500 - 250 + 25 = 275 (center item in viewport)
        const scrollTop = list.scrollToIndex(10, "center");
        expect(scrollTop).toBe(275);
      });

      it("should scroll to end alignment", () => {
        const list = createList();
        // Item 10 bottom at offset 550, container is 500px
        // scrollTop = 550 - 500 = 50
        const scrollTop = list.scrollToIndex(10, "end");
        expect(scrollTop).toBe(50);
      });

      it("should clamp scrollTop to 0", () => {
        const list = createList();
        const scrollTop = list.scrollToIndex(0, "center");
        expect(scrollTop).toBeGreaterThanOrEqual(0);
      });

      it("should handle first item", () => {
        const list = createList();
        expect(list.scrollToIndex(0, "start")).toBe(0);
      });
    });
  });

  describe("variable height items", () => {
    // Heights: index 0=30, index 1=60, index 2=30, index 3=60, ...
    const createVariableList = (overscan?: number) =>
      new VirtualList({
        itemCount: 20,
        itemHeight: (index: number) => (index % 2 === 0 ? 30 : 60),
        containerHeight: 200,
        overscan,
      });

    describe("getTotalHeight", () => {
      it("should sum all variable heights", () => {
        const list = createVariableList();
        // 10 items at 30 + 10 items at 60 = 300 + 600 = 900
        expect(list.getTotalHeight()).toBe(900);
      });
    });

    describe("getItemHeight", () => {
      it("should return correct height per index", () => {
        const list = createVariableList();
        expect(list.getItemHeight(0)).toBe(30);
        expect(list.getItemHeight(1)).toBe(60);
        expect(list.getItemHeight(2)).toBe(30);
        expect(list.getItemHeight(3)).toBe(60);
      });
    });

    describe("getItemOffset", () => {
      it("should return correct cumulative offset", () => {
        const list = createVariableList();
        expect(list.getItemOffset(0)).toBe(0);
        expect(list.getItemOffset(1)).toBe(30);     // 30
        expect(list.getItemOffset(2)).toBe(90);     // 30 + 60
        expect(list.getItemOffset(3)).toBe(120);    // 30 + 60 + 30
        expect(list.getItemOffset(4)).toBe(180);    // 30 + 60 + 30 + 60
      });
    });

    describe("getVisibleRange", () => {
      it("should calculate visible range with variable heights", () => {
        const list = createVariableList(0);
        const range = list.getVisibleRange(0);
        // Container is 200px, items: 30, 60, 30, 60, 30 = 210px -> items 0-4
        expect(range.startIndex).toBe(0);
        expect(range.endIndex).toBeGreaterThanOrEqual(4);
      });

      it("should work when scrolled with variable heights", () => {
        const list = createVariableList(0);
        const range = list.getVisibleRange(90); // at item 2 (offset 90)
        expect(range.startIndex).toBe(2);
        expect(range.offsetTop).toBe(90);
      });
    });

    describe("scrollToIndex", () => {
      it("should calculate correct scrollTop for variable height items", () => {
        const list = createVariableList();
        expect(list.scrollToIndex(2, "start")).toBe(90); // 30 + 60
        expect(list.scrollToIndex(4, "start")).toBe(180); // 30 + 60 + 30 + 60
      });
    });
  });

  describe("edge cases", () => {
    it("should handle empty list", () => {
      const list = new VirtualList({
        itemCount: 0,
        itemHeight: 50,
        containerHeight: 500,
      });

      expect(list.getTotalHeight()).toBe(0);
      const range = list.getVisibleRange(0);
      expect(range.startIndex).toBe(0);
      expect(range.endIndex).toBe(0);
      expect(range.totalHeight).toBe(0);
    });

    it("should handle single item", () => {
      const list = new VirtualList({
        itemCount: 1,
        itemHeight: 50,
        containerHeight: 500,
      });

      expect(list.getTotalHeight()).toBe(50);
      const range = list.getVisibleRange(0);
      expect(range.startIndex).toBe(0);
      expect(range.endIndex).toBe(1);
    });

    it("should handle items shorter than container", () => {
      const list = new VirtualList({
        itemCount: 3,
        itemHeight: 50,
        containerHeight: 500,
      });

      const range = list.getVisibleRange(0);
      expect(range.startIndex).toBe(0);
      expect(range.endIndex).toBe(3); // all items visible
      expect(range.totalHeight).toBe(150);
    });

    it("should default overscan to 3", () => {
      const list = new VirtualList({
        itemCount: 100,
        itemHeight: 50,
        containerHeight: 500,
      });

      const range = list.getVisibleRange(500); // items 10-19 visible
      // With default overscan of 3: startIndex should be 7
      expect(range.startIndex).toBe(7);
    });
  });
});

describe("VirtualGrid", () => {
  // 100 items, 4 columns, 100x100 each, container 400x300
  const createGrid = (overscan?: number) =>
    new VirtualGrid({
      itemCount: 100,
      columnCount: 4,
      itemWidth: 100,
      itemHeight: 100,
      containerWidth: 400,
      containerHeight: 300,
      overscan,
    });

  describe("getTotalHeight", () => {
    it("should calculate total height based on row count", () => {
      const grid = createGrid();
      // 100 items / 4 columns = 25 rows * 100px = 2500
      expect(grid.getTotalHeight()).toBe(2500);
    });

    it("should handle partial last row", () => {
      const grid = new VirtualGrid({
        itemCount: 10, // 2.5 rows -> 3 rows
        columnCount: 4,
        itemWidth: 100,
        itemHeight: 100,
        containerWidth: 400,
        containerHeight: 300,
      });
      expect(grid.getTotalHeight()).toBe(300); // ceil(10/4) = 3 rows * 100
    });
  });

  describe("getVisibleCells", () => {
    it("should return cells in visible rows at scrollTop 0", () => {
      const grid = createGrid(0); // no overscan
      const cells = grid.getVisibleCells(0);

      // Container 300px, row 100px -> 3 visible rows -> 12 cells
      expect(cells).toHaveLength(12);

      // First cell
      expect(cells[0]).toEqual({
        index: 0,
        row: 0,
        col: 0,
        x: 0,
        y: 0,
      });

      // Last cell in first row
      expect(cells[3]).toEqual({
        index: 3,
        row: 0,
        col: 3,
        x: 300,
        y: 0,
      });

      // First cell in second row
      expect(cells[4]).toEqual({
        index: 4,
        row: 1,
        col: 0,
        x: 0,
        y: 100,
      });
    });

    it("should return correct cells when scrolled", () => {
      const grid = createGrid(0);
      const cells = grid.getVisibleCells(200); // scrolled 2 rows down

      // First visible cell should be in row 2
      expect(cells[0].row).toBe(2);
      expect(cells[0].index).toBe(8); // row 2, col 0
      expect(cells[0].y).toBe(200);
    });

    it("should include overscan rows", () => {
      const grid = createGrid(2); // 2 rows overscan
      const cells = grid.getVisibleCells(500); // row 5 at top

      // Visible rows: 5, 6, 7 (3 rows)
      // With overscan 2: rows 3, 4, 5, 6, 7, 8, 9 (7 rows) -> 28 cells
      const rows = new Set(cells.map((c) => c.row));
      expect(rows.size).toBe(7);
    });

    it("should not include cells beyond itemCount", () => {
      const grid = new VirtualGrid({
        itemCount: 6, // 1.5 rows -> 2 rows, last row has 2 items
        columnCount: 4,
        itemWidth: 100,
        itemHeight: 100,
        containerWidth: 400,
        containerHeight: 300,
        overscan: 0,
      });

      const cells = grid.getVisibleCells(0);
      expect(cells).toHaveLength(6); // not 8
      expect(cells.every((c) => c.index < 6)).toBe(true);
    });
  });

  describe("scrollToIndex", () => {
    it("should return scrollTop for the row containing the item", () => {
      const grid = createGrid();

      // Item 0-3 in row 0
      expect(grid.scrollToIndex(0)).toBe(0);
      expect(grid.scrollToIndex(3)).toBe(0);

      // Item 4-7 in row 1
      expect(grid.scrollToIndex(4)).toBe(100);
      expect(grid.scrollToIndex(7)).toBe(100);

      // Item 8-11 in row 2
      expect(grid.scrollToIndex(8)).toBe(200);
    });
  });

  describe("edge cases", () => {
    it("should handle empty grid", () => {
      const grid = new VirtualGrid({
        itemCount: 0,
        columnCount: 4,
        itemWidth: 100,
        itemHeight: 100,
        containerWidth: 400,
        containerHeight: 300,
      });

      expect(grid.getTotalHeight()).toBe(0);
      expect(grid.getVisibleCells(0)).toEqual([]);
    });

    it("should handle single item", () => {
      const grid = new VirtualGrid({
        itemCount: 1,
        columnCount: 4,
        itemWidth: 100,
        itemHeight: 100,
        containerWidth: 400,
        containerHeight: 300,
        overscan: 0,
      });

      const cells = grid.getVisibleCells(0);
      expect(cells).toHaveLength(1);
      expect(cells[0]).toEqual({
        index: 0,
        row: 0,
        col: 0,
        x: 0,
        y: 0,
      });
    });

    it("should handle fewer items than columns", () => {
      const grid = new VirtualGrid({
        itemCount: 2,
        columnCount: 4,
        itemWidth: 100,
        itemHeight: 100,
        containerWidth: 400,
        containerHeight: 300,
        overscan: 0,
      });

      const cells = grid.getVisibleCells(0);
      expect(cells).toHaveLength(2);
      expect(cells[0].col).toBe(0);
      expect(cells[1].col).toBe(1);
    });

    it("should default overscan to 2", () => {
      const grid = new VirtualGrid({
        itemCount: 100,
        columnCount: 4,
        itemWidth: 100,
        itemHeight: 100,
        containerWidth: 400,
        containerHeight: 300,
      });

      const cells = grid.getVisibleCells(500);
      const rows = new Set(cells.map((c) => c.row));
      // 3 visible rows + 2 overscan each side = 7
      expect(rows.size).toBe(7);
    });
  });
});
