import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { SvgIconComponent } from '@utils/svg.component';
import { GlassEffectDirective } from "@shared/common-ui/glass-wrapper-component/glass-wrapper-component";

@Component({
  selector: 'app-context-menu',
  imports: [CommonModule, SvgIconComponent, GlassEffectDirective],
  templateUrl: './context-menu.component.html',
  styleUrl: './context-menu.component.css',
})
export class ContextMenuComponent {
  @Input() items: { label: string; action: Function; svg?: string }[] = [];
  @Input() style: any = {};
}
