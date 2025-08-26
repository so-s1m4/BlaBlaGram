import { Pipe, PipeTransform } from '@angular/core';
import { API_PUBLIC_URL, API_URL, DEFAULT_AVATAR_URL } from 'app/app.config';

@Pipe({
  name: 'img',
})
export class ImgPipe implements PipeTransform {
  public transform(
    value: { path: string; [key: string]: any } | undefined
  ): unknown {
    if (!value) {
      return DEFAULT_AVATAR_URL;
    }
    return API_PUBLIC_URL + "/" + value.path;
  }
}
