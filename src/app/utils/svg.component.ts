import { Component, Input } from '@angular/core';

@Component({
  selector: 'svg[icon]',
  standalone: true,
  template: `
    <svg:use
      [attr.href]="href"
      [attr.aria-label]="ariaLabel"
      role="img"
    ></svg:use>
  `,
})
export class SvgIconComponent {
  @Input() icon = '';
  @Input() label = '';

  get href(): string {
    return `/assets/svg/${this.icon}.svg#${this.icon}`;
  }

  get ariaLabel(): string {
    return this.label || this.icon;
  }
}
