import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder, } from "@angular/forms";
import { CaService } from './../ca.service';
import { CommonService } from "./../../common.service"
import { NetworkService } from './../../../network/network.service';
import { ApiKeyService } from './../../../api-key/api-key.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-create-ca',
  templateUrl: './create-ca.component.html',
  styleUrls: ['./create-ca.component.scss']
})
export class CreateCaComponent implements OnInit {


  tokenFromUI: string = "0123456789123456";

  constructor(private formBuilder: FormBuilder,
    private caService: CaService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private Router: Router,
    private commonService: CommonService,
    private apiKeyService: ApiKeyService,
    private NetworkService: NetworkService) { }

  caForm: FormGroup;
  submitted: false;
  pwdShow = false;
  clusters;
  modellref;
  invalidAccessModel;
  closeAble = false;
  caId;
  incrementLogs: number = 0;
  success;
  getNetworkId;
  showErrorBtn = false;
  networkData;
  clusterList;
  // networkId;
  isDisable = 'notdisabled';
  logsmsg = [];
  @ViewChild('content', { static: false }) private content;
  @ViewChild('invalidAccess', { static: false }) private invalidAccess;

  ngOnInit() {
    this.getLocalStoreId();
    this.caFormFields();
    // this.caForm.controls['clusterId'].setValue(localStorage.getItem("clusterId"));
    if (localStorage.getItem("netWorkId") != null) {
      this.getClusters(localStorage.getItem("netWorkId"));
    }
    this.apiKeyService.getToken('').then(res => {
      localStorage.setItem("token", res.data.token);
    });
  }

  getClusters(networkId) {
    this.NetworkService.networkInfo(networkId).subscribe(response => {
      this.clusterList = response.data.cluster;
    }, err => {
      if (!err.error.message) {
        this.toastr.error("Something Went Wrong");
        throw new Error();
      }
      this.toastr.error(err.error.message, 'Error');
      throw new Error();
    });
  }

  get basePath() {
    return this.caForm.controls;
  }

  getLocalStoreId() {
    this.getNetworkId = localStorage.getItem("netWorkId");
    if (this.getNetworkId) {
      this.getNetworkInfo(localStorage.getItem("netWorkId"));

    }

    if (!this.getNetworkId) {
      localStorage.removeItem("netWorkId");
      this.commonService.networkChanged();
    }
  }

  getNetworkInfo(getNetworkId) {
    this.caService.getNetworkInfo(getNetworkId)
      .subscribe((response) => {
        this.caForm.patchValue({
          'networkId': response.data._id
        });
      }, (error) => {
        if (!error.error.message) {
          throw new Error();
        }
        this.toastr.error(error.error.message);
        throw new Error();
      })
  }

  //hide Activity Model 
  hideActivityModel() {
    this.closeAble = false;
    this.showErrorBtn = true;
    this.modellref.close();
  }

  caFormFields() {
    this.caForm = this.formBuilder.group({
      name: ['', Validators.required],
      isTLS: ['0', Validators.required],
      clusterId: ['', Validators.required],
      networkId: [''],
      admnId: ['', Validators.required],
      admnSecret: ['', Validators.required],
    });

  }

  goToNetworkList() {
    this.invalidAccessModel.close()
    this.Router.navigate(['/network']);
  }

  showInvaildAccessModal() {
    this.invalidAccessModel = this.modalService.open(this.invalidAccess, {
      windowClass: 'activation-box invalid-access-box animated zoomIn faster', centered: true, backdrop: 'static',
      keyboard: false
    });
  }

  omit_special_char(event) {
    var k;
    k = event.charCode;  //         k = event.keyCode;  (Both can be used)
    if ((k > 96 && k < 123) || k == 8  || k == 45 || (k >= 48 && k <= 57)) {
      return k;
    }
    else {
      this.toastr.error('Only Alpha-Numeric small characters  and Hyphen (-) are allowed');
      return false;
    }
  }

  async  rehitApi(index) {
    if (index == 2) {
      await this.addCa();
      await this.serviceCa();
      await this.caDeployement();
      await this.fetchTls();
      await this.writeConnection();
      await this.enrollApi()
    }
    if (index == 3) {
      await this.serviceCa();
      await this.caDeployement();
      await this.fetchTls();
      await this.writeConnection();
      await this.enrollApi()
    }
    if (index == 4) {
      await this.caDeployement();
      await this.fetchTls();
      await this.writeConnection();
      await this.enrollApi()
    }
    if (index == 5) {
      await this.fetchTls();
      await this.writeConnection();
      await this.enrollApi()
    }
    if (index == 6) {
      await this.writeConnection();
      await this.enrollApi();
    }
    if (index == 7) {
      this.enrollApi();
    }
  }

  async submit() {
    this.logsmsg = [];
    this.closeAble = false;
    this.showErrorBtn = false;
    this.incrementLogs = 0;

    // Trim form fields
    Object.keys(this.caForm.controls).forEach(key => {
      this.caForm.get(key).setValue(this.caForm.controls[key].value.trim());
    });

    for (const c of Object.keys(this.caForm.controls)) {
      this.caForm.controls[c].markAsTouched();
    }

    if (this.caForm.invalid) {
      return;
    }

    try {
      this.modalPopUp();
      let self = this;

      this.logsmsg.push({ msg: 'Adding Root-CA.', icon: 'loader.gif' });
      await this.addCa();

      this.logsmsg.push({ msg: 'Creating kubernetes service for Root-CA.', icon: 'loader.gif', index: 3 });
      await this.serviceCa();


      this.logsmsg.push({ msg: 'Creating kubernetes deployment for Root-CA.', icon: 'loader.gif', index: 4 });
      await this.caDeployement();

      this.logsmsg.push({ msg: 'Downloading Root-CA certificates.', icon: 'loader.gif', index: 5 });
      await this.fetchTls();

      this.logsmsg.push({ msg: 'Write connection configurations.', icon: 'loader.gif', index: 6 });
      await this.writeConnection();

      this.logsmsg.push({ msg: 'Enroll Root-CA.', icon: 'loader.gif', index: 7 });
      await this.enrollApi();

    } catch (error) {
      if (!error.error.message) {
        this.toastr.error("Something Went Wrong");
        throw new Error();
      }
      this.showErrorBtn = true;
      this.closeAble = true;
    }
  }
  modalPopUp() {
    this.modellref = this.modalService.open(this.content,
      {
        windowClass: 'activation-box animated zoomIn faster', centered: true, backdrop: 'static',
        keyboard: false
      });
  }



  addCa() {
    this.closeAble = false;
    this.showErrorBtn = false;
    this.logsmsg[this.incrementLogs] = { msg: 'Adding Root-CA.', icon: 'loader.gif', index: 2 };
    return new Promise(async (resolve, reject) => {
      let addCaResponse = await this.caService.addCa(this.caForm.value).catch(error => {
        if (!error.error.message) {
          this.toastr.error("Something Went Wrong");
        }
        else {
          this.toastr.error(error.error.message);
        }

        this.logsmsg[this.incrementLogs].icon = 'refresh.png';
        this.logsmsg[this.incrementLogs].success = "no"
        this.closeAble = true;
        this.showErrorBtn = true;
        reject();
        throw new Error();
      });
      this.logsmsg[this.incrementLogs].icon = 'check.png';
      this.incrementLogs++;
      this.caId = { "caId": addCaResponse.data._id };
      resolve();
    })
  }

  serviceCa() {
    this.closeAble = false;
    this.showErrorBtn = false;
    this.logsmsg[this.incrementLogs] = { msg: 'Creating kubernetes service for Root-CA.', icon: 'loader.gif', index: 3 };
    return new Promise(async (resolve, reject) => {
      let caServiceResponse = await this.caService.createCaService(this.caId).catch(error => {
        if (!error.error.message) {
          this.toastr.error("Something Went Wrong");
        }
        else {
          this.toastr.error(error.error.message);
        }
        this.logsmsg[this.incrementLogs].icon = 'refresh.png';
        this.logsmsg[this.incrementLogs].success = "no"
        this.closeAble = true;
        this.showErrorBtn = true;
        reject();
        throw new Error();
      });
      this.logsmsg[this.incrementLogs].icon = 'check.png';
      this.incrementLogs++;
      resolve();
    })
  }

  caDeployement() {
    this.closeAble = false;
    this.showErrorBtn = false;
    this.logsmsg[this.incrementLogs] = { msg: 'Creating kubernetes deployment for Root-CA.', icon: 'loader.gif', index: 4 };
    return new Promise(async (resolve, reject) => {
      let caDeploymentResponse = await this.caService.CreateCaDeployment(this.caId).catch(error => {
        if (!error.error.message) {
          this.toastr.error("Something Went Wrong");
        }
        else {
          this.toastr.error(error.error.message);
        }
        this.logsmsg[this.incrementLogs].icon = 'refresh.png';
        this.logsmsg[this.incrementLogs].success = "no"
        this.closeAble = true;
        this.showErrorBtn = true;
        reject();
        throw new Error();
      });
      setTimeout(async () => {
        this.logsmsg[this.incrementLogs].icon = 'check.png';
        this.incrementLogs++;
        resolve();
      }, 30000)
    })
  }

  fetchTls() {
    this.closeAble = false;
    this.showErrorBtn = false;
    this.logsmsg[this.incrementLogs] = { msg: 'Downloading Root-CA certificates.', icon: 'loader.gif', index: 5 };
    return new Promise(async (resolve, reject) => {
      let fetchCaTlsCertificatesResponse = await this.caService.fetchCaTlsCertificatesFromNFS(this.caId).catch(error => {
        if (!error.error.message) {
          this.toastr.error("Something Went Wrong");
        }
        else {
          this.toastr.error(error.error.message);
        }
        this.logsmsg[this.incrementLogs].icon = 'refresh.png';
        this.logsmsg[this.incrementLogs].success = "no"
        this.closeAble = true;
        this.showErrorBtn = true;
        reject();
        throw new Error();
      });

      if (fetchCaTlsCertificatesResponse.status == 0) {
        this.logsmsg[this.incrementLogs].icon = 'refresh.png';
        this.logsmsg[this.incrementLogs].success = "no"
        this.toastr.error("something went wrong");
        this.showErrorBtn = true;
        this.closeAble = true;
        reject();
        throw new Error();
      }
      this.logsmsg[this.incrementLogs].icon = 'check.png';
      this.incrementLogs++;
      resolve();
    })
  }

  writeConnection() {
    this.closeAble = false;
    this.showErrorBtn = false;
    this.logsmsg[this.incrementLogs] = { msg: 'Write connection configurations.', icon: 'loader.gif', index: 6 };
    return new Promise(async (resolve, reject) => {
      let connectionConfigsResponse = await this.caService.writeConnectionConfigs(this.caId).catch(error => {
        if (!error.error.message) {
          this.toastr.error("Something Went Wrong");
          reject();
          throw new Error();
        }
        this.logsmsg[this.incrementLogs].icon = 'refresh.png';
        this.logsmsg[this.incrementLogs].success = "no"
        this.toastr.error("something went wrong");
        this.closeAble = true;
        this.showErrorBtn = true;
        reject();
        throw new Error();
      });
      this.logsmsg[this.incrementLogs].icon = 'check.png';
      this.incrementLogs++;
      resolve();
    })
  }

  enrollApi() {
    this.closeAble = false;
    this.showErrorBtn = false;
    let self = this;
    this.logsmsg[this.incrementLogs] = { msg: 'Enroll Root-CA.', icon: 'loader.gif', index: 7 };
    return new Promise(async (resolve, reject) => {
      let enrollResponse = await this.caService.enrollRegistrar(this.caId).catch(error => {
        if (!error.error.message) {
          this.toastr.error("Something Went Wrong");
          reject();
          throw new Error();
        }
        this.logsmsg[this.incrementLogs].icon = 'refresh.png';
        this.logsmsg[this.incrementLogs].success = "no"
        this.toastr.error("something went wrong");
        this.closeAble = true;
        this.showErrorBtn = true;
        reject();
        throw new Error();
      });
      this.logsmsg[this.incrementLogs].icon = 'check.png';
      this.incrementLogs++;
      this.success = true;
      this.closeAble = true;
      setTimeout(function () {
        self.modellref.close();
        self.Router.navigate(['inner-sidebar/ca']);
      }, 2000);
      resolve();
    })
  }

}
