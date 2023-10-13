
import { Component, OnInit } from '@angular/core';
import { NetworkService } from './../network.service';
import { HttpClient } from '@angular/common/http';
import * as CryptoJS from 'crypto-js';

@Component({
	selector: 'app-network-list',
	templateUrl: './network-list.component.html',
	styleUrls: ['./network-list.component.scss']
})
export class NetworkListComponent implements OnInit {

	records = [];
	peerCount = 0;
	tokenFromUI: string = "0123456789123456";
	
	constructor(private networkListService: NetworkService, private httpClient: HttpClient) { }

	ngOnInit() {
		this.networkList();
		//this.getNetworkId();
		localStorage.removeItem('setInstantiateDataByCollection');
	}

	networkList() {
		let app = this;
		this.networkListService.getNetworks().subscribe(res => {
			this.records = res.data;
			//console.log(this.records);
			for (let a = 0; a < this.records.length; a++) {
				for (let b = 0; b < this.records[a].organisations.length; b++) {
					this.peerCount += this.records[a].organisations[b].peers.length;
				}
			}
		});
	}
	count(org) {
		let countOfPeer = 0 ;
		org.forEach(org => {
			countOfPeer += org.peers.length;
		});
		return countOfPeer;
	}

	setNetworkId(networkId) {
		localStorage.setItem("netWorkId", networkId);
	}

}
