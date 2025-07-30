import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-media-gallery',
  imports: [],
  templateUrl: './media-gallery.component.html',
  styleUrl: './media-gallery.component.css'
})
export class MediaGalleryComponent {

  @Input() media: any[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() delete = new EventEmitter<{comId: string, mediaId: string}>();

  
}
