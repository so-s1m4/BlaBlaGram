import {
  CanActivate,
  CanActivateChild,
} from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MobileGuard implements CanActivate, CanActivateChild {
  canActivate(): boolean {
    return !window.isDesktop();
  }

  canActivateChild(): boolean {
    return !window.isDesktop();
  }

  canLoad(): boolean {
    return !window.isDesktop();
  }
}
