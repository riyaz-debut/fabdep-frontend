import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiKeyService } from './api-key/api-key.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root'
})

export class AuthGuardService implements CanActivate {

    constructor(
        private apiKeyService: ApiKeyService,
        private router: Router,
        private toastr: ToastrService,
    ) { }
    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this.apiKeyService.checkToeknInLocalStorage().pipe(map(result => {
            if (result.tokenFound) {
                //this.validateMethod();
            
                return true;
            } else {
                this.router.navigate(['/registration-key']);
                //this.validateMethod();
                return false;
            }
        }),
            catchError(() => {
                // this.router.navigate(['catch tokenNotFound']);
                return of(false);
            })
        );
    }

    validateMethod() {
        this.apiKeyService.getToken('').then(res => {
            localStorage.setItem("token", res.data.token);

        }).catch(err => {
            if (err.error.status) {
                switch (err.error.status) {
                    case 1:
                        this.toastr.error('Request is not authorized');

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
                        this.validateMethod();
                        break;
                    default:
                        break;
                }
                //this.router.navigate(['/api-key']);
            }
        })
    }

}
