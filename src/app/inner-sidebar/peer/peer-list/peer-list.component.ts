import { Component, OnInit, ViewChild, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { PeerService } from './../peer.service'
import { FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-peer-list',
  templateUrl: './peer-list.component.html',
  styleUrls: ['./peer-list.component.scss']
})
export class PeerListComponent implements OnInit, AfterViewInit {

  @Input() id: string;
  @Input() maxSize: number;
  @Output() pageChange: EventEmitter<number>;
  @Output() pageBoundsCorrection: EventEmitter<number>;

  peerList = [];
  p;
  networkId;
  modellref;
  deleteModal;
  deletePeerId;
  activityLogsModal;
  failApi = false;
  closeAble = false;
  success = false;
  logsmsg = [];

  @ViewChild('content', { static: false }) private content;
  @ViewChild('deletePeerModel', { static: false }) private deletePeerModel;
  @ViewChild('activityLogs', { static: false }) private activityLogs;

  constructor(private formBuilder: FormBuilder,
    private PeerService: PeerService,
    private Router: Router,
    private modalService: NgbModal,
    private toastr: ToastrService,
  ) { }

  ngOnInit() {
    this.networkId = localStorage.getItem("netWorkId");
    this.getPeerList(this.networkId);
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

  peerDelete() {

    this.deleteModal = this.modalService.open(this.deletePeerModel,
      {
        windowClass: 'activation-box invalid-access-box animated zoomIn faster', centered: true, backdrop: 'static',
        keyboard: false
      });
  }

  goToNetworkList() {
    this.modellref.close()
    this.Router.navigate(['/network']);
  }

  getPeerList(networkId) {
    this.PeerService.listPeersByNetwork(networkId).subscribe((res) => {
      this.peerList = res.data;
    }, error => {

    })
  }

  //hide Activity Model 
  hideActivityModel() {
    this.closeAble = false;
    this.activityLogsModal.close()
    //this.Router.navigate(['/inner-sidebar/peer']);
  }

  async rehitApi(index, id) {
    if (index == 1) {
      this.logsmsg[0] = {
        msg: 'Delete kubernetes deployment for couchDB. ', icon: 'loader.gif', index: 1, id: id
      };
      await this.deletePeerCouchDeploymentAi(id);
      await this.deletePeerCouchServiceApi(id);
      await this.deletePeerDeploymentApi(id);
      await this.deletePeerServiceApi(id);
      await this.deletePeerMaterislToNfsApi(id)
      await this.deletePeerApi(id);

    }
    if (index == 2) {
      this.logsmsg[1] = { msg: 'Delete kubernetes service for couchDB. ', icon: 'loader.gif', index: 2, id: id };
      await this.deletePeerCouchServiceApi(id);
      await this.deletePeerDeploymentApi(id);
      await this.deletePeerServiceApi(id);
      await this.deletePeerMaterislToNfsApi(id)
      await this.deletePeerApi(id);
    }
    if (index == 3) {
      this.logsmsg[2] = { msg: 'Delete kubernetes deployment for peer. ', icon: 'loader.gif', index: 3, id: id };
      await this.deletePeerDeploymentApi(id);
      await this.deletePeerServiceApi(id);
      await this.deletePeerMaterislToNfsApi(id)
      await this.deletePeerApi(id);
    }
    if (index == 4) {
      this.logsmsg[3] = { msg: 'Delete kubernetes service for peer ', icon: 'loader.gif', index: 4, id: id };
      await this.deletePeerServiceApi(id);
      await this.deletePeerMaterislToNfsApi(id)
      await this.deletePeerApi(id);
    }
    if (index == 5) {
      this.logsmsg[4] = { msg: 'Delete peer-material To NFS ', icon: 'loader.gif', index: 5, id: id };

      await this.deletePeerMaterislToNfsApi(id)
      await this.deletePeerApi(id);
    }
    if (index == 6) {
      this.logsmsg[5] = { msg: 'Delete Peer ', icon: 'loader.gif', index: 6, id: id };
      await this.deletePeerApi(id);
    }

  }

  deletePeerCouchDeploymentAi(id) {
    return new Promise(async (resolve, reject) => {
      let deletePeerCouchDeployment = await this.PeerService.deletePeerCouchDeployment(id).catch((err) => {
        this.logsmsg[0].icon = 'refresh.png';
        this.logsmsg[0].success = 'no';
        this.toastr.error(err.error.message);
        this.closeAble = true;
        this.failApi = true;
        reject();
        throw new Error();
      });
      this.logsmsg[0].icon = 'check.png';
      this.logsmsg.push({ msg: 'Delete kubernetes service for couchDB. ', icon: 'loader.gif', index: 2, id: id });
      resolve();
    })
  }

  deletePeerCouchServiceApi(id) {
    return new Promise(async (resolve, reject) => {
      let deletePeerCouchService = await this.PeerService.deletePeerCouchService(id).catch((err) => {
        this.logsmsg[1].icon = 'refresh.png';
        this.logsmsg[1].success = 'no';
        this.toastr.error(err.error.message);
        this.closeAble = true;
        this.failApi = true;
        reject();
        throw new Error();
      });
      this.logsmsg[1].icon = 'check.png';
      this.logsmsg.push({ msg: 'Delete kubernetes deployment for peer. ', icon: 'loader.gif', index: 3, id: id });
      resolve();
    })
  }

  deletePeerDeploymentApi(id) {
    return new Promise(async (resolve, reject) => {
      let deletePeerDeployment = await this.PeerService.deletePeerDeployment(id).catch((err) => {
        this.logsmsg[2].icon = 'refresh.png';
        this.logsmsg[2].success = 'no';
        this.toastr.error(err.error.message);
        this.closeAble = true;
        this.failApi = true;
        reject();
        throw new Error();
      });
      this.logsmsg[2].icon = 'check.png';
      this.logsmsg.push({ msg: 'Delete kubernetes service for peer ', icon: 'loader.gif', index: 4, id: id });
      resolve();
    })
  }

  deletePeerServiceApi(id) {
    return new Promise(async (resolve, reject) => {
      let deletePeerService = await this.PeerService.deletePeerService(id).catch((err) => {
        this.logsmsg[3].icon = 'refresh.png';
        this.logsmsg[3].success = 'no';
        this.toastr.error(err.error.message);
        this.closeAble = true;
        this.failApi = true;
        reject();
        throw new Error();
      });
      this.logsmsg[3].icon = 'check.png';
      this.logsmsg.push({ msg: 'Delete peer-material To NFS ', icon: 'loader.gif', index: 5, id: id });
      resolve();

    })
  }

  deletePeerMaterislToNfsApi(id) {
    return new Promise(async (resolve, reject) => {
      let deletePeerMaterislToNfs = await this.PeerService.deletePeerMaterislToNfs(id).catch((err) => {
        this.logsmsg[4].icon = 'refresh.png';
        this.logsmsg[4].success = 'no';
        this.toastr.error(err.error.message);
        this.closeAble = true;
        this.failApi = true;
        reject();
        throw new Error();
      });
      this.logsmsg[4].icon = 'check.png';
      this.logsmsg.push({ msg: 'Delete Peer ', icon: 'loader.gif', index: 6, id: id });
      resolve();
    })
  }

  deletePeerApi(id) {
    return new Promise(async (resolve, reject) => {
      let PeerService = await this.PeerService.deletePeer(id).catch((err) => {
        this.logsmsg[5].icon = 'refresh.png';
        this.logsmsg[5].success = 'no';
        this.toastr.error(err.error.message);
        this.closeAble = true;
        this.failApi = true;
        reject();
        throw new Error();
      });
      this.logsmsg[5].icon = 'check.png';
      this.success = true;
      this.closeAble = true;
      resolve();
      this.getPeerList(this.networkId);
      setTimeout(() => {
        this.activityLogsModal.close();
      }, 2000);
    })

  }



  async deletePeer(id) {
    this.logsmsg = [];
    this.closeAble = false;
    this.failApi = false;
    this.success = false;

    this.activityLogsModal = this.modalService.open(this.activityLogs,
      {
        windowClass: 'activation-box invalid-access-box animated zoomIn faster', centered: true, backdrop: 'static',
        keyboard: false
      });
    this.logsmsg.push({ msg: 'Delete kubernetes deployment for couchDB. ', icon: 'loader.gif', index: 1, id: id });
    try {
      await this.deletePeerCouchDeploymentAi(id);

      await this.deletePeerCouchServiceApi(id);

      await this.deletePeerDeploymentApi(id);

      await this.deletePeerServiceApi(id);

      await this.deletePeerMaterislToNfsApi(id)

      await this.deletePeerApi(id);

    } catch (err) {
      console.log();

    }
  }

  

}
