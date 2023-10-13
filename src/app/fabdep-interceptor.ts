import { Injectable, Injector } from "@angular/core";
import { tap, catchError } from "rxjs/operators";
import {
   HttpRequest,
   HttpHandler,
   HttpEvent,
   HttpInterceptor,
   HttpResponse,
   HttpErrorResponse,
   HttpHeaders
} from "@angular/common/http";
import { Observable, throwError, Subject } from "rxjs";
import { ApiKeyService } from './api-key/api-key.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class FabdepInterceptor implements HttpInterceptor {


   constructor(private router: Router, private apiKeyService: ApiKeyService, private toastr: ToastrService) { }
   intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      let headers;
      if (localStorage.getItem('token')) {
         headers = request.headers;
         headers = headers.append('token', localStorage.getItem('token'));
      } else {
         headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
         });
      }
      const requestClone = request.clone({ headers });
      return next.handle(requestClone)
         .pipe(catchError((err) => {
            if (err.error.status) {
               switch (err.error.status) {
                  case 1:
                     // this.toastr.error('Session is expire');
                     // this.router.navigate(['/registration-key']);
                     this.validateMethod();
                     break;
                  case 2:
                     this.toastr.error('FabDep is unable to autenticate you. Please provide your Beta Key');
                     this.router.navigate(['/registration-key']);

                     break;
                  case 3:
                     this.toastr.error('Request is not authorized');

                     break;
                  case 4:
                     this.toastr.error('Request is not authorized');

                     break;
                  case 5:
                     this.toastr.error('Invalid Beta Key');

                     break;
                  case 6:
                     this.toastr.error('You have already used your Beta Key');

                     break;
                  case 7:
                     this.toastr.error('Your Beta version has been expired.');

                     break;
                  case 8:
                     this.router.navigate(['/registration-key']);
                     break;
                  case 9:
                     this.toastr.error('FabDep is unable to autenticate you. Please provide your Beta Key');
                     this.router.navigate(['/registration-key']);

                     break;
                  case 10:
                     // this.validateMethod();
                     break;
                  default:
                     break;
               }
            }
            // else {
            //    if (err.error.status != 0) {
            //       this.router.navigate(['/']);
            //       //this.toastr.error('Something went wrong.');
            //    }
            // }
            return throwError(err);
         }));
   }


   validateMethod() {
      this.apiKeyService.getToken('').then(res => {
         localStorage.setItem("token", res.data.token);
         // this.router.navigate(['']);
         //let manual = this.apiKeyService.manualHitApi(requestClone.method, requestClone.url, requestClone.body).subscribe(res=>{
         //});
      }).catch(err => {
         // if (err.error.status) {
         // 	switch (err.error.status) {
         // 		case 1:
         // 			this.toastr.error('Request is not authorized');

         // 			break;
         // 		case 2:
         // 			this.toastr.error('FabDep is unable to autenticate you. Please provide your Beta Key');
         // 			this.router.navigate(['/api-key']);

         // 			break;
         // 		case 3:
         // 			this.toastr.error('Request is not authorized');

         // 			break;
         // 		case 4:
         // 			this.toastr.error('Request is not authorized');

         // 			break;
         // 		case 5:
         // 			this.toastr.error('Invalid Beta Key');

         // 			break;
         // 		case 6:
         // 			this.toastr.error('You have already used your Beta Key');

         // 			break;
         // 		case 7:
         // 			this.toastr.error('Your Beta version has been expired.');

         // 			break;
         // 		case 8:
         // 			this.router.navigate(['/api-key']);
         // 			break;
         // 		case 9:
         // 			this.toastr.error('FabDep is unable to autenticate you. Please provide your Beta Key');
         // 			this.router.navigate(['/api-key']);

         // 			break;
         // 		case 10:
         // 			this.validateMethod();
         // 			break;
         // 		default:
         // 			break;
         // 	}
         // 	//this.router.navigate(['/api-key']);
         // }
      })
   }



}