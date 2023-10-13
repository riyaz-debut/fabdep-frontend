import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { ChainCodeService } from './../chain-code.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { async } from 'rxjs/internal/scheduler/async';

@Component({
  selector: 'app-chain-code-list',
  templateUrl: './chain-code-list.component.html',
  styleUrls: ['./chain-code-list.component.scss']
})
export class ChainCodeListComponent implements OnInit {
  @Input() id: string;
  @Input() maxSize: number;
  @Output() pageChange: EventEmitter<number>;
  @Output() pageBoundsCorrection: EventEmitter<number>;

  records = [];
  chainCodeData;
  p;
  invalidAccessModel;
  @ViewChild('invalidAccess', { static: false }) private invalidAccess;



  constructor
    (private ChainCodeService: ChainCodeService,
      private modalService: NgbModal,
      private router: Router,
      private route: ActivatedRoute) { }

  ngOnInit() {
    if (localStorage.getItem("netWorkId") != null) {
      this.getPeerId();
    }
  }

  ngAfterViewInit() {
    if (localStorage.getItem("netWorkId") == null) {
      this.showInvaildAccessModal();
    }
  }

  goToNetworkList() {
    this.invalidAccessModel.close()
    this.router.navigate(['/network']);
  }

  showInvaildAccessModal() {
    this.invalidAccessModel = this.modalService.open(this.invalidAccess, {
      windowClass: 'activation-box invalid-access-box animated zoomIn faster', centered: true, backdrop: 'static',
      keyboard: false
    });
  }

  getUniqueNames(data) {
    let uniqueNames = [];
    for (let a = 0; a < data.length; a++) {
      if (!uniqueNames.includes(data[a].organisation.name)) {
        uniqueNames.push(data[a].organisation.name);
      }
    }
    return uniqueNames;
  }

  getPeerId() {
    let id = localStorage.getItem("netWorkId");
    let orgMSPArr = [];
    let uniqueNames = [];
    this.ChainCodeService.listChaincodesByNetwork(id).subscribe((response) => {
      this.records = response.data;
      this.records.forEach(element => {
        element.peers.forEach(peer => {
          if (!uniqueNames.includes(peer.organisation.mspId)) {
            uniqueNames.push(peer.organisation.mspId)
          }
          //orgMSPArr.push(peer.organisation.mspId)
        });
      });

      // let uniqueNames = [];
      // orgMSPArr.forEach((element,index) => {
      //   if(!uniqueNames.includes(element)){
      //     uniqueNames.push(element)
      //   }

      // });


    }, (error) => {
      console.log('error block');
    });

  }

  // sendChainCodeData(chaincodeId, msp, peerLength, orgData) {
  //   let record = {
  //     'chaincodeId': chaincodeId,
  //     'msp': msp,
  //     'peerLength': peerLength,
  //     'orgData': orgData
  //   }
  //   this.ChainCodeService.setChaincodeData(record);
  // }

  sendChainCodeData(record) {
    // let record = {
    //   'chaincodeId': chaincodeId,
    //   'orgData': orgData
    // }
    this.ChainCodeService.setChaincodeData(record);
  }
}


