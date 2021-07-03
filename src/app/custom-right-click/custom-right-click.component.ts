import { Component, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-custom-right-click',
  templateUrl: './custom-right-click.component.html',
  styleUrls: ['./custom-right-click.component.scss']
})
export class CustomRightClickComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' }
  ];
  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };

  onContextMenu(event: MouseEvent, item: Item) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menuData = { 'item': item };
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }
  onContextMenuAction1(item: Item) {
    alert(`Click on Action 1 for ${item.name}`);
  }
  onContextMenuAction2(item: Item) {
    alert(`Click on Action 2 for ${item.name}`);
  }
}

export interface Item {
  id: number;
  name: string;
}