import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
//import { HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class ChainCodeService {

  constructor(private http: HttpClient, @Inject('apiBase') private _apiBase: string) { }

  protected dataSource = new BehaviorSubject<any>(null);
  data$ = this.dataSource.asObservable();


  protected collectionDataSource = new BehaviorSubject<any>(null);
  collectionData$ = this.collectionDataSource.asObservable();

  protected instantiateDataSource = new BehaviorSubject<any>(null);
  instantiateData$ = this.instantiateDataSource.asObservable();

  upload(data) {
    return this.http.post<any>(this._apiBase + "chaincode/upload", data).toPromise()
  }

  uploaded(data) {
    return this.http.post<any>(this._apiBase + "chaincode/uploaded", data);
  }

  installChaniCode(data) {
    return this.http.post<any>(this._apiBase + "chaincode/install", data).toPromise();
  }

  installed(peerId) {
    return this.http.get<any>(this._apiBase + "chaincode/installed?peerId=" + peerId);
  }

  instantiate(data) {
    return this.http.post<any>(this._apiBase + "chaincode/instantiate", data).toPromise();
  }

  instantiateChaincode(data) {
    return this.http.post<any>(this._apiBase + "chaincode/instantiate", data);
  }

  upgradeChaincode(data) {
    return this.http.post<any>(this._apiBase + "chaincode/upgrade", data).toPromise();
  }

  chainCodeInstantiatedPeer() {
    return this.http.get<any>(this._apiBase + "chaincode/instantiated/peer?");
  }

  chainCodeInstantiatedOrg() {
    return this.http.get<any>(this._apiBase + "chaincode/instantiated/orgId?");
  }

  listChaincodesByNetwork(id) {
    return this.http.get<any>(this._apiBase + "chaincode/listInstalledChaincodesByNetwork?networkId=" + id);
  }

  setChaincodeData(data) {
    this.dataSource.next(data);
  }

  getChainCodeData() {
    return this.data$;
  }

  getChainCodeDetail(id) {
    return this.http.get<any>(this._apiBase + "chaincode/?chaincodeId=" + id);
  }

  instantiatedChainCodeChannelList(id){
    return this.http.get<any>(this._apiBase + "chaincode/instantiatedChainCodeChannelList?chaincodeId=" + id);
  }


  getTargetPeer(channelId,chaincodeId) {
    return this.http.post<any>(this._apiBase + 'chaincode/instantiateChainCodeTargetPeer', { "channelId": channelId, "chaincodeId": chaincodeId });
  }


  // setCollectionData(data) {
  //   this.collectionDataSource.next(data);
  // }

  // getCollectionData() {
  //   return this.collectionData$;
  // }

  setInstantiateData(data) {
    this.instantiateDataSource.next(data);
  }

  getInstantiateData() {
    return this.instantiateData$;
  }


  setInstantiateDataByCollection(data) {
    this.collectionDataSource.next(data);
  }

  getInstantiateDataByCollection() {
    return this.collectionData$;
  }
}
