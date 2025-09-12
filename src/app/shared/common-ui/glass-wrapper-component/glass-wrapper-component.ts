// src/app/shared/directives/set-var.directive.ts
import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[GlassEffect]',
  standalone: true,
})
export class GlassEffectDirective implements AfterViewInit {
  constructor(private el: ElementRef<HTMLElement>) {}

  /** Usage: [appSetVar]="'--lg-speed: 1.3'" */
  @Input() set appSetVar(definition: string) {
    // Expect "--name: value"
    if (!definition?.includes(':')) return;
    const [name, raw] = definition.split(':');
    const value = raw.trim().replace(/;$/, '');
    this.el.nativeElement.style.setProperty(name.trim(), value);
  }

  ngAfterViewInit(): void {
    this.el.nativeElement.style.background =
      'rgba(255, 255, 255, var(--glass-alpha, 0.08))';
    this.el.nativeElement.style.backdropFilter =
      'blur(20px) saturate(80%)';
    (this.el.nativeElement.style as any)['-webkit-backdrop-filter'] =
      'blur(20px) saturate(80%)';
    this.el.nativeElement.style.border =
      '1px solid rgba(255, 255, 255, var(--glass-stroke, 0.15))';
    this.el.nativeElement.style.boxShadow = '0 8px 30px rgba(0,0,0,.12)';
    this.el.nativeElement.style.backgroundClip = 'padding-box';
  }
}
