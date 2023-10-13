import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PeerService {

  constructor(private http: HttpClient, @Inject('apiBase') private _apiBase: string) { }

  // getPeerList() {
  //   return this.http.get<any>(this._apiBase + 'peer/listPeers');
  // }

  listPeersByNetwork(networkId) {
    return this.http.get<any>(this._apiBase + 'peer/listPeersByNetwork?networkId=' + networkId);
  }

  listPeersByCluster(clusterId) {
    return this.http.get<any>(this._apiBase + 'peer/listPeersByCluster?clusterId=' + clusterId);
  }

  peer(data) {
    return this.http.post<any>(this._apiBase + 'peer/peer', data).toPromise();
  }
  registerPeer(id, isTLS) {
    return this.http.post<any>(this._apiBase + 'peer/registerPeer', { '_id': id, 'isTLS': isTLS }).toPromise();
  }
  enrollPeer(id, isTLS) {
    return this.http.post<any>(this._apiBase + 'peer/enrollPeer', { '_id': id, 'isTLS': isTLS }).toPromise();
  }
  generatePeerMsp(id) {
    return this.http.post<any>(this._apiBase + 'peer/generatePeerMsp', { '_id': id }).toPromise();
  }
  copyPeerMaterislToNfs(id) {
    return this.http.post<any>(this._apiBase + 'peer/copyPeerMaterislToNfs', { '_id': id }).toPromise();
  }
  createPeerService(id) {
    return this.http.post<any>(this._apiBase + 'peer/createPeerService', { '_id': id }).toPromise();
  }
  createPeerDeployment(id) {
    return this.http.post<any>(this._apiBase + 'peer/createPeerDeployment', { '_id': id }).toPromise();
  }
  // createPeerCouchService(id) {
  //   return this.http.post<any>(this._apiBase + 'peer/createPeerCouchService', { '_id': id }).toPromise();
  // }

  createPeerCouchService(data) {
    return this.http.post<any>(this._apiBase + 'peer/createPeerCouchService', data).toPromise();
  }
  createPeerCouchDeployment(id) {
    return this.http.post<any>(this._apiBase + 'peer/createPeerCouchDeployment', { '_id': id }).toPromise();
  }
  deletePeerCouchDeployment(id) {
    return this.http.post<any>(this._apiBase + 'peer/deletePeerCouchDeployment', { '_id': id }).toPromise();
  }
  deletePeerCouchService(id) {
    return this.http.post<any>(this._apiBase + 'peer/deletePeerCouchService', { '_id': id }).toPromise();
  }
  deletePeerDeployment(id) {
    return this.http.post<any>(this._apiBase + 'peer/deletePeerDeployment', { '_id': id }).toPromise();
  }
  deletePeerService(id) {
    return this.http.post<any>(this._apiBase + 'peer/deletePeerService', { '_id': id }).toPromise();
  }
  deletePeerMaterislToNfs(id) {
    return this.http.post<any>(this._apiBase + 'peer/deletePeerMaterislFromNfs', { '_id': id }).toPromise();
  }
  deletePeer(id) {
    return this.http.delete<any>(this._apiBase + 'peer/' + id).toPromise();
  }
  getPeerDetail(id) {
    return this.http.get<any>(this._apiBase + 'peer?peerId=' + id);
  }

  getpeerByorg(id) {
    return this.http.get<any>(this._apiBase + 'peer/listPeersByOrganisation?orgId=' + id).toPromise();
  }

  updatePeerCouchService(id,isPublic) {
    return this.http.post<any>(this._apiBase + 'peer/updatePeerCouchService', { '_id': id,'isPublic':isPublic });
  }

}
