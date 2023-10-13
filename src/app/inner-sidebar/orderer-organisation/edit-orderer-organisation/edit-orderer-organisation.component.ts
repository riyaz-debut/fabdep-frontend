import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, Validators, FormControl } from '@angular/forms';
import { OrganisationService } from './../../organisation/organisation.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { async } from 'q';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-edit-orderer-organisation',
  templateUrl: './edit-orderer-organisation.component.html',
  styleUrls: ['./edit-orderer-organisation.component.scss']
})
export class EditOrdererOrganisationComponent implements OnInit {

  
  adding_admin_loading_img = false;
  add_new_admin_button = true;
  showAdmin = false;
  closeAble = false;
  organisationForm: FormGroup;
  showPwd = 'password';
  caList;
  tlsCaList;
  responseData;
  adminList;
  modellref;
  checkallapis = false;
  errormsg = [];
  logsmsg = [];
  records  = '';
  @ViewChild('content', { static: false }) private content;

  constructor(private formBuilder: FormBuilder,
    private Router: Router,
    private ActivatedRoute: ActivatedRoute,
    private _organisationService: OrganisationService,
    private toastr: ToastrService,
    private modalService: NgbModal) { }

  ngOnInit() {

  	this.getOrganisationById();

    this.organisationForm = this.formBuilder.group({
      organisationId: [''],
      name: ['', Validators.required],
      mspId: ['', Validators.required],
      type: ['1', Validators.required],
      tlsCaId: ['', Validators.required],
      caId: ['', Validators.required],
      adminId: ['', Validators.required]
    }),
      this.getAllCertificateAuthority(localStorage.getItem("netWorkId"));
  }

    getOrganisationById(){

    let id = { "_id": this.ActivatedRoute.snapshot.paramMap.get('id') };
    this._organisationService.getOrganisationById(id).subscribe((res) => {

      this.records = res.data;

      this.organisationForm.patchValue({
        organisationId: this.records['_id'],
        name: this.records['name'],
        mspId: this.records['mspId'],
        caId: this.records['caId'],
        //adminId: this.records['adminId'],
      }); 
      this.organisationForm.updateValueAndValidity();
      this.getAdmin(this.records['adminId']);

    },
      error => {
    });
    //console.log(this.records['caId']);
    
  }

  //hide Activity Model 
  hideActivityModel(){
    this.closeAble = false;
    this.modellref.close()
    this.Router.navigate(['/inner-sidebar/orderer']);
  }

  getAllCertificateAuthority(networkId) {
    this._organisationService.caList({ 'networkId': networkId }).subscribe(response => {
      if (response.status === 1) {
        this.responseData = response.data;
        this.caList = this.responseData.filter(data => data.isTLS === 0);
        this.tlsCaList = this.responseData.filter(data => data.isTLS === 1);
        //this.tlsCaList = [];
        
      }
      if(this.tlsCaList.length){
        this.organisationForm.controls['tlsCaId'].setValue(this.tlsCaList[0]._id);
      }
      else{
        this.toastr.error("TLS CA not found");
      }
    });
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
          //this.toastr.error(err.error.message, 'Error');
          this.toastr.info('Please create admin', 'Admin not found for Ca');
          this.addAdmin();
        })
    }
    else {

    }

  }

  editOrganisation() {
    for (const c of Object.keys(this.organisationForm.controls)) {
      this.organisationForm.controls[c].markAsTouched();
    }
    if (this.organisationForm.valid) {
        this.closeAble = false;
      // this._organisationService.add(this.organisationForm.value).subscribe(async(response) => {
      //   this.toastr.success(response.message, 'Success');
      //   let orgId = response.data._id;
      //   await this._organisationService.createWallet(response.data._id).subscribe((response)=>{
      //     this.toastr.success(response.message, 'Success');
      //     if(this.showAdmin) {
      //       let data = {
      //         "caId": this.organisationForm.get('caId').value,
      //         "admnId":this.organisationForm.get('newAdminId').value,
      //         "admnSecret": this.organisationForm.get('newAdminSecret').value
      //       }
      //       this._organisationService.registerCaAdmin(data).subscribe(async(res) => {
      //         this._organisationService.enrollCaAdmin({'_id':res.data._id}).subscribe(() => {
      //         });
      //       });
      //     }
      //     //this.Router.navigate(['/inner-sidebar/organisation'])
      //   },
      //   error => {
      //     this.toastr.error(error.errors.message);
      //   })
      // },
      // error => {
      //   this.toastr.error(error.errors.message);
      // });

      this.logsmsg.push({ msg: 'creating organisation', icon: 'loader.gif' });

      this.modellref = this.modalService.open(this.content,
      {
        windowClass: 'activation-box animated zoomIn faster', centered: true, backdrop: 'static',
        keyboard: false
      });
      this._organisationService.updateOrganisation(this.organisationForm.value).subscribe(async (response) => {
        this.logsmsg[0].icon = 'check.png';
        this.logsmsg.push({ msg: 'creating wallet', icon: 'loader.gif' });

        const bar = new Promise(async (resolve, reject) => {
          await this._organisationService.createWallet(response.data._id).then((response) => {
            this.logsmsg[1].icon = 'check.png';
          }).catch(error => {
            this.logsmsg[1].icon = 'cross.png';
            this.closeAble = true;
          });
          resolve();
        });
        await bar;
        this.checkallapis = true;
        this.closeAble = true;
        setTimeout(() => {
          this.modellref.close();
          this.Router.navigate(['/inner-sidebar/orderer']);
        }, 5000)
        
        
      },
        error => {
          this.logsmsg[0].icon = 'cross.png';
          this.closeAble = true;
          this.toastr.error(error.errors.message);
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

      if(data.caId == '') {
        this.organisationForm.controls['caId'].markAsTouched();
        return;
      }

      // this.logsmsg.push({ msg: 'registering new admin', icon: 'loader.gif' });
      this.adding_admin_loading_img = true;
      this.showAdmin = false;
      this.add_new_admin_button = false;
      this._organisationService.registerCaAdmin(data).subscribe(async(res) => {
        registeredAdminId = res.data._id;
        
        // this.logsmsg[2].icon = 'check.png';
        // this.logsmsg.push({ msg: 'enrolling new admin', icon: 'loader.gif' });
        const bar = new Promise(async (resolve, reject) => {

          await this._organisationService.enrollCaAdmin({ '_id': registeredAdminId }).then((res) => {
            // this.logsmsg[3].icon = 'check.png';
            this.adding_admin_loading_img = false;
            this.showAdmin = false;
            this.add_new_admin_button = true;

            this.getAdmin(registeredAdminId);

            this.organisationForm.removeControl('newAdminId');
            this.organisationForm.removeControl('newAdminSecret');
          }).catch(error => {
            // this.logsmsg[3].icon = 'cross.png';
          });
          resolve();
        });
        await bar;
        setTimeout(() => {},2000);
      })
      // .catch(error => {
      //   this.logsmsg[2].icon = 'cross.png';
      // });
      
      
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
