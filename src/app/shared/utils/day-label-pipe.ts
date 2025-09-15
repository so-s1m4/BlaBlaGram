// day-label.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'dayLabel' })
export class DayLabelPipe implements PipeTransform {
  transform(date: Date): string {
    const today = this.toLocalDate(new Date());
    const target = this.toLocalDate(date);
    const diffDays = Math.round(
      (today.getTime() - target.getTime()) / 86_400_000
    );

    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Вчера';
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(target);
  }

  private toLocalDate(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
}
