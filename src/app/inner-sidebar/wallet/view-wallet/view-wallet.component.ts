import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CaService } from './../../ca/ca.service'
import { WalletService } from './../wallet.service'

@Component({
  selector: 'app-view-wallet',
  templateUrl: './view-wallet.component.html',
  styleUrls: ['./view-wallet.component.scss']
})
export class ViewWalletComponent implements OnInit {

  walletView;
  tokenFromUI: string = "0123456789123456";
  networkId;

  constructor(
    private walletService: WalletService, 
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.getCertificateAuthorityData();
  }


  getCertificateAuthorityData() {
    //this.networkId = this.route.snapshot.paramMap.get('id');

    let id = this.route.snapshot.paramMap.get('id');
    this.walletService.walletView(id).subscribe((response) => {
      this.walletView = response.data;
    },
      error => {
        console.log('error');
      });
  }

}
