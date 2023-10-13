import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CaService } from './../ca.service'
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-view-ca',
  templateUrl: './view-ca.component.html',
  styleUrls: ['./view-ca.component.scss']
})
export class ViewCaComponent implements OnInit {

  certificateAuthorityData;
  tokenFromUI: string = "0123456789123456";
  networkId;

  constructor(private caService: CaService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.getCertificateAuthorityData();
  }


  getCertificateAuthorityData() {
    //this.networkId = this.route.snapshot.paramMap.get('id');

    let id = { "_id": this.route.snapshot.paramMap.get('id') };
    this.caService.getCertificateAuthorityData(id).subscribe((response) => {
      this.certificateAuthorityData = response.data;
    },
      error => {
        console.log('error');
      });
  }

}
