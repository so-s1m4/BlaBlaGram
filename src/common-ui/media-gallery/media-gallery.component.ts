import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { API_URL } from '../../app/app.config';
import { SvgIconComponent } from '../../app/utils/svg.component';

@Component({
  selector: 'app-media-gallery',
  imports: [SvgIconComponent],
  templateUrl: './media-gallery.component.html',
  styleUrl: './media-gallery.component.css',
})
export class MediaGalleryComponent implements OnInit {
  API_URL = API_URL;

  @Input() media: any[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() delete = new EventEmitter<{ comId: string; mediaId: string }>();


  selectedMedia: any;

  goToMedia(mediaId: string) {
    this.selectedMedia = this.media.find(item => item._id === mediaId);
  }


  goBack() {
    const currentIndex = this.media.indexOf(this.selectedMedia);
    if (currentIndex > 0) {
      this.selectedMedia = this.media[currentIndex - 1];
    }
  }
  goForward() {
    const currentIndex = this.media.indexOf(this.selectedMedia);
    if (currentIndex < this.media.length - 1) {
      this.selectedMedia = this.media[currentIndex + 1];
    }
  }

  onClose() {
    this.close.emit();
  }
  onDelete(comId: string, mediaId: string) {
    this.delete.emit({ comId, mediaId });
  }

  ngOnInit() {
    if (this.media.length > 0) {
      this.selectedMedia = this.media[0];
    }
    console.log(this.media);
  }
}
