import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { SvgIconComponent } from '../../app/utils/svg.component';

@Component({
  selector: 'app-context-menu',
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './context-menu.component.html',
  styleUrl: './context-menu.component.css',
})
export class ContextMenuComponent {
  @Input() items: { label: string; action: Function; svg?: string }[] = [];
  @Input() style: any = {};
}
