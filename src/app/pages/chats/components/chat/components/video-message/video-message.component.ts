import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, Output, EventEmitter, OnInit, AfterViewInit } from '@angular/core';
import { createUrlTreeFromSnapshot } from '@angular/router';

@Component({
  selector: 'app-video-message',
  templateUrl: './video-message.component.html',
  styleUrls: ['./video-message.component.css'],
  imports: [CommonModule]
})
export class VideoMessageComponent implements AfterViewInit {
  @ViewChild('videoElement') videoElement!: ElementRef;

  @Output() onstop = new EventEmitter<Blob>();

  mediaRecorder!: MediaRecorder;
  chunks: Blob[] = [];
  stream!: MediaStream;
  recording: boolean = false;
  videoUrl: string | null = null;

  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      this.videoElement.nativeElement.srcObject = this.stream;
    } catch (err) {
      console.error('Camera access denied:', err);
    }
  }

  async ngAfterViewInit(){
    await this.startCamera()
    this.startRecording()

    setTimeout(this.stop.bind(this), 60000)
  }

  startRecording() {
    if (!this.stream) return;
    this.recording = true;
    this.chunks = [];
    this.mediaRecorder = new MediaRecorder(this.stream);

    this.mediaRecorder.ondataavailable = (e) => this.chunks.push(e.data);
    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.chunks, { type: 'video/webm' });
      this.videoUrl = URL.createObjectURL(blob);
      this.onstop.emit(blob);
    };

    this.mediaRecorder.start();
  }

  public stop(): void {
    console.log(true);

    this.recording = false;
    this.mediaRecorder.stop();
  }
}
