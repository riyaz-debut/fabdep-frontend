import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { of, Observable, BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ApiKeyService {

  constructor(private http: HttpClient, @Inject('apiBase') private _apiBase: string) { }
  protected layoutSource = new BehaviorSubject<boolean>(false);
  layoutSource$ = this.layoutSource.asObservable();

  // getChannelList() {
  //   return this.http.get<any>(this._apiBase + 'channel');
  // }

  getToken(clientKey) {
    return this.http.post<any>(this._apiBase + 'auth/getToken', { 'clientKey': clientKey }).toPromise();
  }

  autoUpdate(autoUpdateStatus) {
    return this.http.put<any>(this._apiBase + 'auth/autoUpdate', { 'autoUpdateStatus': autoUpdateStatus }).toPromise();
  }

  checkToeknInLocalStorage(): Observable<any> {
    if (localStorage.getItem("token")) {
      return of({ 'tokenFound': true })
    }
    else {
      return of({ 'tokenFound': false })
    }
  }

  manualHitApi(method, url, data) {
    switch (method) {
      case 'get':
        return this.http.get<any>(url);
        break;
      case "GET":
        return this.http.get<any>(url);
        break;

      case 'post':
        return this.http.post<any>(url, data);
        break;
      case 'POST':
        return this.http.post<any>(url, data);
        break;
      case 'put':
        return this.http.put<any>(url, data);
        break;
      case 'PUT':
        return this.http.put<any>(url, data);
        break;
      case 'delete':
        return this.http.delete<any>(url);
        break;
      case 'DELETE':
        return this.http.delete<any>(url);
        break;

      default:
        break;
    }

  }

  setLayoutData(data: boolean): void {
    this.layoutSource.next(data);
  }

  getLayoutData(): Observable<boolean> {
    return this.layoutSource$;
  }


}

// this.apiKeyService.getToken('').then(res => {
  //     localStorage.setItem("toekn", res.data.token);

      // }).catch(err => {
      //     console.log(err);

      //     if (err.error.status == 9) {
      //         this.router.navigate(['/api-key']);
      //     }
      // })  