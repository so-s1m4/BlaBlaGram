import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ImgPipe } from '@utils/img.pipe';
import { SvgIconComponent } from '@utils/svg.component';
import { Modal } from "@shared/common-ui/modal/modal";

@Component({
  selector: 'app-photo-gallery',
  imports: [ImgPipe, SvgIconComponent, Modal],
  templateUrl: './photo-gallery.component.html',
  styleUrl: './photo-gallery.component.css',
})
export class PhotoGalleryComponent {
  @Input() media: any[] = [];
  @Input() selected = "";

  @Output() close = new EventEmitter<void>();
  @Output() delete = new EventEmitter<string>();

  selectedMedia: any;

  goToMedia(mediaId: string) {
    this.selectedMedia = this.media.find((item) => item.path === mediaId);
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
  onDelete() {
    const currentIndex = this.media.indexOf(this.selectedMedia);
    this.media = this.media.filter(
      (item) => item.path !== this.selectedMedia.path
    );
    this.delete.emit(this.selectedMedia.path);
    if (this.media.length == 0) {
      this.onClose();
    }
    this.selectedMedia =
      this.media[Math.min(currentIndex, this.media.length - 1)];
  }
  private swipeCoord?: [number, number];
  private swipeTime?: number;
  swipe(e: TouchEvent, when: string): void {
    const coord: [number, number] = [
      e.changedTouches[0].pageX,
      e.changedTouches[0].pageY,
    ];
    const time = new Date().getTime();

    if (when === 'start') {
      this.swipeCoord = coord;
      this.swipeTime = time;
    } else if (when === 'end') {
      const direction = [
        coord[0] - this.swipeCoord![0],
        coord[1] - this.swipeCoord![1],
      ];
      const duration = time - this.swipeTime!;
      if (
        duration < 1000 &&
        Math.abs(direction[0]) > 30 &&
        Math.abs(direction[0]) > Math.abs(direction[1] * 3)
      ) {
        if (direction[0] < 0) {
          this.goForward();
        } else {
          this.goBack();
        }
      }
    }
  }
  ngOnInit() {
    if (this.media.length > 0) {
      this.selectedMedia = this.media.find((item)=> item.path == this.selected) || this.media[0];
    }
  }
}
