import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  constructor(private http: HttpClient,
    @Inject('apiBase') private _apiBase: string) { }


  walletInfo(networkId) {
    return this.http.post<any>(this._apiBase + "ca/getAllIdentitiesByNetwork/", networkId);
  }

  walletView(walletId) {
    return this.http.get<any>(this._apiBase + "ca/getIdentityDetail?walletId="+walletId);
  }
}
