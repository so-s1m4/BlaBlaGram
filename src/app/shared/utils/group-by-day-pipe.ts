import { Pipe, PipeTransform } from '@angular/core';

export interface ChatMessage {
  id: string;
  text: string;
  sender: any;
  createdAt: string;
}

export type MessageGroup = {
  labelDate: Date;
  items: ChatMessage[];
};

@Pipe({
  name: 'groupByDay',
  pure: false,
})
export class GroupByDayPipe implements PipeTransform {
  transform(messages: ChatMessage[] | null | undefined): MessageGroup[] {
    if (!messages?.length) return [];

    // 1) сортировка по времени (по возрастанию)
    const sorted = [...messages].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const map = new Map<number, ChatMessage[]>();
    for (const m of sorted) {
      const d = new Date(m.createdAt);
      const dayKey = this.toLocalDate(d).getTime(); // ключ — полночь локальной даты
      if (!map.has(dayKey)) map.set(dayKey, []);
      map.get(dayKey)!.push(m);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([key, items]) => ({
        labelDate: new Date(key),
        items,
      }));
  }

  private toLocalDate(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
}
