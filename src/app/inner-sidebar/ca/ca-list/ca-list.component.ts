import { Component, OnInit, ViewChild, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { CaService } from './../ca.service'
import { ActivatedRoute, Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-ca-list',
  templateUrl: './ca-list.component.html',
  styleUrls: ['./ca-list.component.scss']
})
export class CaListComponent implements OnInit, AfterViewInit {

  @Input() id: string;
  @Input() maxSize: number;
  @Output() pageChange: EventEmitter<number>;
  @Output() pageBoundsCorrection: EventEmitter<number>;

  certificateAuthorityData = [];
  networkId;
  p;
  tokenFromUI: string = "0123456789123456";
  modellref;
  @ViewChild('content', { static: false }) private content;

  constructor(
    private caService: CaService,
    private route: ActivatedRoute,
    private Router: Router,
    private modalService: NgbModal) { }

  ngOnInit() {
    this.networkId = localStorage.getItem("netWorkId");
    // this.getAllCertificateAuthority({ "networkId": JSON.parse(this.decryptUsingAES256(this.networkId)) });
    this.getAllCertificateAuthority({ "networkId": this.networkId });
  }

  ngAfterViewInit() {
    if (this.networkId == null) {
      this.showModal();
    }
  }

  goToNetworkList() {
    this.modellref.close()
    this.Router.navigate(['/network']);
  }

  showModal() {
    this.modellref = this.modalService.open(this.content,
      {
        windowClass: 'activation-box invalid-access-box animated zoomIn faster', centered: true, backdrop: 'static',
        keyboard: false
      });
  }

  getAllCertificateAuthority(id) {
    this.caService.getAllCertificateAuthority(id).subscribe((response) => {
      this.certificateAuthorityData = response.data;
    }, (error) => {
    });
  }


}
