
import { Component, OnInit, ViewChild, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WalletService } from './../wallet.service'

@Component({
  selector: 'app-wallet-list',
  templateUrl: './wallet-list.component.html',
  styleUrls: ['./wallet-list.component.scss']
})
export class WalletListComponent implements OnInit {

  @Input() id: string;
  @Input() maxSize: number;
  @Output() pageChange: EventEmitter<number>;
  @Output() pageBoundsCorrection: EventEmitter<number>;

  walletdata = [];
  networkId;
  p;
  tokenFromUI: string = "0123456789123456";
  modellref;
  @ViewChild('content', { static: false }) private content;

  constructor(
    private walletService: WalletService,
    private route: ActivatedRoute,
    private Router: Router,
    private modalService: NgbModal) { }

  ngOnInit() {
    this.networkId = localStorage.getItem("netWorkId");
    this.walletInfo({ "network_id": this.networkId });
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

  walletInfo(id) {
    this.walletService.walletInfo(id).subscribe((response) => {
      this.walletdata = response.data;
    }, (error) => {
    });
  }


}
