import UIService from '../uiService';

class LayoutBuilder {
  constructor(config, renderer) {
    this.config = UIService.getUIConfig('AutoLayout', config);
    this.renderer = renderer;
    // if(this.config.components) {
    //     this.Col =  UIService.getUI(this.config.components.col);
    //     this.Row =  UIService.getUI(this.config.components.row);
    //     // this.Group =  UIService.getUI(this.config.components.row);
    // }
    this.clear();
  }

  addGroup(group) {
    const colNum = group.colNum || this.config.colNum;

    this.currentColumn = [];
    this.currentGroup = {
      title: group.title,
      children: [this.currentColumn],
      colNum,
    };
    this.currentColNum = colNum;
    this.groups.push(this.currentGroup);
  }

  addItem(item, colNum) {
    if (this.currentGroup == null) {
      this.addGroup({ colNum });
    }

    if (colNum == null) {
      colNum = this.currentColNum;
    }

    if (this.currentColumn.length === colNum) {
      this.currentColumn = [];
      this.currentGroup.children.push(this.currentColumn);
    }
    this.currentColumn.push(item);
  }

  clear() {
    this.groups = [];
    // this.currentGroup = {
    //   children: [],
    // };
    // this.currentColumn = [];
    // this.currentGroup.children.push(this.currentColumn);
  }

  render() {
    return this.renderer && this.renderer.render(this.groups, this.config);
  }
}

export default LayoutBuilder;
