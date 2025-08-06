import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Output,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'app-audio-message',
  templateUrl: './audio-message.component.html',
  styleUrls: ['./audio-message.component.css'],
})
export class AudioMessageComponent implements AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private canvasCtx!: CanvasRenderingContext2D;
  private audioContext!: AudioContext;
  private analyser!: AnalyserNode;
  private dataArray!: Uint8Array;
  private mediaRecorder!: MediaRecorder;
  private chunks: Blob[] = [];
  private source!: MediaStreamAudioSourceNode;
  private stream!: MediaStream;
  isRecording = false;

  styles = getComputedStyle(document.documentElement);

  @Output() audioReady = new EventEmitter<Blob>();

  ngAfterViewInit(): void {
    this.canvasCtx = this.canvasRef.nativeElement.getContext('2d')!;
  }
  async startRecording(): Promise<void> {
    console.log('started ');
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.source = this.audioContext.createMediaStreamSource(this.stream);
    this.source.connect(this.analyser);
    this.analyser.fftSize = 2048;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    this.drawWaveform();

    return new Promise((resolve) => {
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.mediaRecorder.ondataavailable = (e) => this.chunks.push(e.data);
      this.mediaRecorder.onstop = this.saveRecording.bind(this);
      this.mediaRecorder.start();
      this.isRecording = true;
      resolve();
    });
  }
  endRecording() {
    this.mediaRecorder.stop();
    this.stream.getTracks().forEach((track) => track.stop());
    this.isRecording = false;
  }

  private drawWaveform(): void {
    requestAnimationFrame(() => this.drawWaveform());
    if (!this.analyser) return;

    this.analyser.getByteTimeDomainData(this.dataArray);

    const canvas = this.canvasRef.nativeElement;
    this.canvasCtx.fillStyle = this.styles
      .getPropertyValue('--secondary-color')
      .trim();
    this.canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    this.canvasCtx.lineWidth = 2;
    this.canvasCtx.strokeStyle = this.styles
      .getPropertyValue('--primary-color')
      .trim();
    this.canvasCtx.beginPath();

    const sliceWidth = canvas.width / this.dataArray.length;
    let x = 0;

    for (let i = 0; i < this.dataArray.length; i++) {
      const v = this.dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;
      i === 0 ? this.canvasCtx.moveTo(x, y) : this.canvasCtx.lineTo(x, y);
      x += sliceWidth;
    }

    this.canvasCtx.lineTo(canvas.width, canvas.height / 2);
    this.canvasCtx.stroke();
  }

  private saveRecording(): void {
    const blob = new Blob(this.chunks, { type: 'audio/webm' });
    this.audioReady.emit(blob);
    this.chunks = [];
  }
}
