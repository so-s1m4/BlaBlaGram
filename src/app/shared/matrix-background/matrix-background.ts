import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  imports: [CommonModule],
  selector: 'app-matrix-background',
  templateUrl: './matrix-background.html',
  styleUrls: ['./matrix-background.css'],
})
export class MatrixBackgroundComponent {
  columns = Array.from({ length: 40 }).map((_, i) => ({
    stream: this.randomStream(),
    speed: `${12 + Math.floor(Math.random() * 8)}s`,
    delay: `-${Math.floor(Math.random() * 10)}s`,
    opacity: (0.7 + Math.random() * 0.3).toFixed(2),
  }));

  private randomStream(): string {
    const chars = '01ｱｲｳｴｵｶｷｸｹｺﾀﾁﾂﾃﾄΩΨΞΛΔABCDEF';
    let str = '';
    for (let i = 0; i < 50; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;
  }
}
