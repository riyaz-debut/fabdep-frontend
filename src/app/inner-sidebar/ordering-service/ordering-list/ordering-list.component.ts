import { Component, OnInit,ViewChild, AfterViewInit,Input,Output,EventEmitter } from '@angular/core';
import { OrderingService } from './../ordering.service';
import { HttpClient } from '@angular/common/http';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-ordering-list',
  templateUrl: './ordering-list.component.html',
  styleUrls: ['./ordering-list.component.scss']
})
export class OrderingListComponent implements OnInit {

  @Input() id: string;
  @Input() maxSize: number;
  @Output() pageChange: EventEmitter<number>;
  @Output() pageBoundsCorrection: EventEmitter<number>;

  records  = [];
  p;
  modellref;
  networkId;
  @ViewChild('content', {static: false}) private content;

  constructor(
    private orderingService: OrderingService, 
    private httpClient: HttpClient,
    private Router: Router,
    private modalService: NgbModal ) { }

  ngOnInit() {
    this.networkId = localStorage.getItem("netWorkId");
    
     this.getOrderingList(this.networkId);
  }
  ngAfterViewInit () {
    if(this.networkId == null){
      this.showModal();
    }
  }
  showModal(){
    this.modellref = this.modalService.open(this.content,
      { windowClass: 'activation-box invalid-access-box animated zoomIn faster', centered: true,  backdrop : 'static',
    keyboard : false});
  }

  goToNetworkList(){
    this.modellref.close()
    this.Router.navigate(['/network']);
  }

  //Get Ordering List
  getOrderingList(networkId){
    this.orderingService.getAllOrdererServicesByNetwork(networkId).subscribe(res => {
      this.records = res.data;
    }); 
  }


}
