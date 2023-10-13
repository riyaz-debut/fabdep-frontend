import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder, } from "@angular/forms";
import { CaService } from './../ca.service';
import { CommonService } from "./../../common.service"
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-edit-ca',
  templateUrl: './edit-ca.component.html',
  styleUrls: ['./edit-ca.component.scss']
})
export class EditCaComponent implements OnInit {


  tokenFromUI: string = "0123456789123456";

  constructor(private formBuilder: FormBuilder,
    private caService: CaService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private Router: Router,
    private commonService: CommonService
  ) { }

  caForm: FormGroup;
  submitted: false;
  clusters;
  modellref;
  closeAble = false;
  incrementLogs: number = 0;
  success;
  getNetworkId;
  networkData;
  // networkId;
  records = '';
  isDisable = 'notdisabled';
  logsmsg = [];
  @ViewChild('content', { static: false }) private content;

  ngOnInit() {

    this.getCertificateAuthorityData();

    this.getLocalStoreId();
    //  this.getClusters();
    this.caFormFields();
  }

  getCertificateAuthorityData() {

    let id = { "_id": this.route.snapshot.paramMap.get('id') };
    this.caService.getCertificateAuthorityData(id).subscribe((res) => {
      this.records = res.data;

      this.caForm.patchValue({
        caId: this.records['_id'],
        name: this.records['name'],
        //isTLS: this.records['isTLS'],
        admnId: this.records['admnId'],
        admnSecret: this.records['admnSecret'],

      });


    },
      error => {
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

  // getClusters() {
  //   let app = this;
  //   this.caService.getClusters()
  //     .subscribe((response) => {
  //       app.clusters = response.data;
  //     })
  // }

  getNetworkInfo(getNetworkId) {
    this.caService.getNetworkInfo(getNetworkId)
      .subscribe((response) => {
        this.caForm.patchValue({
          'networkId': response.data._id, 'networkName': response.data.name, 'cluster': response.data.cluster_id
        });
      }, (error) => {
        this.toastr.error(error.error.message);
      })
  }

  //hide Activity Model 
  hideActivityModel() {
    this.closeAble = false;
    this.modellref.close();
  }

  caFormFields() {
    this.caForm = this.formBuilder.group({
      caId: [''],
      name: ['', Validators.required],
      isTLS: ['0', Validators.required],
      cluster: ['', Validators.required],
      networkName: ['', Validators.required],
      networkId: [''],
      admnId: ['', Validators.required],
      admnSecret: ['', Validators.required],
    });

  }

  submit() {

    this.logsmsg = [];
    this.closeAble = false;

    //Trim form fields
    // Object.keys(this.caForm.controls).forEach(key => {
    //   this.caForm.get(key).setValue(this.caForm.controls[key].value.trim());
    // });

    //this.submitted = true;
    this.closeAble = false;
    for (const c of Object.keys(this.caForm.controls)) {
      this.caForm.controls[c].markAsTouched();
    }

    if (this.caForm.invalid) {
      return;
    }

    if (this.caForm.value.networkId) {
      this.modalPopUp();
      this.logsmsg = [];
      this.updateCa();
      return;
    }

    // this.modalPopUp();
    // this.logsmsg.push({ msg: 'Network installing in progress', icon: 'loader.gif' });
    // let self = this;
    // this.caService.addNetwork(this.caForm)
    //   .subscribe(async (response) => {
    //     this.caForm.patchValue({ 'networkId': response.data._id });
    //     this.logsmsg[this.incrementLogs].icon = 'check.png';
    //     this.incrementLogs++;
    //     self.updateCa();
    //   }, (error) => {
    //     this.toastr.error(error.error.message);
    //     this.logsmsg[this.incrementLogs].icon = 'cross.png'
    //     this.closeAble = true;
    //   });
    //return;
  }

  modalPopUp() {
    this.modellref = this.modalService.open(this.content,
      {
        windowClass: 'activation-box animated zoomIn faster', centered: true, backdrop: 'static',
        keyboard: false
      });
  }

  updateCa() {
    let self = this;
    self.closeAble = true;
    try {
      this.logsmsg.push({ msg: 'installing CA', icon: 'loader.gif' });
      this.caService.updateCa(this.caForm).subscribe(async (response) => {
        /*
        this.logsmsg[this.incrementLogs].icon = 'check.png';
        this.incrementLogs++;
        this.logsmsg.push({ msg: 'installing CA services ', icon: 'loader.gif' });
        let caId = { "caId": response.data._id };

        await this.caService.createCaService(caId).then(response => {
          this.logsmsg[this.incrementLogs].icon = 'check.png';
          this.incrementLogs++;
          this.logsmsg.push({ msg: 'installing CA Deployment ', icon: 'loader.gif' });
        }).catch(error => {
          this.logsmsg[this.incrementLogs].icon = 'cross.png';
          this.toastr.error(error.error.message);
          self.closeAble = true;
          throw new Error();
        })

        await this.caService.CreateCaDeployment(caId).then(response => {
          this.logsmsg[this.incrementLogs].icon = 'check.png';
          this.incrementLogs++;
          this.logsmsg.push({ msg: 'installing CA Tls Certificates', icon: 'loader.gif' });
        }).catch(error => {
          this.logsmsg[this.incrementLogs].icon = 'cross.png';
          this.toastr.error("something went wrong");
          self.closeAble = true;
          throw new Error();
        })

        await this.caService.fetchCaTlsCertificatesFromNFS(caId).then(response => {
          this.logsmsg[this.incrementLogs].icon = 'check.png';
          this.incrementLogs++;
          this.logsmsg.push({ msg: 'installing connections ', icon: 'loader.gif' });
        }).catch(error => {
          this.logsmsg[this.incrementLogs].icon = 'cross.png';
          this.toastr.error("something went wrong");
          self.closeAble = true;
          throw new Error();
        })

        await this.caService.writeConnectionConfigs(caId).then(response => {
          this.logsmsg[this.incrementLogs].icon = 'check.png';
          this.incrementLogs++;
          this.logsmsg.push({ msg: 'installing Enroll Registrar ', icon: 'loader.gif' });
        }).catch(error => {
          this.logsmsg[this.incrementLogs].icon = 'cross.png';
          this.toastr.error("something went wrong");
          self.closeAble = true;
          throw new Error();
        })

        await this.caService.enrollRegistrar(caId).then(response => {
          this.logsmsg[this.incrementLogs].icon = 'check.png';
          this.incrementLogs++;
          this.success = true;
          self.closeAble = true;
          localStorage.setItem("netWorkId", this.caForm.controls['networkId'].value);
          setTimeout(function () {
            self.modellref.close();
            self.Router.navigate(['inner-sidebar/ca']);
          }, 5000);
        }).catch(error => {
          this.logsmsg[this.incrementLogs].icon = 'cross.png'
          this.toastr.error("something went wrong");
          self.closeAble = true;
          throw new Error();
        })
        */
      }, error => {
        self.toastr.error(error.error.message);
        self.logsmsg[this.incrementLogs].icon = 'cross.png';
        self.closeAble = true;
      });
    } catch (error) {
      this.toastr.error(error.error.message);
      this.logsmsg[this.incrementLogs].icon = 'cross.png';
      self.closeAble = true;
    }
  }

}
