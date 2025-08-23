import {
  Directive,
  ElementRef,
  EventEmitter,
  Output,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';

@Directive({
  selector: '[appOnVisibleOnce]',
})
export class OnVisibleOnceDirective implements AfterViewInit, OnDestroy {
  @Output() visibleOnce = new EventEmitter<HTMLElement>();
  private observer?: IntersectionObserver;

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.visibleOnce.emit(this.el.nativeElement);
            this.observer?.unobserve(this.el.nativeElement); // stop after first trigger
          }
        });
      },
      { threshold: 0.5 }
    ); // only when at least 50% is visible

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
