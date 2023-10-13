import { Injectable, Inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class ClusterService {
  constructor(
    private http: HttpClient,
    @Inject("apiBase") private _apiBase: string
  ) {}

  addVm(data) {
    return this.http.post<any>(this._apiBase + "vm", data);
  }

  updateVm(data) {
    return this.http.put<any>(this._apiBase + "vm", data);
  }

  updateCluster(data) {
    return this.http.put<any>(this._apiBase + "cluster", data);
  }

  addCluster(data) {
    return this.http.post<any>(this._apiBase + "cluster", data);
  }

  addWorkervm(data) {
    return this.http.post<any>(this._apiBase + "cluster/worker", data);
  }

  getCluster() {
    return this.http.get<any>(this._apiBase + "cluster");
  }
  setSshTunnelDashboard(data) {
    return this.http.post<any>(
      this._apiBase + "cluster/setSShTunnelDashBoard",
      data
    );
  }

  getClusterData(id) {
    return this.http.get<any>(this._apiBase + "cluster/" + id);
  }
}
