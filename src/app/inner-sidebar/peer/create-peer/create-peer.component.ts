import { Component, OnInit, ViewChild } from '@angular/core';
import { PeerService } from './../peer.service'
import { FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { OrganisationService } from './../../organisation/organisation.service';
import { ApiKeyService } from './../../../api-key/api-key.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-create-peer',
  templateUrl: './create-peer.component.html',
  styleUrls: ['./create-peer.component.scss']
})
export class CreatePeerComponent implements OnInit {

  organisationListData;
  pwdShow = false;
  failApi = false;
  id;
  peerForm: FormGroup;
  invalidAccessModel;
  modellref;
  closeAble = false;
  success = false;
  errormsg = [];
  logsmsg = [];
  @ViewChild('content', { static: false }) private content;
  @ViewChild('invalidAccess', { static: false }) private invalidAccess;

  constructor(private formBuilder: FormBuilder,
    private Router: Router,
    private PeerService: PeerService,
    private OrganisationService: OrganisationService,
    private apiKeyService: ApiKeyService,
    private toastr: ToastrService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.peerForm = this.formBuilder.group({
      name: ['', Validators.required],
      peer_enroll_secret: ['', Validators.required],
      orgId: ['', Validators.required],
      couchdbUsername: ['', Validators.required],
      couchdbPassword: ['', Validators.required],
      isPublic: ['true', Validators.required],
    })
    if (localStorage.getItem("netWorkId") != null) {
      this.organisationList(localStorage.getItem("netWorkId"));
    }
    this.apiKeyService.getToken('').then(res => {
      localStorage.setItem("token", res.data.token);
    });
  }
  ngAfterViewInit() {
    if (localStorage.getItem("netWorkId") == null) {
      this.showInvaildAccessModal();
    }
  }

  goToNetworkList() {
    this.invalidAccessModel.close()
    this.Router.navigate(['/network']);
  }

  showInvaildAccessModal() {
    this.invalidAccessModel = this.modalService.open(this.invalidAccess,
      {
        windowClass: 'activation-box animated invalid-access-box zoomIn faster', centered: true, backdrop: 'static',
        keyboard: false
      });
  }

  showPass() {

  }
  //get organisation list for dropDown 
  organisationList(netWorkId) {
    this.OrganisationService.listOrganisationsByNetwork(netWorkId).subscribe(res => {
      this.organisationListData = res.data;
      this.organisationListData = this.organisationListData.filter(data => data.type === 0);
    });
  }

  //hide Activity Model 
  hideActivityModel() {
    this.closeAble = false;
    this.modellref.close()
    //this.Router.navigate(['/inner-sidebar/peer']);
  }

  omit_special_char(event) {
    var k;
    k = event.charCode;  //         k = event.keyCode;  (Both can be used)
    if ((k > 96 && k < 123) || k == 8 || k == 45 || (k >= 48 && k <= 57)) {
      return k;
    }
    else {
      this.toastr.error('Only Alpha-Numeric small characters  and Hyphen (-) are allowed');
      return false;
    }
  }


  peerApi() {
    return new Promise(async (resolve, reject) => {
      let peer = await this.PeerService.peer(this.peerForm.value).catch(error => {

        if (!error.error.message) {
          this.toastr.error("Something Went Wrong");
        }
        else {
          this.toastr.error(error.error.message);
        }
        this.logsmsg[0].icon = 'refresh.png';
        this.closeAble = true;
        this.failApi = true;
        reject();
        throw new Error();
      });
      this.logsmsg[0].icon = 'check.png';
      this.logsmsg[0].msg = 'Peer created.';
      this.logsmsg.push({ msg: 'Register Peer with Registrar.', icon: 'loader.gif', index: 2 });
      resolve();
      this.id = peer.data._id;
    });
  }

  registerPeerTrueApi() {
    return new Promise(async (resolve, reject) => {
      await this.PeerService.registerPeer(this.id, true).then(response => {
        this.logsmsg[1].icon = 'check.png';
        this.logsmsg.push({ msg: 'Enroll Peer with Registrar.', icon: 'loader.gif', index: 3 });
        resolve();
      }).catch(error => {
        if (!error.error.message) {
          this.toastr.error("Something Went Wrong");
        }
        else {
          this.toastr.error(error.error.message);
        }
        this.logsmsg[1].icon = 'refresh.png';
        this.logsmsg[1].msg = 'Fail to Register Peer with Registrar.';
        this.closeAble = true;
        this.failApi = true;
        reject();
        throw new Error();
      })
    });
  }

  enrollPeerTrueApi() {
    return new Promise(async (resolve, reject) => {
      await this.PeerService.enrollPeer(this.id, true).then(response => {
        this.logsmsg[2].icon = 'check.png';
        this.logsmsg.push({ msg: 'Register Peer with Root-CA.', icon: 'loader.gif', index: 4 });
        resolve();
      }).catch(error => {
        if (!error.error.message) {
          this.toastr.error("Something Went Wrong");
        }
        else {
          this.toastr.error(error.error.message);
        }
        this.logsmsg[2].icon = 'refresh.png';
        this.closeAble = true;
        this.failApi = true;
        reject();
        throw new Error();
      })
    });
  }

  registerPeerFalseApi() {
    return new Promise(async (resolve, reject) => {
      await this.PeerService.registerPeer(this.id, false).then(response => {
        this.logsmsg[3].icon = 'check.png';
        this.logsmsg.push({ msg: 'Enroll peer with Root-CA.', icon: 'loader.gif', index: 5 });
        resolve();
      }).catch(error => {
        if (!error.error.message) {
          this.toastr.error("Something Went Wrong");
        }
        else {
          this.toastr.error(error.error.message);
        }
        this.logsmsg[3].icon = 'refresh.png';
        this.closeAble = true;
        this.failApi = true;
        reject();
        throw new Error();
      })
    });
  }

  enrollPeerFalseApi() {
    return new Promise(async (resolve, reject) => {
      await this.PeerService.enrollPeer(this.id, false).then(response => {
        this.logsmsg[4].icon = 'check.png';
        this.logsmsg.push({ msg: 'Generate peer MSP.', icon: 'loader.gif', index: 6 });
        resolve();
      }).catch(error => {
        if (!error.error.message) {
          this.toastr.error("Something Went Wrong");
        }
        else {
          this.toastr.error(error.error.message);
        }
        this.logsmsg[4].icon = 'refresh.png';
        this.closeAble = true;
        this.failApi = true;
        reject();
        throw new Error();
      })
    });
  }

  generatePeerMspApi() {
    return new Promise(async (resolve, reject) => {
      await this.PeerService.generatePeerMsp(this.id).then(response => {
        this.logsmsg[5].icon = 'check.png';
        this.logsmsg.push({ msg: 'Copy peer-material To NFS.', icon: 'loader.gif', index: 7 });
        resolve();
      }).catch(error => {
        if (!error.error.message) {
          this.toastr.error("Something Went Wrong");
        }
        else {
          this.toastr.error(error.error.message);
        }
        this.logsmsg[5].icon = 'refresh.png';
        this.closeAble = true;
        this.failApi = true;
        reject();
        throw new Error();
      })
    });

  }

  copyPeerMaterislToNfsApi() {

    //46666666
    return new Promise(async (resolve, reject) => {
      await this.PeerService.copyPeerMaterislToNfs(this.id).then(response => {
        this.logsmsg[6].icon = 'check.png';
        this.logsmsg.push({ msg: 'Creating kubernetes service for peer.', icon: 'loader.gif', index: 8 });
        resolve();
      }).catch(error => {
        if (!error.error.message) {
          this.toastr.error("Something Went Wrong");
        }
        else {
          this.toastr.error(error.error.message);
        }
        this.logsmsg[6].icon = 'refresh.png';
        this.closeAble = true;
        this.failApi = true;
        reject();
        throw new Error();
      })
    });
  }

  createPeerServiceApi() {
    return new Promise(async (resolve, reject) => {
      await this.PeerService.createPeerService(this.id).then(response => {
        this.logsmsg[7].icon = 'check.png';
        this.logsmsg.push({ msg: 'Creating kubernetes deployment for peer.', icon: 'loader.gif', index: 9 });
        resolve();
      }).catch(error => {
        if (!error.error.message) {
          this.toastr.error("Something Went Wrong");
        }
        else {
          this.toastr.error(error.error.message);
        }
        this.logsmsg[7].icon = 'refresh.png';
        this.closeAble = true;
        this.failApi = true;
        reject();
        throw new Error();
      })
    });
  }

  createPeerDeploymentApi() {
    return new Promise(async (resolve, reject) => {
      await this.PeerService.createPeerDeployment(this.id).then(response => {
        this.logsmsg[8].icon = 'check.png';
        this.logsmsg.push({ msg: 'Creating kubernetes service for CouchDB.', icon: 'loader.gif', index: 10 });
        resolve();
      }).catch(error => {
        if (!error.error.message) {
          this.toastr.error("Something Went Wrong");
        }
        else {
          this.toastr.error(error.error.message);
        }
        this.logsmsg[8].icon = 'refresh.png';
        this.closeAble = true;
        this.failApi = true;
        reject();
        throw new Error();
      })
    });
  }

  createPeerCouchServiceApi() {
    return new Promise(async (resolve, reject) => {
      const data = {
        '_id': this.id,
        'isPublic': this.peerForm.value.isPublic
      };
      // console.log('createPeerCouchServiceApi dataaaa',data);
      
      await this.PeerService.createPeerCouchService(data).then(response => {
        this.logsmsg[9].icon = 'check.png';
        this.logsmsg.push({ msg: 'Creating kubernetes deployment for CouchDB.', icon: 'loader.gif', index: 11 });
        resolve();
      }).catch(error => {
        if (!error.error.message) {
          this.toastr.error("Something Went Wrong");
        }
        else {
          this.toastr.error(error.error.message);
        }
        this.logsmsg[9].icon = 'refresh.png';
        this.closeAble = true;
        this.failApi = true;
        reject();
        throw new Error();
      })
    });

  }

  createPeerCouchDeploymentApi() {
    return new Promise(async (resolve, reject) => {
      await this.PeerService.createPeerCouchDeployment(this.id).then(response => {
        this.logsmsg[10].icon = 'check.png';
        const self = this;
        this.success = true;
        this.closeAble = true;
        resolve();
        setTimeout(function () {
          self.modellref.close();
          self.Router.navigate(['/inner-sidebar/peer']);
        }, 2000);

      }).catch(error => {
        if (!error.error.message) {
          this.toastr.error("Something Went Wrong");
        }
        else {
          this.toastr.error(error.error.message);
        }
        this.modellref.close();
        this.logsmsg[10].icon = 'refresh.png';
        this.closeAble = true;
        this.failApi = true;
        reject();
        throw new Error();
      });
    });
  }

  async  rehitApi(index) {
    this.closeAble = false;
    this.failApi = false;
    this.success = false;
    if (index == 1) {
      this.logsmsg[0] = { msg: 'Creating peer.', icon: 'loader.gif', index: 1 };

      await this.peerApi();
      await this.registerPeerTrueApi();
      await this.enrollPeerTrueApi();
      await this.registerPeerFalseApi();
      await this.enrollPeerFalseApi();
      await this.generatePeerMspApi();
      await this.copyPeerMaterislToNfsApi();
      await this.createPeerServiceApi();
      await this.createPeerDeploymentApi();
      await this.createPeerCouchServiceApi();
      await this.createPeerCouchDeploymentApi();
    }
    if (index == 2) {
      this.logsmsg[1] = { msg: 'Register Peer with Registrar.', icon: 'loader.gif', index: 2 };
      await this.registerPeerTrueApi();
      await this.enrollPeerTrueApi();
      await this.registerPeerFalseApi();
      await this.enrollPeerFalseApi();
      await this.generatePeerMspApi();
      await this.copyPeerMaterislToNfsApi();
      await this.createPeerServiceApi();
      await this.createPeerDeploymentApi();
      await this.createPeerCouchServiceApi();
      await this.createPeerCouchDeploymentApi();
    }
    if (index == 3) {
      this.logsmsg[2] = { msg: 'Enroll Peer with Registrar.', icon: 'loader.gif', index: 3 };
      await this.enrollPeerTrueApi();
      await this.registerPeerFalseApi();
      await this.enrollPeerFalseApi();
      await this.generatePeerMspApi();
      await this.copyPeerMaterislToNfsApi();
      await this.createPeerServiceApi();
      await this.createPeerDeploymentApi();
      await this.createPeerCouchServiceApi();
      await this.createPeerCouchDeploymentApi();
    }
    if (index == 4) {
      this.logsmsg[3] = { msg: 'Register Peer with Root-CA.', icon: 'loader.gif', index: 4 };
      await this.registerPeerFalseApi();
      await this.enrollPeerFalseApi();
      await this.generatePeerMspApi();
      await this.copyPeerMaterislToNfsApi();
      await this.createPeerServiceApi();
      await this.createPeerDeploymentApi();
      await this.createPeerCouchServiceApi();
      await this.createPeerCouchDeploymentApi();

    }
    if (index == 5) {
      this.logsmsg[4] = { msg: 'Enroll peer with Root-CA.', icon: 'loader.gif', index: 5 };
      await this.enrollPeerFalseApi();
      await this.generatePeerMspApi();
      await this.copyPeerMaterislToNfsApi();
      await this.createPeerServiceApi();
      await this.createPeerDeploymentApi();
      await this.createPeerCouchServiceApi();
      await this.createPeerCouchDeploymentApi();
    }
    if (index == 6) {
      this.logsmsg[5] = { msg: 'Generate peer MSP.', icon: 'loader.gif', index: 6 };
      await this.generatePeerMspApi();
      await this.copyPeerMaterislToNfsApi();
      await this.createPeerServiceApi();
      await this.createPeerDeploymentApi();
      await this.createPeerCouchServiceApi();
      await this.createPeerCouchDeploymentApi();

    }
    if (index == 7) {
      this.logsmsg[6] = { msg: 'Copy peer-material To NFS.', icon: 'loader.gif', index: 7 };
      await this.copyPeerMaterislToNfsApi();
      await this.createPeerServiceApi();
      await this.createPeerDeploymentApi();
      await this.createPeerCouchServiceApi();
      await this.createPeerCouchDeploymentApi();

    }
    if (index == 8) {
      this.logsmsg[7] = { msg: 'Creating kubernetes service for peer.', icon: 'loader.gif', index: 8 };
      await this.createPeerServiceApi();
      await this.createPeerDeploymentApi();
      await this.createPeerCouchServiceApi();
      await this.createPeerCouchDeploymentApi();

    }
    if (index == 9) {
      this.logsmsg[8] = { msg: 'Creating kubernetes deployment for peer.', icon: 'loader.gif', index: 9 };
      await this.createPeerDeploymentApi();
      await this.createPeerCouchServiceApi();
      await this.createPeerCouchDeploymentApi();

    }
    if (index == 10) {
      this.logsmsg[9] = { msg: 'Creating kubernetes service for CouchDB.', icon: 'loader.gif', index: 10 };
      await this.createPeerCouchServiceApi();
      await this.createPeerCouchDeploymentApi();

    }
    if (index == 11) {
      this.logsmsg[10] = { msg: 'Creating kubernetes deployment for CouchDB.', icon: 'loader.gif', index: 11 };
      await this.createPeerCouchDeploymentApi();
    }

  }

  // create peer
  async addPeer() {
    this.logsmsg = [];
    this.closeAble = false;
    this.failApi = false;
    this.success = false;
    for (const c of Object.keys(this.peerForm.controls)) {
      this.peerForm.controls[c].markAsTouched();
    }

    //Trim form fields
    Object.keys(this.peerForm.controls).forEach(key => {
      this.peerForm.get(key).setValue(this.peerForm.controls[key].value.trim());
    });

    if (this.peerForm.valid) {
      this.logsmsg.push({ msg: 'Creating peer.', icon: 'loader.gif', index: 1 });
      this.modellref = this.modalService.open(this.content,
        {
          windowClass: 'activation-box animated zoomIn faster', centered: true, backdrop: 'static',
          keyboard: false
        });
      await this.peerApi();

      await this.registerPeerTrueApi();

      await this.enrollPeerTrueApi();

      await this.registerPeerFalseApi();

      await this.enrollPeerFalseApi();

      await this.generatePeerMspApi();

      await this.copyPeerMaterislToNfsApi();

      await this.createPeerServiceApi();

      await this.createPeerDeploymentApi();

      await this.createPeerCouchServiceApi();

      await this.createPeerCouchDeploymentApi();


    }
  }



}
