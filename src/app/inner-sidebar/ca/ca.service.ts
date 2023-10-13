import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';



@Injectable({
  providedIn: 'root'
})
export class CaService {

  constructor(private http: HttpClient, @Inject('apiBase') private _apiBase: string) { }

  getNetworkInfo(networkId) {
    return this.http.get<any>(this._apiBase + "network/" + networkId)
  }

  getClusters() {
    return this.http.get<any>(this._apiBase + "cluster");
  }

  addCa(data) {
    return this.http.post<any>(this._apiBase + "ca/addCertificateAuthority", data).toPromise();
  }

  addNetwork(data) {
    let networkData = {
      "cluster_id": data.value.cluster,
      "name": data.value.networkName,
    }
    return this.http.post<any>(this._apiBase + "network", networkData).toPromise();
  }

  createCaService(caId) {
    return this.http.post<any>(this._apiBase + "ca/CreateCaService", caId).toPromise();
  }

  CreateCaDeployment(caId) {
    return this.http.post<any>(this._apiBase + "ca/CreateCaDeployment", caId).toPromise();
  }

  fetchCaTlsCertificatesFromNFS(caId) {
    return this.http.post<any>(this._apiBase + "ca/fetchCaTlsCertificatesFromNFS", caId).toPromise();
  }

  writeConnectionConfigs(caId) {
    return this.http.post<any>(this._apiBase + "ca/writeConnectionConfigs", caId).toPromise();
  }

  enrollRegistrar(caId) {
    return this.http.post<any>(this._apiBase + "ca/enrollRegistrar", caId).toPromise();
  }


  getAllCertificateAuthority(data) {
    return this.http.post<any>(this._apiBase + 'ca/getAllCertificateAuthority', data);
  }

  getCertificateAuthorityData(id) {
    return this.http.post<any>(this._apiBase + 'ca/getCertificateAuthority', id);
  }

  updateCa(data) {
    return this.http.post<any>(this._apiBase + "ca/addCertificateAuthority", data.value);
  }

}
