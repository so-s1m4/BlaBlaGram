import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { API_URL } from 'app/app.config';
import { SvgIconComponent } from '@utils/svg.component';
import { MediaPipe } from '@utils/media.pipe';

@Component({
  selector: 'app-media-preview',
  imports: [CommonModule, SvgIconComponent, MediaPipe],
  templateUrl: './media-preview.component.html',
  styleUrl: './media-preview.component.css',
})
export class MediaPreviewComponent implements AfterViewInit, OnInit, OnChanges {
  @ViewChild('holder') holder!: ElementRef<HTMLDivElement>;
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  API_URL = API_URL;

  @Input() imageMedia: any[] = [];
  @Output() openMedia = new EventEmitter<void>();
  @Output() read = new EventEmitter<void>();

  imageToShow: any[] = [];

  ngOnInit(): void {
    this.imageToShow = this.imageMedia.map((media, index) => ({
      ...media,
      gridArea: String.fromCharCode(97 + index),
    }));
  }

  setupGridTemplateAreas() {
    let holder: ElementRef<HTMLDivElement> | HTMLElement =
      this.holder?.nativeElement;
    if (!holder) {
      return;
    }

    if (this.imageMedia.length) {
      switch (this.imageMedia.length) {
        case 1:
          holder.style.gridTemplateAreas = `"a"`;
          holder.style.width = '100%';
          holder.style.gridTemplateColumns = '100%';
          holder.style.gridTemplateRows = '100%';
          holder.style.height = 'min(400px, 30vh)';
          break;
        case 2:
          holder.style.gridTemplateAreas = `"a b"`;
          holder.style.gridTemplateColumns = '60% 40%';
          holder.style.gridAutoRows = 'calc(100%)';
          holder.style.width = 'min(420px, 70vw)';
          break;
        case 3:
          holder.style.gridTemplateAreas = `"a b" "a c"`;
          holder.style.gridTemplateColumns = '75% 25%';
          holder.style.gridAutoRows = 'calc(100% / 2)';
          holder.style.width = 'min(416px, 70vw)';
          holder.style.height = '420px';
          break;
        case 4:
          holder.style.gridTemplateAreas = `"a b" "a c" "a d"`;
          holder.style.gridTemplateColumns = '70% 30%';
          holder.style.gridTemplateRows = '';
          holder.style.gridAutoRows = 'calc(100% / 3)';
          holder.style.width = 'min(352px, 70vw)';
          holder.style.height = '420px';
          break;
        case 5:
          holder.style.gridTemplateAreas = `"a a a b b b" "c c d d e e"`;
          holder.style.gridTemplateRows = '60% 40%';
          holder.style.gridAutoColumns = 'calc(100% / 6)';
          holder.style.width = 'min(420px, 70vw)';
          holder.style.height = '466px';
          break;
        case 6:
          holder.style.gridTemplateAreas = `"a b c" "d e f"`;
          holder.style.gridTemplateRows = '';
          holder.style.gridAutoRows = 'calc(100% / 2)';
          holder.style.gridAutoColumns = 'calc(100% / 3)';
          holder.style.width = 'min(420px, 70vw)';
          holder.style.height = '373px';
          break;
        case 7:
          holder.style.gridTemplateAreas = `"a a a b b b" "c c c d d d" "e e f f g g"`;
          holder.style.gridTemplateRows = '38% 38% 25%';
          holder.style.width = 'min(420px, 70vw)';
          holder.style.height = '746px';
          break;
        case 8:
          holder.style.gridTemplateAreas = `"a a a b b b" "c c d d e e" "f f g g h h"`;
          holder.style.gridTemplateRows = '44% 28% 28%';
          holder.style.gridAutoColumns = '1fr';
          holder.style.width = 'min(420px, 70vw)';
          holder.style.height = '653px';
          break;
        case 9:
          holder.style.gridTemplateAreas = `"a b c" "d e f" "g h i"`;
          holder.style.width = 'min(420px, 70vw)';
          holder.style.gridAutoColumns = '1fr';
          holder.style.gridAutoRows = 'calc(100% / 3)';
          holder.style.height = '560px';
          break;
        case 10:
          holder.style.gridTemplateAreas = `
          "a a a b b b"
          "a a a b b b"
          "a a a b b b"
          "c c c d d d"
          "c c c d d d"
          "c c c d d d"
          "e e f f g g"
          "e e f f g g"
          "h h i i j j"
          "h h i i j j"
          `;
          holder.style.gridAutoRows = 'calc(100% / 10)';
          holder.style.gridAutoColumns = 'calc(100% / 6)';
          holder.style.width = 'min(420px, 70vw)';
          holder.style.height = '933px';
          break;
      }
    }
  }
  ngAfterViewInit() {
    this.setupGridTemplateAreas();
    window.addEventListener('resize', this.onResize.bind(this));
  }
  onResize() {
    this.setupGridTemplateAreas();
  }
  ngOnChanges() {
    this.imageToShow = this.imageMedia.map((media, index) => ({
      ...media,
      gridArea: String.fromCharCode(97 + index),
    }));
    this.setupGridTemplateAreas();
  }
  playPause() {
    const el = this.video?.nativeElement;
    if (!el) return;
    if (el.paused) {
      const p = el.play();
      el.classList.add('playing');
      this.read.emit();

      el.onended = () => {
        el.classList.remove('playing');
      };
      el.onpause = () => {
        el.classList.remove('playing');
      };
      if (p && typeof (p as any).then === 'function') {
        (p as Promise<void>).catch((err) => {
          console.warn('Playback failed:', err);
        });
      }
    } else {
      el.pause();
    }
  }
}
