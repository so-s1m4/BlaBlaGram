import { Pipe, PipeTransform } from '@angular/core';
import { API_URL } from '../app.config';

@Pipe({
  name: 'img'
})
export class ImgPipe implements PipeTransform {

  transform(value: {path: string, size: number} | undefined): unknown {
    if (!value) {
      return "https://www.htlstp.ac.at/lehrer/maus/@@images/1916921a-4a77-48d8-b37e-66094a3be83b.jpeg"
    }

    return API_URL + '/public/' + value.path;
  }

}
