import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, Validators, FormControl } from '@angular/forms';
import { OrganisationService } from './../../organisation/organisation.service';
import { NetworkService } from './../../../network/network.service';
import { ApiKeyService } from './../../../api-key/api-key.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { async } from 'q';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-create-orderer-organisation',
  templateUrl: './create-orderer-organisation.component.html',
  styleUrls: ['./create-orderer-organisation.component.scss']
})
export class CreateOrdererOrganisationComponent implements OnInit {

  invalidAccessModel;
  adding_admin_loading_img = false;
  add_new_admin_button = true;
  showAdmin = false;
  closeAble = false;
  pwdShow = false;
  failApi = false;
  organisationForm: FormGroup;
  showPwd = 'password';
  caList;
  tlsCaList;
  clusterList;
  responseData;
  adminList;
  modellref;
  checkallapis = false;
  errormsg = [];
  logsmsg = [];
  @ViewChild('content', { static: false }) private content;
  @ViewChild('invalidAccess', { static: false }) private invalidAccess;

  constructor(private formBuilder: FormBuilder,
    private Router: Router,
    private _organisationService: OrganisationService,
    private NetworkService: NetworkService,
    private toastr: ToastrService,
    private apiKeyService: ApiKeyService,
    private modalService: NgbModal) { }

  ngOnInit() {
    this.organisationForm = this.formBuilder.group({
      name: ['', Validators.required],
      mspId: ['', Validators.required],
      type: ['1', Validators.required],
      tlsCaId: ['', Validators.required],
      caId: ['', Validators.required],
      adminId: ['', Validators.required],
      clusterId: ['', Validators.required],
      networkId: ['']
    });
    if (localStorage.getItem("netWorkId")) {
      this.organisationForm.patchValue({ networkId: localStorage.getItem("netWorkId") });
      this.getClusters(localStorage.getItem("netWorkId"));
      this.getAllCertificateAuthority(localStorage.getItem("netWorkId"));
      // if (localStorage.getItem("clusterId") != null) {
      //   this.organisationForm.patchValue({
      //     networkId: localStorage.getItem("netWorkId")
      //   })
      // }
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
        windowClass: 'activation-box invalid-access-box animated zoomIn faster', centered: true, backdrop: 'static',
        keyboard: false
      });
  }

  //hide Activity Model 
  hideActivityModel() {
    this.closeAble = false;
    this.modellref.close()
    //this.Router.navigate(['/inner-sidebar/orderer']);
  }

  getClusters(networkId) {
    this.NetworkService.networkInfo(networkId).subscribe(response => {
      this.clusterList = response.data.cluster;
    }, err => {
      this.toastr.error(err.error.message);
    });
  }

  getAllCertificateAuthority(networkId) {
    this._organisationService.caList({ 'networkId': networkId }).subscribe(response => {
      if (response.status === 1) {
        this.responseData = response.data;
        this.caList = this.responseData.filter(data => data.isTLS === 0);
        this.tlsCaList = this.responseData.filter(data => data.isTLS === 1);
      }
      if (this.tlsCaList.length) {
        this.organisationForm.controls['tlsCaId'].setValue(this.tlsCaList[0]._id);
      }
      else {
        this.toastr.error("TLS CA not found");
      }
    });
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

  special_char(event) {
    var k;
    k = event.charCode;  //         k = event.keyCode;  (Both can be used)
    if ( (k > 96 && k < 123) || k == 8  || k==45 || (k >= 48 && k <= 57) || (k >= 65 && k <= 90))  {
      return k;
    }
    else {
      this.toastr.error('Only Alpha-Numeric characters  and Hyphen (-) are allowed');
      return false;
    }
  }

  getAdmin(id) {

    if (this.organisationForm.value.caId != '') {
      this.adminList = [];

      this.organisationForm.controls['adminId'].setValue('');
      this.organisationForm.updateValueAndValidity();
      this.organisationForm.controls['adminId'].markAsUntouched();

      this._organisationService.getAdmins(this.organisationForm.value.caId).subscribe((response) => {
        this.adminList = response.data;

        let new_id = response.data.filter(data => data._id == id);
        if (new_id.length) {
          this.organisationForm.controls['adminId'].setValue(new_id[0]._id);
          this.organisationForm.updateValueAndValidity();
        }
      },
        err => {
          this.toastr.info('Please create admin', 'Admin not found for Ca');
          this.addAdmin();

        })
    }

  }

  addOrganisation() {

    this.logsmsg = [];

    for (const c of Object.keys(this.organisationForm.controls)) {
      this.organisationForm.controls[c].markAsTouched();
    }

    //Trim form fields
    Object.keys(this.organisationForm.controls).forEach(key => {
      this.organisationForm.get(key).setValue(this.organisationForm.controls[key].value.trim());
    });

    if (this.organisationForm.valid) {
      this.closeAble = false;
      this.checkallapis = false;
      this.failApi = false;
      this.logsmsg.push({ msg: 'Creating orderer.', icon: 'loader.gif' });

      this.modellref = this.modalService.open(this.content,
        {
          windowClass: 'activation-box animated zoomIn faster', centered: true, backdrop: 'static',
          keyboard: false
        });
      this._organisationService.add(this.organisationForm.value).subscribe(async (response) => {
        this.logsmsg[0].icon = 'check.png';
        this.logsmsg.push({ msg: 'Creating wallet.', icon: 'loader.gif' });

        const bar = new Promise(async (resolve, reject) => {
          await this._organisationService.createWallet(response.data._id).then((response) => {
            this.logsmsg[1].icon = 'check.png';
          }).catch(error => {

            if (!error.error.message) {
              this.toastr.error("Something Went Wrong");
            }
            else {
              this.toastr.error(error.error.message);
            }


            this.logsmsg[1].icon = 'cross.png';
            this.closeAble = true;
            this.failApi = true;
            reject();
            throw new Error();
          });
          resolve();
        });
        await bar;
        this.checkallapis = true;
        this.closeAble = true;
        setTimeout(() => {
          this.modellref.close();
          this.Router.navigate(['/inner-sidebar/orderer']);
        }, 2000)


      },
        error => {
          this.logsmsg[0].icon = 'cross.png';
          this.closeAble = true;
          this.failApi = true;
          if (!error.error.message) {
            this.toastr.error("Something Went Wrong");
          }
          else {
            this.toastr.error(error.error.message);
          }
        });
    }
  }

  addNewAdmin() {
    let registeredAdminId = "";
    let data = {
      "caId": this.organisationForm.get('caId').value,
      "admnId": this.organisationForm.get('newAdminId').value,
      "admnSecret": this.organisationForm.get('newAdminSecret').value
    }

    if (data.caId == '') {
      this.organisationForm.controls['caId'].markAsTouched();
      return;
    }

    this.adding_admin_loading_img = true;
    this.showAdmin = false;
    this.add_new_admin_button = false;
    this._organisationService.registerCaAdmin(data).subscribe(async (res) => {
      registeredAdminId = res.data._id;
      const bar = new Promise(async (resolve, reject) => {

        await this._organisationService.enrollCaAdmin({ '_id': registeredAdminId }).then((res) => {
          this.adding_admin_loading_img = false;
          this.showAdmin = false;
          this.add_new_admin_button = true;

          this.getAdmin(registeredAdminId);

          this.organisationForm.removeControl('newAdminId');
          this.organisationForm.removeControl('newAdminSecret');
        }).catch(error => {

          if (!error.error.message) {
            this.toastr.error("Something Went Wrong");
          }
          else {
            this.toastr.error(error.error.message);
          }

          this.adding_admin_loading_img = false;
          this.showAdmin = false;
          this.add_new_admin_button = true;

          reject();
          throw new Error();
        });
        resolve();
      });
      await bar;
      setTimeout(() => { }, 2000);
    }, error => {
      this.toastr.error(error.error.message);
      this.adding_admin_loading_img = false;
      this.showAdmin = false;
      this.add_new_admin_button = true;
    })

  }

  addAdmin() {
    this.showAdmin = !this.showAdmin;
    if (this.showAdmin) {
      this.organisationForm.addControl('newAdminId', new FormControl('', Validators.compose([Validators.required])));
      this.organisationForm.addControl('newAdminSecret', new FormControl('', Validators.compose([Validators.required])));

    } else {
      this.organisationForm.removeControl('newAdminId');
      this.organisationForm.removeControl('newAdminSecret');

    }
  }

}
