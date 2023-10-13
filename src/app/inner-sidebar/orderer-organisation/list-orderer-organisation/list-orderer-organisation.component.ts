import { Component, OnInit, ViewChild, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { OrganisationService } from './../../organisation/organisation.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-list-orderer-organisation',
  templateUrl: './list-orderer-organisation.component.html',
  styleUrls: ['./list-orderer-organisation.component.scss']
})
export class ListOrdererOrganisationComponent implements OnInit, AfterViewInit {

  @Input() id: string;
  @Input() maxSize: number;
  @Output() pageChange: EventEmitter<number>;
  @Output() pageBoundsCorrection: EventEmitter<number>;

  records = [];
  p;
  modellref;
  networkId;
  activityLogsModal;
  deleteModalBox;
  failApi = false;
  closeAble = false;
  success = false;
  logsmsg = [];
  deleteId;

  @ViewChild('content', { static: false }) private content;
  @ViewChild('deleteModel', { static: false }) private deleteModel;
  @ViewChild('activityLogs', { static: false }) private activityLogs;

  constructor(
    private organisationService: OrganisationService,
    private httpClient: HttpClient,
    private Router: Router,
    private modalService: NgbModal) { }

  ngOnInit() {
    if (localStorage.getItem("netWorkId") != null) {
      this.networkId = localStorage.getItem("netWorkId");
      this.getOrganisationList(this.networkId);
    }
  }
  ngAfterViewInit() {
    if (this.networkId == null) {
      this.showModal();
    }
  }
  showModal() {
    this.modellref = this.modalService.open(this.content,
      {
        windowClass: 'activation-box invalid-access-box animated zoomIn faster', centered: true, backdrop: 'static',
        keyboard: false
      });
  }

  goToNetworkList() {
    this.modellref.close()
    this.Router.navigate(['/network']);
  }

  hideActivityModel() {
    this.closeAble = false;
    this.activityLogsModal.close()
    //this.Router.navigate(['/inner-sidebar/peer']);
  }


  //Get Organisation List
  getOrganisationList(networkId) {
    this.organisationService.listOrganisationsByNetwork(networkId).subscribe(res => {
      this.records = res.data;
      this.records = this.records.filter(data => data.type === 1);
    });
  }

  deleteModelPopUp() {
    this.deleteModalBox = this.modalService.open(this.deleteModel,
      {
        windowClass: 'activation-box invalid-access-box animated zoomIn faster', centered: true, backdrop: 'static',
        keyboard: false
      });
  }

  deleteRecord(id) {
    //alert(id);
    this.logsmsg = [];
    this.closeAble = false;
    this.failApi = false;
    this.success = false;

    // this.activityLogsModal = this.modalService.open(this.activityLogs,
    //   {
    //     windowClass: 'activation-box invalid-access-box animated zoomIn faster', centered: true, backdrop: 'static',
    //     keyboard: false
    //   });
    // this.logsmsg.push({ msg: 'deletePeerCouchDeployment ', icon: 'loader.gif' });
    // try {
    //   let deletePeerCouchDeployment = await this.PeerService.deletePeerCouchDeployment(id).catch((err) => {
    //     this.logsmsg[0].icon = 'cross.png';
    //     this.toastr.error(err.error.message);
    //     this.closeAble = true;
    //     this.failApi = true;
    //     throw new Error();
    //   });
    //   this.logsmsg[0].icon = 'check.png';
    //   this.logsmsg.push({ msg: 'deletePeerCouchService ', icon: 'loader.gif' });

    //   let deletePeerCouchService = await this.PeerService.deletePeerCouchService(id).catch((err) => {
    //     this.logsmsg[1].icon = 'cross.png';
    //     this.toastr.error(err.error.message);
    //     this.closeAble = true;
    //     this.failApi = true;
    //     throw new Error();
    //   });
    //   this.logsmsg[1].icon = 'check.png';
    //   this.logsmsg.push({ msg: 'deletePeerCouchService ', icon: 'loader.gif' });

    //   let deletePeerDeployment = await this.PeerService.deletePeerDeployment(id).catch((err) => {
    //     this.logsmsg[2].icon = 'cross.png';
    //     this.toastr.error(err.error.message);
    //     this.closeAble = true;
    //     this.failApi = true;
    //     throw new Error();
    //   });
    //   this.logsmsg[2].icon = 'check.png';
    //   this.logsmsg.push({ msg: 'deletePeerCouchService ', icon: 'loader.gif' });

    //   let deletePeerService = await this.PeerService.deletePeerService(id).catch((err) => {
    //     this.logsmsg[3].icon = 'cross.png';
    //     this.toastr.error(err.error.message);
    //     this.closeAble = true;
    //     this.failApi = true;
    //     throw new Error();
    //   });
    //   this.logsmsg[3].icon = 'check.png';
    //   this.logsmsg.push({ msg: 'deletePeerCouchService ', icon: 'loader.gif' });

    //   let deletePeerMaterislToNfs = await this.PeerService.deletePeerMaterislToNfs(id).catch((err) => {
    //     this.logsmsg[4].icon = 'cross.png';
    //     this.toastr.error(err.error.message);
    //     this.closeAble = true;
    //     this.failApi = true;
    //     throw new Error();
    //   });
    //   this.logsmsg[4].icon = 'check.png';
    //   this.logsmsg.push({ msg: 'deletePeerCouchService ', icon: 'loader.gif' });

    //   let PeerService = await this.PeerService.deletePeer(id).catch((err) => {
    //     this.logsmsg[5].icon = 'cross.png';
    //     this.toastr.error(err.error.message);
    //     this.closeAble = true;
    //     this.failApi = true;
    //     throw new Error();
    //   });
    //   this.logsmsg[5].icon = 'check.png';
    // } catch (err) {
    //   console.log();

    // }
  }

}
