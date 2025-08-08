import {
  CanActivate,
  CanActivateChild,
  CanDeactivate,
  CanLoad,
  Router,
} from '@angular/router';
import { AuthService } from '../core/services/auth.service';
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
