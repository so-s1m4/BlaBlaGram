import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bg',
})
export class BgPipe implements PipeTransform {

  transform(value: string): unknown {
    return "/assets/backgrounds/" + value;
  }

}
