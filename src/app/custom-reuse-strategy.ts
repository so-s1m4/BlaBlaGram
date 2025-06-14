import {
  RouteReuseStrategy,
  DetachedRouteHandle,
  ActivatedRouteSnapshot,
} from '@angular/router';

export class CustomReuseStrategy implements RouteReuseStrategy {
  shouldDetach(): boolean {
    return false;
  }
  store(): void {}
  shouldAttach(): boolean {
    return false;
  }
  retrieve(): DetachedRouteHandle | null {
    return null;
  }
  shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot
  ): boolean {
    // Always reload the component
    return false;
  }
}
