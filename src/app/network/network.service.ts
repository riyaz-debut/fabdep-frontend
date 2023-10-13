import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  constructor(private http: HttpClient, @Inject('apiBase') private _apiBase: string) { }

  getNetworks() {
    return this.http.get<any>(this._apiBase + 'network');
  }

  networkInfo(id) {
    return this.http.get<any>(this._apiBase + "network/" + id);
  }


  addClusterToNetwork(data) {
    return this.http.post<any>(this._apiBase + "network/addClusterToNetwork", data).toPromise();
  }


}
