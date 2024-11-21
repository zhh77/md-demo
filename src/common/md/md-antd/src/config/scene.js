const UIScene = {
  Base: "base",
  List: "list",
  Search: "search",
  Edit: "edit",
  View: "view",
  isInput(scene) {
    return scene === UIScene.Edit || scene === UIScene.Search;
  }
};

export default UIScene;
