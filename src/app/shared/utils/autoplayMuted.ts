import { AfterContentChecked, AfterContentInit, AfterViewInit, Directive, ElementRef } from '@angular/core';

@Directive({
  selector: 'video[autoplayMuted]', // применится к <video autoplayMuted>
})
export class AutoplayMutedDirective implements AfterContentInit {
  constructor(private el: ElementRef<HTMLVideoElement>) {}

  ngAfterContentInit() {
    const video = this.el.nativeElement;
    video.muted = true;
    video.playsInline = true; // важно для iOS Safari

    video.play().catch((err) => {
      console.warn('Autoplay blocked by browser:', err);
    });
  }
}
