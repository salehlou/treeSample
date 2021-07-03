import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { TreeModel } from './Tree.model';
import { TreeData } from './TreeData.model';
import { FlatNode } from './flatNode.model';

const TREE_DATA = [
  { id: 1, nodeIcon: '', name: 'رابط کاربری', checked: false, parentId: 0, },
  { id: 2, nodeIcon: '', name: 'اطلاعات پایه', checked: false, parentId: 1, },
  { id: 3, nodeIcon: '', name: 'مدیریت چارت سازمانی', checked: true, parentId: 2, },
  { id: 4, nodeIcon: '', name: 'مدیریت ایستگاههای کنترل', checked: true, parentId: 2 },
  { id: 1002, nodeIcon: '', name: 'تعریف پرسنل جدید', checked: true, parentId: 3, },
  { id: 1003, nodeIcon: '', name: 'الکی 1', checked: false, parentId: 1 },
  { id: 1004, nodeIcon: '', name: 'الکی 2', checked: false, parentId: 1003 },
  { id: 1005, nodeIcon: '', name: 'الکی 3', checked: false, parentId: 1004 },
  { id: 1006, nodeIcon: '', name: 'کلا الکی', checked: false, parentId: 1004 },
  { id: 1007, nodeIcon: '', name: 'دولکی1', checked: false, parentId: 1 },
  { id: 1008, nodeIcon: '', name: 'دولی 2', checked: false, parentId: 1 },
  { id: 1009, nodeIcon: '', name: 'دولکی 3', checked: false, parentId: 1005 },
  { id: 1010, nodeIcon: '', name: 'حیوون UI', checked: true, parentId: 1005 },
];

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
    this.dataSource.data = this.getNodeChildren(0, TREE_DATA);
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
        return { id: data.id, name: data.name, checked: data.checked, nodeIcon: data.nodeIcon };
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
}