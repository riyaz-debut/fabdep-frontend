import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class OrganisationService {

	constructor(private http: HttpClient, @Inject('apiBase') private _apiBase: string) { }

	caList(networkId) {
		return this.http.post<any>(this._apiBase + 'ca/getAllCertificateAuthority', networkId);
	}
	add(data) {
		return this.http.post<any>(this._apiBase + 'org/addOrganisation', data);
	}
	getAdmins(data) {
		return this.http.post<any>(this._apiBase + 'ca/getAllIdentitiesByCa', { "_id": data });
	}
	createWallet(data) {
		return this.http.post<any>(this._apiBase + 'org/createWallet', { "_id": data }).toPromise();
	}

	// getOrganisation() {
	// 	return this.http.get<any>(this._apiBase + 'org/listOrganisations');
	// }

	listOrganisationsByNetwork(networkId) {
		return this.http.get<any>(this._apiBase + 'org/listOrganisationsByNetwork?networkId=' + networkId);
	}
	listPeersByOrganisation(orgId) {
		return this.http.get<any>(this._apiBase + 'peer/listPeersByOrganisation?orgId=' + orgId);
	}


	listOrganisationsByCluster(clusterId) {
		return this.http.get<any>(this._apiBase + 'org/listOrganisationsByCluster?clusterId=' + clusterId);

	}
	viewOrganisation(data) {
		return this.http.post<any>(this._apiBase + 'org/organisationDetail', data);
	}

	registerCaAdmin(data) {
		return this.http.post<any>(this._apiBase + 'ca/registerCaAdmin', data);
	}
	enrollCaAdmin(data) {
		return this.http.post<any>(this._apiBase + 'ca/enrollCaAdmin', data).toPromise();
	}

	getOrganisationById(data) {
		return this.http.post<any>(this._apiBase + 'org/organisationDetail', data);
	}

	deleteOrganisationById(id) {
		return this.http.delete<any>(this._apiBase + 'org/' + id).toPromise();
	}

	updateOrganisation(data) {
		// console.log(data);
		return this.http.post<any>(this._apiBase + 'org/addOrganisation', data);
	}

	getListByNetwork(networkId) {
		return this.http.get<any>(this._apiBase + 'org/listOrganisationsByNetwork?networkId=' + networkId).toPromise();
	}

	exportOrganisation(data) {
		return this.http.post<any>(this._apiBase + 'org/exportOrganisation', data);
	}

	importOrganisation(data){
		return this.http.post<any>(this._apiBase + 'org/importOrganisation', data);
	}
}