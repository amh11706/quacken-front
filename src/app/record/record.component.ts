import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'q-record',
    templateUrl: './record.component.html',
    styleUrls: ['./record.component.scss'],
    standalone: false
})
export class RecordComponent implements OnInit {
  isRecording = false;
  private stream?: MediaStream;
  private canvas?: HTMLCanvasElement;
  private context?: CanvasRenderingContext2D;
  private video = document.createElement('video');

  ngOnInit(): void {
    const canvas = document.getElementById('canvas');
    if (canvas instanceof HTMLCanvasElement) {
      this.canvas = canvas;
      this.context = canvas.getContext('2d') || undefined;
    }
  }

  toggleRecording(): void {
    void (this.isRecording ? this.stopRecording() : this.startRecording());
  }

  private async startRecording() {
    this.isRecording = true;
    this.stream = await (navigator.mediaDevices as any).getDisplayMedia({
      video: { frameRate: 2, displaySurface: 'window', cursor: 'never' },
    }).catch(() => this.isRecording = false);
    if (!this.stream) return;

    const tracks = this.stream.getTracks();
    if (tracks.length) {
      const firstTrack = tracks[0];
      if (!firstTrack) return;
      firstTrack.onended = () => this.isRecording = false;
    }

    this.video.srcObject = this.stream;
    void this.video.play();

    this.video.addEventListener('timeupdate', () => {
      if (!this.canvas || !this.context) return;
      this.canvas.height = this.video.videoHeight;
      this.canvas.width = this.video.videoWidth;
      this.context.drawImage(this.video, 0, 0);
    });
  }

  private stopRecording() {
    this.stream?.getTracks().forEach(track => track.stop());
  }
}
