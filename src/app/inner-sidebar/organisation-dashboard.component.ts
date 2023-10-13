import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NetworkService } from './../network/network.service';
import { CommonService } from "./common.service"

@Component({
  selector: 'app-organisation-dashboard',
  templateUrl: './organisation-dashboard.component.html',
  styleUrls: ['./organisation-dashboard.component.scss']
})
export class OrganisationDashboardComponent implements OnInit {

  networkId;
  networkName;
  constructor(private networkListService: NetworkService, private httpClient: HttpClient, private commonService: CommonService) {
    commonService.networkChanged$.subscribe(item => this.getNetworkId());
  }

  ngOnInit() {
    this.getNetworkId();
  }

  getNetworkId() {
    this.networkId = localStorage.getItem("netWorkId");
    if (this.networkId) {
      this.networkListService.networkInfo(this.networkId).subscribe(res => {
        this.networkName = res.data.name;
      });
    } else {
      this.networkName = '';
    }
  }

}
