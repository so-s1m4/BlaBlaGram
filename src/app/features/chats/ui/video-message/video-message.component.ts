import { CommonModule } from '@angular/common';
import {
  Component,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';

@Component({
  selector: 'app-video-message',
  templateUrl: './video-message.component.html',
  styleUrls: ['./video-message.component.css'],
  imports: [CommonModule],
})
export class VideoMessageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef;

  @Output() onstop = new EventEmitter<Blob | 'error'>();

  mediaRecorder!: MediaRecorder;
  chunks: Blob[] = [];
  stream!: MediaStream;
  recording: boolean = false;
  videoUrl: string | null = null;

  private stopTimeoutId: any;
  private objectUrlToRevoke: string | null = null;

  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      // Ensure autoplay policies are satisfied and audio is muted
      this.videoElement.nativeElement.muted = true;
      this.videoElement.nativeElement.autoplay = true;
      // iOS/Safari requires playsInline for autoplay without fullscreen
      this.videoElement.nativeElement.playsInline = true;
      this.videoElement.nativeElement.srcObject = this.stream;
      try {
        await this.videoElement.nativeElement.play();
      } catch (e) {
        // Autoplay could still be blocked; ignored because we call play once stream is ready
      }
    } catch (err) {
      console.error('Camera access denied:', err);
    }
  }

  async ngAfterViewInit() {
    await this.startCamera();
    setTimeout(this.startRecording.bind(this), 500);

    this.stopTimeoutId = setTimeout(this.stop.bind(this), 60000);
  }

  startRecording() {
    if (!this.stream) {
      this.onstop.emit('error');
      return;
    }
    this.recording = true;
    this.chunks = [];
    this.mediaRecorder = new MediaRecorder(this.stream);

    this.mediaRecorder.ondataavailable = (e) => this.chunks.push(e.data);
    this.mediaRecorder.onstop = () => {
      try {
        const blob = new Blob(this.chunks, { type: 'video/webm; codecs=opus' });
        this.videoUrl = URL.createObjectURL(blob);
        this.objectUrlToRevoke = this.videoUrl;
        this.onstop.emit(blob);
      } catch {
        this.onstop.emit('error');
        console.log('error');
      }
    };

    this.mediaRecorder.start();
  }

  public stop(): void {
    // prevent repeated calls
    if (this.stopTimeoutId) {
      clearTimeout(this.stopTimeoutId);
      this.stopTimeoutId = null;
    }

    this.recording = false;

    // Stop MediaRecorder if active
    try {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
    } catch {}

    // Stop all media tracks (video + audio)
    try { this.stream?.getTracks().forEach(t => t.stop()); } catch {}

    // Detach video element to release device on Safari/iOS
    try {
      const el: HTMLVideoElement = this.videoElement?.nativeElement;
      if (el) {
        el.pause();
        (el as any).srcObject = null;
        el.removeAttribute('src');
        el.load();
      }
    } catch {}

    // Revoke object URL if any
    try { if (this.objectUrlToRevoke) { URL.revokeObjectURL(this.objectUrlToRevoke); } } catch {}

    // Null out references
    this.stream = undefined as any;
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
