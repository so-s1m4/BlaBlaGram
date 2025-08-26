import { Pipe, PipeTransform } from '@angular/core';
import { DEFAULT_AVATAR_URL, MEDIA_SERVER_PUBLIC_URL } from 'app/app.config';

@Pipe({
  name: 'media',
})
export class MediaPipe implements PipeTransform {
  public transform(value: { path: string; size: number } | undefined): string {
    if (!value) {
      return DEFAULT_AVATAR_URL;
    }
    return MEDIA_SERVER_PUBLIC_URL + '/' + value.path;
  }
}
