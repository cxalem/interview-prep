import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  NFTGalleryManager,
  NFT,
  NFTFetcher,
  FetchResult,
} from "./index";

function createNFT(overrides: Partial<NFT> = {}): NFT {
  return {
    id: overrides.id ?? `nft-${Math.random().toString(36).slice(2)}`,
    name: overrides.name ?? "Test NFT",
    image: overrides.image ?? "https://example.com/nft.png",
    collection: overrides.collection ?? "TestCollection",
    attributes: overrides.attributes ?? { Background: "Blue", Rarity: "Common" },
    price: overrides.price,
    listingStatus: overrides.listingStatus ?? "unlisted",
  };
}

const SAMPLE_NFTS: NFT[] = [
  createNFT({ id: "1", name: "Alpha Ape", collection: "DeGods", price: 100, listingStatus: "listed", attributes: { Background: "Blue", Rarity: "Rare" } }),
  createNFT({ id: "2", name: "Beta Bear", collection: "DeGods", price: 50, listingStatus: "listed", attributes: { Background: "Red", Rarity: "Common" } }),
  createNFT({ id: "3", name: "Gamma Ghost", collection: "y00ts", price: 200, listingStatus: "auction", attributes: { Background: "Green", Rarity: "Legendary" } }),
  createNFT({ id: "4", name: "Delta Dog", collection: "y00ts", price: 75, listingStatus: "unlisted", attributes: { Background: "Blue", Rarity: "Common" } }),
  createNFT({ id: "5", name: "Epsilon Eagle", collection: "SMB", price: 150, listingStatus: "listed", attributes: { Background: "Red", Rarity: "Rare" } }),
];

const SECOND_PAGE_NFTS: NFT[] = [
  createNFT({ id: "6", name: "Zeta Zebra", collection: "SMB", price: 120, listingStatus: "listed" }),
  createNFT({ id: "7", name: "Eta Elephant", collection: "DeGods", price: 300, listingStatus: "auction" }),
];

function createMockFetcher(pages: NFT[][] = [SAMPLE_NFTS, SECOND_PAGE_NFTS]): NFTFetcher {
  return vi.fn(async (page: number, pageSize: number): Promise<FetchResult> => {
    const items = pages[page - 1] ?? [];
    return {
      items,
      total: pages.flat().length,
      hasMore: page < pages.length,
    };
  });
}

describe("NFTGalleryManager", () => {
  let gallery: NFTGalleryManager;
  let fetcher: NFTFetcher;

  beforeEach(() => {
    fetcher = createMockFetcher();
    gallery = new NFTGalleryManager(fetcher);
  });

  describe("pagination", () => {
    it("should load the first page of items", async () => {
      await gallery.loadPage(1, 20);
      expect(gallery.getFilteredItems()).toHaveLength(5);
    });

    it("should set loading state during fetch", async () => {
      const states: boolean[] = [];
      gallery.subscribe((state) => states.push(state.isLoading));

      await gallery.loadPage(1, 20);

      expect(states).toContain(true);
      expect(gallery.getState().isLoading).toBe(false);
    });

    it("should track hasMore correctly", async () => {
      await gallery.loadPage(1, 20);
      expect(gallery.getState().hasMore).toBe(true);

      await gallery.loadMore();
      expect(gallery.getState().hasMore).toBe(false);
    });

    it("should handle fetch errors", async () => {
      const failingFetcher = vi.fn().mockRejectedValue(new Error("Network error"));
      const failGallery = new NFTGalleryManager(failingFetcher);

      await failGallery.loadPage(1, 20);

      expect(failGallery.getState().error).toBeTruthy();
      expect(failGallery.getState().isLoading).toBe(false);
    });

    it("should update totalLoaded", async () => {
      await gallery.loadPage(1, 20);
      expect(gallery.getState().totalLoaded).toBe(5);
    });
  });

  describe("infinite scroll (loadMore)", () => {
    it("should append items from next page", async () => {
      await gallery.loadPage(1, 20);
      expect(gallery.getFilteredItems()).toHaveLength(5);

      await gallery.loadMore();
      expect(gallery.getFilteredItems()).toHaveLength(7);
    });

    it("should not load more when already loading", async () => {
      await gallery.loadPage(1, 20);

      // Start two loadMore calls
      const p1 = gallery.loadMore();
      const p2 = gallery.loadMore();

      await Promise.all([p1, p2]);

      // Fetcher should have been called once for loadPage + once for loadMore
      expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it("should not load more when hasMore is false", async () => {
      const singlePageFetcher = createMockFetcher([SAMPLE_NFTS]);
      const singleGallery = new NFTGalleryManager(singlePageFetcher);

      await singleGallery.loadPage(1, 20);
      await singleGallery.loadMore();

      expect(singlePageFetcher).toHaveBeenCalledTimes(1);
    });
  });

  describe("filtering (single)", () => {
    beforeEach(async () => {
      await gallery.loadPage(1, 20);
    });

    it("should filter by collection", () => {
      gallery.setFilter({ collection: "DeGods" });
      const items = gallery.getFilteredItems();
      expect(items).toHaveLength(2);
      expect(items.every((i) => i.collection === "DeGods")).toBe(true);
    });

    it("should filter by listing status", () => {
      gallery.setFilter({ listingStatus: "listed" });
      const items = gallery.getFilteredItems();
      expect(items.every((i) => i.listingStatus === "listed")).toBe(true);
    });

    it("should filter by price range", () => {
      gallery.setFilter({ priceRange: { min: 100, max: 200 } });
      const items = gallery.getFilteredItems();
      expect(items.every((i) => i.price! >= 100 && i.price! <= 200)).toBe(true);
    });

    it("should filter by attribute", () => {
      gallery.setFilter({ attribute: { traitType: "Background", value: "Blue" } });
      const items = gallery.getFilteredItems();
      expect(items.every((i) => i.attributes["Background"] === "Blue")).toBe(true);
    });
  });

  describe("filtering (combined)", () => {
    beforeEach(async () => {
      await gallery.loadPage(1, 20);
    });

    it("should apply multiple filters simultaneously", () => {
      gallery.setFilter({
        collection: "DeGods",
        listingStatus: "listed",
      });
      const items = gallery.getFilteredItems();
      expect(
        items.every(
          (i) => i.collection === "DeGods" && i.listingStatus === "listed"
        )
      ).toBe(true);
    });

    it("should return empty array when no items match all filters", () => {
      gallery.setFilter({
        collection: "DeGods",
        listingStatus: "auction",
      });
      expect(gallery.getFilteredItems()).toHaveLength(0);
    });
  });

  describe("sorting", () => {
    beforeEach(async () => {
      await gallery.loadPage(1, 20);
    });

    it("should sort by price ascending", () => {
      gallery.setSort("price", "asc");
      const items = gallery.getFilteredItems();
      for (let i = 1; i < items.length; i++) {
        if (items[i].price !== undefined && items[i - 1].price !== undefined) {
          expect(items[i].price!).toBeGreaterThanOrEqual(items[i - 1].price!);
        }
      }
    });

    it("should sort by price descending", () => {
      gallery.setSort("price", "desc");
      const items = gallery.getFilteredItems();
      for (let i = 1; i < items.length; i++) {
        if (items[i].price !== undefined && items[i - 1].price !== undefined) {
          expect(items[i].price!).toBeLessThanOrEqual(items[i - 1].price!);
        }
      }
    });

    it("should sort by name ascending", () => {
      gallery.setSort("name", "asc");
      const items = gallery.getFilteredItems();
      for (let i = 1; i < items.length; i++) {
        expect(items[i].name.localeCompare(items[i - 1].name)).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("search", () => {
    beforeEach(async () => {
      await gallery.loadPage(1, 20);
    });

    it("should search items by name (exact substring)", () => {
      gallery.search("Alpha");
      const items = gallery.getFilteredItems();
      expect(items).toHaveLength(1);
      expect(items[0].name).toBe("Alpha Ape");
    });

    it("should search case-insensitively", () => {
      gallery.search("alpha");
      const items = gallery.getFilteredItems();
      expect(items).toHaveLength(1);
    });

    it("should return all items when search query is empty", () => {
      gallery.search("");
      expect(gallery.getFilteredItems()).toHaveLength(5);
    });

    it("should combine search with filters", () => {
      gallery.setFilter({ collection: "DeGods" });
      gallery.search("Beta");
      const items = gallery.getFilteredItems();
      expect(items).toHaveLength(1);
      expect(items[0].name).toBe("Beta Bear");
    });
  });

  describe("selection management", () => {
    beforeEach(async () => {
      await gallery.loadPage(1, 20);
    });

    it("should select an item", () => {
      gallery.selectItem("1");
      expect(gallery.getSelection()).toHaveLength(1);
      expect(gallery.getSelection()[0].id).toBe("1");
    });

    it("should deselect an item", () => {
      gallery.selectItem("1");
      gallery.deselectItem("1");
      expect(gallery.getSelection()).toHaveLength(0);
    });

    it("should select all filtered items", () => {
      gallery.setFilter({ collection: "DeGods" });
      gallery.selectAll();
      expect(gallery.getSelection()).toHaveLength(2);
    });

    it("should deselect all items", () => {
      gallery.selectItem("1");
      gallery.selectItem("2");
      gallery.deselectAll();
      expect(gallery.getSelection()).toHaveLength(0);
    });

    it("should not duplicate selections", () => {
      gallery.selectItem("1");
      gallery.selectItem("1");
      expect(gallery.getSelection()).toHaveLength(1);
    });
  });

  describe("collections and attributes", () => {
    beforeEach(async () => {
      await gallery.loadPage(1, 20);
    });

    it("should return unique collections", () => {
      const collections = gallery.getCollections();
      expect(collections).toContain("DeGods");
      expect(collections).toContain("y00ts");
      expect(collections).toContain("SMB");
      expect(collections).toHaveLength(3);
    });

    it("should return unique attribute values for a trait type", () => {
      const backgrounds = gallery.getAttributeValues("Background");
      expect(backgrounds).toContain("Blue");
      expect(backgrounds).toContain("Red");
      expect(backgrounds).toContain("Green");
    });
  });

  describe("state subscriptions", () => {
    it("should notify on loadPage", async () => {
      const listener = vi.fn();
      gallery.subscribe(listener);
      await gallery.loadPage(1, 20);
      expect(listener).toHaveBeenCalled();
    });

    it("should notify on setFilter", async () => {
      await gallery.loadPage(1, 20);
      const listener = vi.fn();
      gallery.subscribe(listener);
      gallery.setFilter({ collection: "DeGods" });
      expect(listener).toHaveBeenCalled();
    });

    it("should support unsubscribe", async () => {
      const listener = vi.fn();
      const unsub = gallery.subscribe(listener);
      unsub();
      await gallery.loadPage(1, 20);
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
