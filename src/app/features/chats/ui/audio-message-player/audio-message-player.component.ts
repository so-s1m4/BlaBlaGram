import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SvgIconComponent } from '@utils/svg.component';

@Component({
  selector: 'app-audio-message-player',
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './audio-message-player.component.html',
  styleUrl: './audio-message-player.component.css',
})
export class AudioMessagePlayerComponent implements AfterViewInit {
  @ViewChild('audio') audioRef!: ElementRef<HTMLAudioElement>;
  @Input() src?: string;

  isPlaying = false;
  duration = 0;
  currentTime = 0;
  progress = 0;

  ngAfterViewInit() {
    const audio = this.audioRef.nativeElement;
    audio.load();

    audio.onloadedmetadata = () => {
      this.duration = audio.duration;
    };

    audio.ontimeupdate = () => {
      this.currentTime = audio.currentTime;
      this.duration = audio.duration;
      this.progress = (this.currentTime / this.duration) * 100 || 0;
    };

    audio.onended = () => {
      this.isPlaying = false;
      this.currentTime = 0;
      this.progress = 0;
    };
  }

  togglePlay(): void {
    const audio = this.audioRef.nativeElement;

    if (audio.paused) {
      audio.play();
      this.isPlaying = true;
    } else {
      audio.pause();
      this.isPlaying = false;
    }
  }

  seek(event: MouseEvent): void {
    const container = event.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;

    const audio = this.audioRef.nativeElement;
    audio.currentTime = percentage * audio.duration;
  }
}
