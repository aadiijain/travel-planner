import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const started = Date.now();
  console.log(`%c[HTTP] Request: ${req.method} ${req.urlWithParams}`, 'color: #3b82f6; font-weight: bold;');

  return next(req).pipe(
    finalize(() => {
      const elapsed = Date.now() - started;
      console.log(`%c[HTTP] Response: ${req.method} ${req.urlWithParams} took ${elapsed}ms`, 'color: #10b981; font-weight: bold;');
    })
  );
};