import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'border',
})
export class BorderPipe implements PipeTransform {

  transform(value: string): unknown {
    return "/assets/borders/" + value;
  }

}
