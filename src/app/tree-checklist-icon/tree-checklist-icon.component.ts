import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { TreeModel } from '../models/Tree.model';
import { TreeData } from '../models/TreeData.model';
import { FlatNode } from '../models/flatNode.model';
import { MOCK_DATA } from '../models/mock-data';
import { MatMenuTrigger } from '@angular/material/menu';
import { RightClickItem } from '../models/right-click-item.model';

@Component({
  selector: 'app-tree-checklist-icon',
  templateUrl: './tree-checklist-icon.component.html',
  styleUrls: ['./tree-checklist-icon.component.scss']
})
export class TreeChecklistIconComponent {
  treeControl: FlatTreeControl<FlatNode>;
  treeFlattener: MatTreeFlattener<TreeModel, FlatNode>;
  dataSource: MatTreeFlatDataSource<TreeModel, FlatNode>;
  checklistSelection = new SelectionModel<FlatNode>(true);
  constructor() {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren,
    );
    this.treeControl = new FlatTreeControl<FlatNode>(
      this.getLevel,
      this.isExpandable
    );
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener
    );
    this.dataSource.data = this.getNodeChildren(0, MOCK_DATA);
    this.checklistSelection.select(
      ...this.treeControl.dataNodes.filter((node) => node.checked)
    );
    this.treeControl.expandAll();
  }
  getLevel = (node: FlatNode) => node.level;
  isExpandable = (node: FlatNode) => node.expandable;
  getChildren = (node: TreeModel): TreeModel[] => node.children!;
  hasChild = (_: number, _nodeData: FlatNode) => _nodeData.expandable;
  getNodeChildren(parentId: number, treeData: TreeData[]): TreeModel[] {
    let result = treeData.filter((data) => data.parentId === parentId);
    if (result.length === 0) {
      return result.map<TreeModel>((data) => {
        return {
          id: data.id,
          name: data.name,
          checked: data.checked,
          nodeIcon: data.nodeIcon
        };
      });
    } else {
      return result.map<TreeModel>((data) => {
        return {
          id: data.id,
          name: data.name,
          checked: data.checked,
          nodeIcon: data.nodeIcon,
          children: this.getNodeChildren(data.id, treeData),
        };
      });
    }
  }
  transformer = (node: TreeModel, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
      checked: node.checked,
      nodeIcon: node.nodeIcon,
    };
  };
  descendantsAllSelected(node: FlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every((child) => {
        return this.checklistSelection.isSelected(child);
      });
    return descAllSelected;
  }
  descendantsPartiallySelected(node: FlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some((child) =>
      this.checklistSelection.isSelected(child)
    );
    return result && !this.descendantsAllSelected(node);
  }
  itemSelectionToggle(node: FlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);
    this.checkAllParentsSelection(node);
  }
  leafItemSelectionToggle(node: FlatNode): void {
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }
  checkAllParentsSelection(node: FlatNode): void {
    let parent: FlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }
  checkRootNodeSelection(node: FlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every((child) => {
        return this.checklistSelection.isSelected(child);
      });
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }
  getParentNode(node: FlatNode): FlatNode | null {
    const currentLevel = this.getLevel(node);
    if (currentLevel < 1) { return null; }
    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;
    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];
      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  filterChanged(event: any) {

    const filterText = event.data;
    debugger;
    // this.filter(filterText);
    // if (filterText) {
    //   this.treeControl.expandAll();
    // } else {
    //   this.treeControl.collapseAll();
    // }
  }
  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };

  onContextMenu(event: MouseEvent, item: RightClickItem) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menuData = { 'item': item };
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }
  onContextMenuAction1(item: RightClickItem) {
    alert(`Click on Action 1 for ${item.name}`);
  }
  onContextMenuAction2(item: RightClickItem) {
    alert(`Click on Action 2 for ${item.name}`);
  }
}
