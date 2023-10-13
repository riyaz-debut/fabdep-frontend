import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChainCodeService } from './../chain-code.service';

@Component({
  selector: 'app-view-chaincode',
  templateUrl: './view-chaincode.component.html',
  styleUrls: ['./view-chaincode.component.scss']
})
export class ViewChaincodeComponent implements OnInit {

  constructor(private ChainCodeService: ChainCodeService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    //this.getChainCodeDetail();
  }

  getChainCodeDetail() {
    //this.networkId = this.route.snapshot.paramMap.get('id');
    //let id = { "_id": this.route.snapshot.paramMap.get('id') };
    // let id = this.route.snapshot.paramMap.get('id') ;
    // this.ChainCodeService.getChainCodeData(id).subscribe((response) => {
    //   this.ChainCodeService = response.data;
    // },
    //   error => {
    //     console.log('error');
    //   });
  }

}
