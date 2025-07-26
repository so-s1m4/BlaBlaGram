import { Pipe, PipeTransform } from '@angular/core';
import { API_URL } from '../app.config';

@Pipe({
  name: 'img'
})
export class ImgPipe implements PipeTransform {

  transform(value: string): unknown {
    return API_URL + '/public/' + value;
  }

}
