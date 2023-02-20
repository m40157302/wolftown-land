export enum Section {
  Lottery = "lottery",
  Crops = "crops",
  Water = "water",
  Wolf = "wolf",
  TV = "TV",
  Craft = "Craft",
  Build = "Build",
  Landbuild = "Landbuild",
  Pvp = "Pvp",
  Arena = "Arena",
  Market = "Market",
  Animals = "animals",
  Shop = "shop",
  Town = "town",
  Forest = "forest",
  GoblinVillage = "goblin-village",

  // NFT IDs
  "Sunflower Statue" = "sunflower-statue",
  "Potato Statue" = "potato-statue",
  "Christmas Tree" = "christmas-tree",
  Scarecrow = "scarecrow",
  "Farm Cat" = "farm-cat",
  "Farm Dog" = "farm-dog",
  Gnome = "gnome",
  "Chicken Coop" = "chicken-coop",
  "Sunflower Tombstone" = "sunflower-tombstone",
  "Sunflower Rock" = "sunflower-rock",
  "Goblin Crown" = "goblin-crown",
  Fountain = "fountain",
  Flags = "flags",
  Beaver = "beaver",
  "Nyon Statue" = "nyon-statue",
  Tent = "tent",
  Bath = "bath",
  "Easter Bunny" = "easter-bunny",
}

export const useScrollIntoView = () => {
  const scrollIntoView = (
    id: Section | undefined,
    behavior?: ScrollBehavior
  ) => {
    if (!id) return;

    const el = document.getElementById(id);

    el?.scrollIntoView({
      behavior: behavior || "smooth",
      block: "center",
      inline: "center",
    });
  };

  return [scrollIntoView];
};
