import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OrderingService {


  constructor(private http: HttpClient, @Inject('apiBase') private _apiBase: string) { }

  // getOrdering() {
  //   var networkId = window.localStorage.getItem('netWorkId');
  //   return this.http.get<any>(this._apiBase + 'orderer/getAllOrderingServices?networkId=' + networkId);
  // }

  getAllOrdererServicesByNetwork(networkId){
    return this.http.get<any>(this._apiBase + 'orderer/getAllOrdererServicesByNetwork?networkId=' + networkId);
  }

  getAllOrdererServicesByCluster(clusterId){
    return this.http.get<any>(this._apiBase + 'orderer/getAllOrdererServicesByCluster?clusterId=' + clusterId);
  }


  viewOrdering(data) {
    return this.http.post<any>(this._apiBase + 'orderer/orderingServiceDetail', data);
  }
  getOrganisations() {
    return this.http.get<any>(this._apiBase + 'org/listOrganisations');
  }
  addOrderingService(formData) {
    return this.http.post<any>(this._apiBase + 'orderer/addOrderingService', formData);
  }
  registerOrderingNodesWithCa(data) {
    return this.http.post<any>(this._apiBase + 'orderer/registerOrderingNodesWithCa', data).toPromise();
  }
  enrollOrderingNodes(data) {
    return this.http.post<any>(this._apiBase + 'orderer/enrollOrderingNodes', data).toPromise();
  }
  generateOrderingServiceMsp(data) {
    return this.http.post<any>(this._apiBase + 'orderer/generateOrderingServiceMsp', data).toPromise();
  }

  
  addConsortiumMembers(data) {
    return this.http.post<any>(this._apiBase + 'orderer/addConsortiumMembers', data).toPromise();
  }

  createGenesisBlock(data) {
    return this.http.post<any>(this._apiBase + 'orderer/createGenesisBlock', data).toPromise();
  }
  copyChannelArtifactsToNfs(data) {
    return this.http.post<any>(this._apiBase + 'orderer/copyChannelArtifactsToNfs', data).toPromise();;
  }
  copyCryptoMaterialToNfs(data) {
    return this.http.post<any>(this._apiBase + 'orderer/copyCryptoMaterialToNfs', data).toPromise();
  }
  createOrdererService(data) {
    return this.http.post<any>(this._apiBase + 'orderer/createOrdererService', data).toPromise();
  }
  createOrdererDeployment(data) {
    return this.http.post<any>(this._apiBase + 'orderer/createOrdererDeployment', data).toPromise();
  }

  getOrderingById(data) {
      return this.http.post<any>(this._apiBase + 'orderer/orderingServiceDetail',  data );
  }

}



