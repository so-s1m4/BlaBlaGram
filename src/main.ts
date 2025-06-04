import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

export const profileBackgrounds = [
  'bg1.avif',
  'bg1.avif',
  'bg1.avif',
  'bg1.avif',
  'bg1.avif',
  'bg1.avif',
  'bg1.avif',
  'bg1.avif',
  'bg1.avif',
];
export const profileBorders = [
  'border1.png',
  'border2.png',
  'border3.png',
  'border4.png',

];

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
