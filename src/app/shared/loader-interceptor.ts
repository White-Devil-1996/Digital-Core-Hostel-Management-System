// import { HttpInterceptorFn } from '@angular/common/http';

// export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
//   return next(req);
// };



import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { Loader } from './loader';

@Injectable()
export class loaderInterceptor implements HttpInterceptor {
  constructor(private loaderService: Loader) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loaderService.show();
    return next.handle(req).pipe(finalize(() => this.loaderService.hide()));
  }
}
