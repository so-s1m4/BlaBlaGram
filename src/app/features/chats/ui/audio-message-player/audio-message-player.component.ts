import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
  NgZone,
  Output,
  EventEmitter,
} from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SvgIconComponent } from '@utils/svg.component';

@Component({
  selector: 'app-audio-message-player',
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './audio-message-player.component.html',
  styleUrl: './audio-message-player.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioMessagePlayerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('audio') audioRef!: ElementRef<HTMLAudioElement>;
  @Input() src?: string;
  @Output() read = new EventEmitter();

  private readonly destroy$ = new Subject<void>();

  private get audio(): HTMLAudioElement {
    return this.audioRef.nativeElement;
  }

  isPlaying = false;
  duration = 0;
  currentTime = 0;
  progress = 0;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly ngZone: NgZone,
    private readonly destroyRef: DestroyRef
  ) {}

  ngAfterViewInit() {
    const audio = this.audio;

    // Run listeners outside Angular to minimize change detection thrash
    this.ngZone.runOutsideAngular(() => {
      fromEvent(audio, 'loadedmetadata')
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          // Re-enter Angular zone for UI updates
          this.ngZone.run(() => {
            this.duration = Number.isFinite(audio.duration)
              ? audio.duration
              : 0;
            this.cdr.markForCheck();
          });
        });

      fromEvent(audio, 'timeupdate')
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.ngZone.run(() => {
            this.currentTime = audio.currentTime || 0;
            const dur = Number.isFinite(audio.duration) ? audio.duration : 0;
            this.duration = dur;
            this.progress = dur > 0 ? (this.currentTime / dur) * 100 : 0;
            this.cdr.markForCheck();
          });
        });

      fromEvent(audio, 'ended')
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.ngZone.run(() => {
            this.isPlaying = false;
            this.currentTime = 0;
            this.progress = 0;
            this.cdr.markForCheck();
          });
        });

      fromEvent(audio, 'play')
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.ngZone.run(() => {
            this.read.emit();
            this.isPlaying = true;
            this.cdr.markForCheck();
          });
        });

      fromEvent(audio, 'pause')
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.ngZone.run(() => {
            this.isPlaying = false;
            this.cdr.markForCheck();
          });
        });
    });

    // Ensure metadata is loaded when view initializes
    audio.load();
  }

  togglePlay(): void {
    const audio = this.audio;
    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  }

  seek(event: MouseEvent): void {
    const container = event.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
    const percentage = rect.width > 0 ? clickX / rect.width : 0;

    const audio = this.audio;
    const dur = Number.isFinite(audio.duration) ? audio.duration : 0;
    if (dur > 0) {
      audio.currentTime = Math.max(0, Math.min(percentage * dur, dur));
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
