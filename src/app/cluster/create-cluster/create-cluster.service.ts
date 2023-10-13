import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CreateClusterService {

  constructor(private http: HttpClient, @Inject('apiBase') private _apiBase: string) { }


  addVm(data) {
    return this.http.post<any>(this._apiBase + 'vm', data);
  }

  addCluster(data) {
    return this.http.post<any>(this._apiBase + 'cluster', data);
  }

  setupMaster(cluster_id) {
    return this.http.post<any>(this._apiBase + 'cluster/setup-master', { 'cluster_id': cluster_id }).toPromise();
  }

  setupDashBoard(clusterId) {
    return this.http.post<any>(this._apiBase + 'cluster/setup-dashboard', { 'clusterId': clusterId }).toPromise();
  }

  
  addWorkervm(data) {
    return new Promise((resolve, reject) => {
      let promise = this.http.post<any>(this._apiBase + 'cluster/worker', data).toPromise();
      promise.then(data => {
        resolve(data);
      }).catch(error => {
        reject(error);
      })
    })

  }
}
