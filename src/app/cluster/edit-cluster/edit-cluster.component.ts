import { Component, OnInit, ViewChild, OnChanges } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { ClusterService } from './../cluster.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { async } from '@angular/core/testing';
import { resolve } from 'url';
import { ApiKeyService } from './../../api-key/api-key.service';


declare var bootbox: any;


@Component({
  selector: 'app-edit-cluster',
  templateUrl: './edit-cluster.component.html',
  styleUrls: ['./edit-cluster.component.scss']
})

export class EditClusterComponent implements OnInit {

  clusterForms: FormGroup;
  validateVm = 'fa-check';
  showPwd = 'password';
  worklist = [];
  i;
  mnodeId = null;
  isDisable = 'notdisabled';
  modellref;
  errormsg = [];
  logsmsg = [];
  errorArr = [];
  failApi = false;
  checkallapis = false;
  closeAble = false;
  masterName = '';
  workerName = '';
  pageChanges = [null, null];
  clusterData;
  clusterId;
  indexs = 0;
  updatePromiseArr = [];
  clusterFormsErr = true;

  @ViewChild('content', { static: false }) private content;


  //************************************************************************//
  // Constructor
  //************************************************************************//

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private _clusterService: ClusterService,
    private apiKeyService: ApiKeyService,
    private toastr: ToastrService,
    private router: Router,
    private modalService: NgbModal
  ) { }


  //************************************************************************//
  // ngOnInit
  //************************************************************************//

  ngOnInit() {

    this.getClusterData();

    this.clusterForms = this.formBuilder.group({
      cName: ['', Validators.required],
      mName: ['', Validators.required],
      mIp: [{ value: null, disabled: true }, [Validators.required,
      Validators.pattern(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gm)]],
      mUsername: [{ value: null, disabled: true }, [Validators.required]],
      mPassword: [{ value: '', disabled: true }, [Validators.required]],
      //workerRows: this.formBuilder.array([this.initWorkerRows(), this.initWorkerRows()])
      workerRows: this.formBuilder.array([])
    });

    this.worklist.push({
      icon: 'fa-check',
      pwd_type: 'password',
      workerId: null,
      isDisable: 'notdisabled',
      btnDisable: true
    });

    // this.worklist.push({
    //   icon: 'fa-check',
    //   pwd_type: 'password',
    //   workerId: null,
    //   isDisable: 'notdisabled'
    // });

  }

  //************************************************************************//
  // Ger Cluster Data.
  //************************************************************************//

  getClusterData() {

    this.clusterId = this.route.snapshot.paramMap.get('id');
    let id = this.clusterId;

    this._clusterService.getClusterData(id).subscribe((response) => {

      this.clusterData = response.data;
      this.mnodeId = this.clusterData['master_node']._id;

      this.clusterForms.patchValue({
        cName: this.clusterData['name'],
        mName: this.clusterData['master_node'].description,
        mIp: this.clusterData['master_node'].ip,
        mUsername: this.clusterData['master_node'].username,
        mPassword: this.clusterData['master_node'].password
      });
      this.getWorkers();

    },
      error => {
        console.log('error')
      });
  }


  //************************************************************************//
  // Get Workers
  //************************************************************************//


  getWorkers() {

    const arr = this.clusterData['worker_node'].map(response => {

      if (this.worklist[this.indexs]) {
        this.worklist[this.indexs].workerId = response._id;
        this.indexs++;

        this.formArr.push(
          this.formBuilder.group({
            vmid: [response._id],
            wName: [response.description, Validators.required],
            wIp: [{ value: response.ip, disabled: true }],
            wUsername: [{ value: response.username, disabled: true }],
            wPassword: [{ value: response.password, disabled: true }]
          })
        );
      }
      else {
        this.worklist.push({
          icon: 'fa-check',
          pwd_type: 'password',
          workerId: null,
          isDisable: 'notdisabled',
          btnDisable: true
        });
        this.indexs++;
        this.formArr.push(
          this.formBuilder.group({
            vmid: [response._id],
            wName: [response.description, Validators.required],
            wIp: [{ value: response.ip, disabled: true }],
            wUsername: [{ value: response.username, disabled: true }],
            wPassword: [{ value: response.password, disabled: true }]
          })
        );
      }

    });
  }

  //************************************************************************//
  // Init Worker Rows
  //************************************************************************//

  initWorkerRows() {

    return this.formBuilder.group({
      vmid: [null],
      wName: ['', Validators.required],
      wIp: [null, [Validators.required,
      Validators.pattern(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gm)]],
      wPassword: ['', [Validators.required]],
      wUsername: [null, [Validators.required]],
      newAdded: [false]
    });

  }

  //************************************************************************//
  // Form Array
  //************************************************************************//


  get formArr() {
    return this.clusterForms.get('workerRows') as FormArray;
  }

  //************************************************************************//
  // Add New Row
  //************************************************************************//

  addNewRow() {

    this.formArr.push(this.initWorkerRows());

    this.worklist.push({
      // icon: 'fa-times',
      icon: 'fa-sign-in-alt vm-hitt-icon',
      pwd_type: 'password',
      workerId: null,
      isDisable: 'notdisabled'

    });
  }

  //************************************************************************//
  // Delete Row
  //************************************************************************//

  deleteRow(index: number) {
    if (this.clusterForms.controls.workerRows['controls'].length > 1) {
      this.formArr.removeAt(index);
      this.worklist.splice(index, 1);
    } else {
      this.toastr.error('Minimum one worker required for create cluster.');
    }
  }

  //************************************************************************//
  // Focus Out
  //************************************************************************//

  focusOut(masterIndex) {
    this.errormsg = [];
    const mIp = this.clusterForms.get('mIp').value.trim();
    this.clusterForms.controls.mIp.markAsTouched();
    this.clusterForms.controls.mName.markAsTouched();
    this.clusterForms.controls.mUsername.markAsTouched();

    if (this.clusterForms.get('mName').value.trim() && this.clusterForms.get('mIp').value.trim() && this.clusterForms.get('mUsername').value.trim() &&
      this.clusterForms.get('mPassword').value.trim()
      && mIp.match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gm)) {

      this.isDisable = 'disabled';
      //this.validateVm = 'fa-times';

      // const formData = {
      //   clusterId: this.clusterId,
      //   vmid:  this.mnodeId,
      //   ip:  this.clusterForms.get('mIp').value.trim(),
      //   username: this.clusterForms.get('mUsername').value.trim(),
      //   password:  this.clusterForms.get('mPassword').value.trim(),
      //   type: 1,
      //   description: this.clusterForms.get('mName').value.trim(),
      // };
      const formData = {
        vmid: this.mnodeId,
        description: this.clusterForms.get('mName').value.trim(),
        clusterId: this.clusterId,
        ip: this.clusterForms.get('mIp').value.trim(),
        username: this.clusterForms.get('mUsername').value.trim(),
        password: this.clusterForms.get('mPassword').value.trim(),
        type: 1,
      };

      this.validateVm = 'fa-spin fa-spinner';

      // this.logsmsg.push({ msg: 'Update master node name', icon: 'loader.gif' });
      this.logsmsg[masterIndex] = { msg: 'Update master node name', icon: 'loader.gif' };
      this._clusterService.updateVm(formData).subscribe((res) => {
        //this.mnodeId = res.data._id;
        this.logsmsg[masterIndex].icon = 'check.png'
        this.isDisable = 'notdisabled';
        this.validateVm = 'fa-check';
        this.pageChanges[masterIndex] = null;
      }, (err) => {
        this.logsmsg[masterIndex].icon = 'cross.png'

        this.validateVm = 'fa-times';
        this.mnodeId = null;
        this.isDisable = 'notdisabled';
        if (err.status === 422) {
          err.error.errors.errors.forEach(element => {
            this.errormsg.push({ name: element.param, msg: element.msg });
            this.toastr.error(element.msg);

          });
        } else {
          this.toastr.error(err.error.message);
        }
      });
    }
  }


  trimClusterName(feild) {
    this.clusterForms.controls['cName'].setValue(feild.target.value.trim());
  }

  trimFeild(name, feild) {
    this.clusterForms.controls[name].setValue(feild.target.value.trim());
  }

  trimWorkers(name, feild, i) {
    let worker = this.clusterForms.controls.workerRows['controls'][i];
    worker.controls[name].setValue(feild.target.value.trim());
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

  onBlur(index, name) {
    if (!(name.value == this.masterName) && name.id == 'Cname') {
      this.pageChanges[0] = this.clusterForms;
    } else if (!(name.value == this.masterName) && name.id == 'master-name') {
      this.pageChanges[1] = this.clusterForms;
    } else if (!(name.value == this.masterName) && name.id == 'worker-name' && this.clusterForms.controls.workerRows['controls'][index].get('vmid').value != null) {

      if (!(this.pageChanges.length > 2)) {
        // this.pageChanges[2] = this.clusterForms.controls.workerRows['controls'][index];
        this.pageChanges.push(this.clusterForms.controls.workerRows['controls'][index]);
      } else {
        for (let i = 0; i < this.pageChanges.length; i++) {
          if (i > 1) {
            if (this.pageChanges[i].get('vmid').value == this.clusterForms.controls.workerRows['controls'][index].get('vmid').value) {
              this.pageChanges[i] = this.clusterForms.controls.workerRows['controls'][index];
              return;
            }
          }
        }
        this.pageChanges.push(this.clusterForms.controls.workerRows['controls'][index]);
      }
    } else if (this.clusterForms.controls.workerRows['controls'][index].get('vmid').value == null) {

      if (this.pageChanges.length < 2) {
        const workerForm = this.clusterForms.controls.workerRows['controls'][index];
        // workerForm.controls.wIp.markAsTouched();
        // workerForm.controls.wName.markAsTouched();
        // workerForm.controls.wUsername.markAsTouched();
        // workerForm.controls.wPassword.markAsTouched();

        if (this.clusterForms.controls.workerRows['controls'][index].status == "VALID") {
          this.pageChanges[2] = this.clusterForms.controls.workerRows['controls'][index];
        }

      } else {

        const workerForm = this.clusterForms.controls.workerRows['controls'][index];
        // workerForm.controls.wIp.markAsTouched();
        // workerForm.controls.wName.markAsTouched();
        // workerForm.controls.wUsername.markAsTouched();
        // workerForm.controls.wPassword.markAsTouched();

        if (this.clusterForms.controls.workerRows['controls'][index].status == "VALID") {
          this.pageChanges.push(this.clusterForms.controls.workerRows['controls'][index]);
        }
      }
    }
  }


  //hide Activity Model 
  hideActivityModel() {
    this.closeAble = false;
    this.modellref.close();
  }

  async reHittApi(index, data, logLocation, innerlogsIndex) {
    try {
      this.closeAble = false;
      this.failApi = false;
      this.checkallapis = false;
      if (index == 1) {
        this.logsmsg[0].icon = 'loader.gif';
        this.updateClusterNameApi(data);
      }
      if (index == 2) {
        this.logsmsg[1].icon = 'loader.gif';
        this.updateMasterNameApi(data);
      }
      if (index == 3) {
        this.logsmsg[logLocation].icon = 'loader.gif';
        this.updateVmApi(data, logLocation);
      }
      if (index == 4) {
        this.logsmsg[logLocation].innerlogs[innerlogsIndex].icon = 'loader.gif';
        this.addNewVmApi(data, logLocation, innerlogsIndex)
      }
      if (index == 5) {
        this.logsmsg[logLocation].innerlogs[innerlogsIndex].icon = 'loader.gif';
        this.addWorkerVMApi(data, logLocation, innerlogsIndex);
      }
    } catch (err) {

    }
  }

  //************************************************************************//
  // UPDATE CLUSTER FUNCTION
  //************************************************************************//
  async updateClusterFun() {
    let allCheck = [];
    for (let c of Object.keys(this.clusterForms.controls)) {
      this.clusterForms.controls[c].markAllAsTouched();
    }
    if (this.clusterForms.invalid) {
      return false;
    }
    this.worklist.forEach(element => {
      if (element.icon != 'fa-check') {
        // this.worklist[index].icon = 'fa-check';
        allCheck.push('1')
      }
    });

    for (let index = 0; index < this.worklist.length; index++) {
      if (this.worklist[index].icon != 'fa-check') {
        allCheck.push('1')
      }

    }

    if (allCheck.length) {
      return false
    }
    // console.log('formARR',this.clusterForms);
    // return

    //this.worklist.includes

    const getToken = await this.apiKeyService.getToken('').then(res => {
      localStorage.setItem("token", res.data.token);
    });
    try {
      this.logsmsg = [];
      this.errormsg = [];
      this.updatePromiseArr = [];
      this.closeAble = false;
      this.failApi = false;
      this.checkallapis = false;

      this.modellref = this.modalService.open(this.content,
        {
          windowClass: 'activation-box animated zoomIn faster', centered: true, backdrop: 'static',
          keyboard: false
        });

      const clusterFormData = {
        clusterid: this.clusterId,
        name: this.clusterForms.get('cName').value,
        master_node: this.mnodeId,
        description: this.clusterForms.get('cName').value,
      };

      this.logsmsg.push({ msg: `Update cluster name <b> ${clusterFormData.description}</b>`, icon: 'loader.gif', index: 1, data: clusterFormData });
      this.errorArr.push('1');

      this.updatePromiseArr.push(this.updateClusterNameApi(clusterFormData));

      const masterFormData = {
        vmid: this.mnodeId,
        description: this.clusterForms.get('mName').value.trim(),
        ip: this.clusterForms.get('mIp').value.trim(),
        username: this.clusterForms.get('mUsername').value.trim(),
        password: this.clusterForms.get('mPassword').value.trim(),
        type: 1,
      };

      this.logsmsg.push({ msg: `Update master node name <b>${masterFormData.description} </b> on kubernetes cluster.`, icon: 'loader.gif', index: 2, data: masterFormData });
      this.errorArr.push('1');
      this.updatePromiseArr.push(this.updateMasterNameApi(masterFormData));

      let i = 2; 0
      const workerForm = this.formArr.getRawValue();

      workerForm.forEach(element => {
        this.updatePromiseArr.push(this.workerTask(element, i));
        i++;
        this.errorArr.push('1');
      });

      let waitHere = await Promise.all(this.updatePromiseArr);
      if (!this.errormsg.length) {
        this.failApi = false;
        this.closeAble = true;
        this.checkallapis = true;
        setTimeout(() => {
          this.modellref.close();
          this.router.navigate(['cluster']);
        }, 2000);
      }
    } catch (err) {

    }
  }





  updateClusterNameApi = (clusterFormData) => {
    try {

      return new Promise(async (resolve, reject) => {
        await this._clusterService.updateCluster(clusterFormData).subscribe(async (res) => {
          this.logsmsg[0].success = true;
          this.logsmsg[0].icon = 'check.png';
          this.errorArr.pop();
          resolve();
        }, err => {
          reject()
          this.logsmsg[0].icon = 'cross.png';
          this.errormsg.push('error Update cluster');
          this.toastr.error(err.error.message);
          this.failApi = true;
          this.closeAble = true;
          this.checkallapis = false;
        });
      });
    } catch (err) {

    }
  }

  //************************************************************************//
  // Update Master Name
  //************************************************************************//

  updateMasterNameApi = (masterFormData) => {
    try {
      return new Promise(async (resolve, reject) => {
        await this._clusterService.updateVm(masterFormData).subscribe((res) => {
          this.logsmsg[1].icon = 'check.png';
          this.logsmsg[0].success = true;
          this.errorArr.pop();
          if (!this.errorArr.length) {
            this.failApi = false;
            this.closeAble = true;
            this.checkallapis = true;
            setTimeout(() => {
              this.modellref.close();
              this.router.navigate(['cluster']);
            }, 2000);
          }
          resolve();
        }, err => {
          reject();
          // this.logsmsg[1].icon = 'cross.png';
          this.logsmsg[1].icon = 'refresh.png';
          this.errormsg.push('error Update master');
          this.toastr.error(err.error.message);
          this.failApi = true;
          this.closeAble = true;
          this.checkallapis = false;
        })
      });
    } catch (err) {

    }
  }

  //************************************************************************//
  // Update worker and add new worker 
  //************************************************************************//
  workerTask(element, i) {
    try {
      return new Promise(async (resolve, reject) => {
        // update vm if vmid is not null
        if (!element.newAdded) {
          const formData = {
            vmid: element.vmid,
            description: element.wName,
            ip: element.wIp,
            username: element.wUsername,
            password: element.wPassword,
            type: 2,
          };
          this.logsmsg.push({ msg: `Update worker node name of <b> ${formData.description}</b>  on kubernetes cluster.`, icon: 'loader.gif', index: 3, data: formData, logLocation: i });

          this.updateVmApi(formData, i);

        }
        else {
          let increment = 0;
          this.logsmsg.push({ key: 'array', innerlogs: [] });
          let arrlocation = this.logsmsg.length - 1;

          // add vm if vmid is  null
          const formData = {
            vmid: element.vmid,
            description: element.wName,
            ip: element.wIp,
            username: element.wUsername,
            password: element.wPassword,
            type: 2,
          };

          // this.logsmsg[arrlocation].innerlogs[increment] = { msg: `Add new worker node  <b>  ${formData.description}</b> on kubernetes cluster.`, icon: 'loader.gif', index: 4, data: formData, logLocation: arrlocation, innerlogsIndex: increment };

          this.addNewVmApi(formData, arrlocation, increment);
        }
      })
    } catch (err) {

    }
  }


  updateVmApi(formData, i) {
    try {
      return new Promise((resolve, reject) => {
        this._clusterService.updateVm(formData).subscribe((res) => {
          this.logsmsg[i].success = true;
          this.logsmsg[i].icon = 'check.png';
          this.errorArr.pop();
          if (!this.errorArr.length) {
            this.failApi = false;
            this.closeAble = true;
            this.checkallapis = true;
            setTimeout(() => {
              this.modellref.close();
              this.router.navigate(['cluster']);
            }, 2000);
          }
          resolve();
        }, (err) => {
          // this.logsmsg[i].icon = 'cross.png';
          this.logsmsg[i].icon = 'refresh.png';
          reject();
          this.errormsg.push('error Update worker');
          this.toastr.error(err.error.message);
          this.failApi = true;
          this.closeAble = true;
          this.checkallapis = false;
        });
      })
    } catch (err) {

    }
  }

  async addNewVmApi(formData, arrlocation, increment) {
    try {
      let workerVMID = '';
      // const waitHere = new Promise(async (resolve, reject) => {
      // await this._clusterService.addVm(formData).subscribe(async (res) => {
      //   this.logsmsg[arrlocation].innerlogs[increment].icon = 'check.png';
      //   this.logsmsg[arrlocation].success = true;
      //   increment++
      //   workerVMID = res.data._id;
      //   this.errorArr.pop();

      //   resolve();
      // }, (err) => {
      //   // this.logsmsg[arrlocation].innerlogs[increment].icon = 'cross.png';
      //   this.logsmsg[arrlocation].innerlogs[increment].icon = 'refresh.png';
      //   //increment++
      //   reject();
      //   if (err.status == 422) {
      //     err.error.errors.errors.forEach(validationError => {
      //       this.toastr.error(validationError.msg, validationError.value)
      //     });
      //   }
      //   else {
      //     this.toastr.error(err.error.message);
      //   }
      //   this.errormsg.push('error Add worker');
      //   this.failApi = true;
      //   this.closeAble = true;
      //   this.checkallapis = false;
      //   throw new Error();
      // });
      // await waitHere;

      this.logsmsg[arrlocation].innerlogs[increment] = { msg: `Setting up worker node  <b> ${formData.description} </b> on kubernetes cluster.`, icon: 'loader.gif', index: 5, data: formData.vmid, logLocation: arrlocation, innerlogsIndex: increment };
      // this.errorArr.push('1')
      this.addWorkerVMApi(formData.vmid, arrlocation, increment);

      //});
    } catch (err) {

    }
  }

  addWorkerVMApi(workerVMID, arrlocation, increment) {
    try {
      return new Promise((resolve, reject) => {
        this._clusterService.addWorkervm({ worker_vm_id: workerVMID, cluster_id: this.clusterId }).subscribe((resp) => {
          this.logsmsg[arrlocation].innerlogs[increment].icon = 'check.png';
          this.logsmsg[arrlocation].innerlogs[increment].success = true;
          this.errorArr.pop();
          console.log('this.errorArr', this.errorArr);

          if (!this.errorArr.length) {
            this.failApi = false;
            this.closeAble = true;
            this.checkallapis = true;
            setTimeout(() => {
              this.modellref.close();
              this.router.navigate(['cluster']);
            }, 2000);
          }
          resolve();

        }, error => {
          this.logsmsg[arrlocation].innerlogs[increment].icon = 'refresh.png';
          reject();
          this.toastr.error(error.error.message);
          this.errormsg.push('error Add worker to cluster');
          this.failApi = true;
          this.closeAble = true;
          this.checkallapis = false;
        });
      });
    } catch (err) {

    }
  }

  //************************************************************************//
  // Set Master Name
  //************************************************************************//

  focusInMaster(name) {
    this.masterName = name.value;
  }
  focusIn(name) {
    this.masterName = name.value;
  }

  //************************************************************************//
  // Set Worker Name
  //************************************************************************// 


  focusInWorker(workerName) {
    this.masterName = workerName.value;
  }

  newWorkerFocusOut(formValue, workerIndex) {
    let workerForm = formValue;

    // const formData = {
    //   clusterId: this.clusterId,
    //   vmid:  workerForm.get('vmid').value,
    //   ip:  workerForm.get('wIp').value ? workerForm.get('wIp').value.trim() : workerForm.get('wIp').value,
    //   username: workerForm.get('wUsername').value ? workerForm.get('wUsername').value.trim(): workerForm.get('wUsername').value,
    //   password:  workerForm.get('wPassword').value.trim(),
    //   type: 2,
    //   description: workerForm.get('wName').value,
    // };
    const formData = {
      vmid: workerForm.get('vmid').value,
      description: workerForm.get('wName').value,
      clusterId: this.clusterId,
      ip: workerForm.get('wIp').value ? workerForm.get('wIp').value.trim() : workerForm.get('wIp').value,
      username: workerForm.get('wUsername').value ? workerForm.get('wUsername').value.trim() : workerForm.get('wUsername').value,
      password: workerForm.get('wPassword').value.trim(),
      type: 2,
    };

    if (formData.vmid == null) {
      //Add New VM
      //this.worklist[workerIndex - 2].icon = 'fa-check';
      this.logsmsg[workerIndex] = { msg: 'Add worker node', icon: 'loader.gif' };
      this._clusterService.addVm(formData).subscribe(async (res) => {
        this.logsmsg[workerIndex].icon = 'check.png'


        // //this.spinner.hide();
        // this.worklist[index].workerId = res.data._id;
        // this.worklist[index].icon = 'fa-check';
        // //this.worklist[index].isDisable = 'disabled';

        const vmData = {
          cluster_id: this.clusterId,
          worker_vm_id: res.data._id,
        };

        const bar = new Promise(async (resolve, reject) => {

          await this._clusterService.addWorkervm(vmData).subscribe(() => {
            this.pageChanges[workerIndex] = null;
          });
          resolve();

        });

        await bar;
        // const workerapi = await this._clusterService.addWorkervm(vmData);

      }, (err) => {
        this.logsmsg[workerIndex].icon = 'cross.png';
        // this.worklist[index].icon = 'fa-times';
        // this.worklist[index].workerId = null;
        // this.worklist[index].isDisable = 'notdisabled';
        if (err.status === 422) {
          // alert('error');
          // err.error.errors.errors.forEach(element => {
          //   this.errormsg.push({name: element.param , msg: element.msg });

          // });
        } else {
          // this.toastr.error(err.error.message);
        }
      });

    } else {
      const formData = {
        vmid: workerForm.get('vmid').value,
        description: workerForm.get('wName').value,
        clusterId: this.clusterId,
        ip: workerForm.get('wIp').value ? workerForm.get('wIp').value.trim() : workerForm.get('wIp').value,
        username: workerForm.get('wUsername').value ? workerForm.get('wUsername').value.trim() : workerForm.get('wUsername').value,
        password: workerForm.get('wPassword').value.trim(),
        type: 2,
      };
      //Update VM
      this.worklist[workerIndex - 2].icon = 'fa-spin fa-spinner';
      this.logsmsg[workerIndex] = { msg: 'Update worker node name', icon: 'loader.gif' };
      this._clusterService.updateVm(formData).subscribe((res) => {
        this.logsmsg[workerIndex].icon = 'check.png';
        // //this.spinner.hide();
        // this.worklist[index].icon = 'fa-check';
        this.worklist[workerIndex - 2].icon = 'fa-check';
        // //this.worklist[index].isDisable = 'disabled';
        this.pageChanges[workerIndex] = null;
        console.log(this.pageChanges);

      }, (err) => {
        this.logsmsg[workerIndex].icon = 'cross.png';
        // this.worklist[index].icon = 'fa-times';
        this.worklist[workerIndex - 2].icon = 'fa-times';
        // this.worklist[index].workerId = null;
        // this.worklist[index].isDisable = 'notdisabled';
        if (err.status === 422) {

          // alert('error');
          // err.error.errors.errors.forEach(element => {
          //   this.errormsg.push({name: element.param , msg: element.msg });

          // });
        } else {
          // this.toastr.error(err.error.message);
        }
      });
    }
  }

  //************************************************************************//
  // Worker Focus Out
  //************************************************************************//


  workerFocusOut(index) {

    // if(name.value == this.workerName) {
    //   console.log("returned")
    //   return;
    // }
    this.errormsg = [];
    const workerForm = this.clusterForms.controls.workerRows['controls'][index];
    const vmid = workerForm.get('vmid').value;
    const wIp = workerForm.get('wIp').value ? workerForm.get('wIp').value.trim() : workerForm.get('wIp').value;
    workerForm.controls.wIp.markAsTouched();
    workerForm.controls.wName.markAsTouched();
    workerForm.controls.wUsername.markAsTouched();
    workerForm.controls.wPassword.markAsTouched();

    if (workerForm.get('wName').value && workerForm.get('wIp').value && workerForm.get('wUsername').value &&
      workerForm.get('wPassword').value
      && wIp.match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gm)) {

      //this.worklist[index].isDisable = 'disabled';
      const formData = {
        clusterId: this.clusterId,
        vmid: workerForm.get('vmid').value,
        ip: workerForm.get('wIp').value ? workerForm.get('wIp').value.trim() : workerForm.get('wIp').value,
        username: workerForm.get('wUsername').value ? workerForm.get('wUsername').value.trim() : workerForm.get('wUsername').value,
        password: workerForm.get('wPassword').value.trim(),
        type: 2,
        description: workerForm.get('wName').value,
      };

      this.worklist[index].icon = 'fa-spin fa-spinner';


      if (formData.vmid === null) {
        //Add New VM
        this._clusterService.addVm(formData).subscribe(async (res) => {
          //this.spinner.hide();
          this.worklist[index].workerId = res.data._id;
          this.worklist[index].icon = 'fa-check';
          //this.worklist[index].isDisable = 'disabled';

          const vmData = {
            cluster_id: this.clusterId,
            worker_vm_id: res.data._id,
          };

          // this.clusterForms.controls.workerRows[index].controls.
          this.clusterForms.controls.workerRows['controls'][index].controls['vmid'].setValue(res.data._id);
          this.clusterForms.controls.workerRows['controls'][index].controls['newAdded'].setValue(true);
          // this.clusterForms.controls.workerRows[0].controls[index].controls.vmid.setValue(res.data._id);
          // this.clusterForms.controls.workerRows[0].controls[index].controls.newAdded.setValue(true);
          // this.formArr[index].controls.vmid.setValue(res.data._id)
          // this.formArr[index].controls.newAdded.setValue(true);

          // const bar = new Promise(async (resolve, reject) => {
          //   await this._clusterService.addWorkervm(vmData).subscribe(() => { });
          //   resolve();
          // });
          // await bar;
          // const workerapi = await this._clusterService.addWorkervm(vmData);

        }, (err) => {
          // this.worklist[index].icon = 'fa-times';
          this.worklist[index].icon = 'fa-sign-in-alt vm-hitt-icon';
          this.worklist[index].workerId = null;
          this.worklist[index].isDisable = 'notdisabled';
          if (err.status === 422) {
            alert('error');
            err.error.errors.errors.forEach(element => {
              this.errormsg.push({ name: element.param, msg: element.msg });

            });
          } else {
            this.toastr.error(err.error.message);
          }
        });

      } else {
        //Update VM
        this._clusterService.updateVm(formData).subscribe((res) => {
          //this.spinner.hide();
          this.worklist[index].icon = 'fa-check';
          //this.worklist[index].isDisable = 'disabled';

        }, (err) => {
          this.worklist[index].icon = 'fa-times';
          this.worklist[index].workerId = null;
          this.worklist[index].isDisable = 'notdisabled';
          if (err.status === 422) {
            err.error.errors.errors.forEach(element => {
              this.errormsg.push({ name: element.param, msg: element.msg });

            });
          } else {
            this.toastr.error(err.error.message);
          }
        });
      }
    }
  }




  //************************************************************************//
  // Toggle pwd
  //************************************************************************// 

  togglepwd(index, type) {
    if (type === 'worker') {
      this.worklist[index].pwd_type = this.worklist[index].pwd_type === 'text' ? 'password' : 'text';
    } else {
      this.showPwd = this.showPwd === 'text' ? 'password' : 'text';
    }
  }

  //************************************************************************//
  // Add Cluster
  //************************************************************************// 

  async updateCluster(clusterIndex) {

    // this.focusOut(name);
    // this.workerFocusOut(index,name);
    this.errormsg = [];
    this.logsmsg = [];
    this.clusterForms.controls.cName.markAsTouched();

    if (this.clusterForms.get('cName').value) {
      if (this.mnodeId) {
        // if (this.worklist[0].workerId  &&  this.worklist[1].workerId ) {
        if (this.worklist[0].workerId) {

          /* this.modellref = this.modalService.open(this.content,
          { windowClass: 'activation-box animated zoomIn faster', centered: true,  backdrop : 'static',
          keyboard : false});*/

          const formData = {
            clusterid: this.clusterId,
            name: this.clusterForms.get('cName').value,
            master_node: this.mnodeId,
            description: this.clusterForms.get('cName').value,
          };

          this.logsmsg.push({ msg: 'Update cluster name', icon: 'loader.gif' });
          this._clusterService.updateCluster(formData).subscribe(async (res) => {
            this.logsmsg[0].icon = 'check.png';
            const clusterId = res.data._id;
            let i = 1;
            let j = 0;

            const bar = new Promise(async (resolve, reject) => {
              await this.worklist.map(async element => {
                const workerForm = this.clusterForms.controls.workerRows['controls'][j];
                j++;

                // const numFruit = await getNumFruit(fruit)
                // return numFruit
                // })
                // this.worklist.forEach(async (element, index) => {

                try {

                  const vmData = {
                    cluster_id: this.clusterId,
                    worker_vm_id: element.workerId,
                  };
                  // alert('before')
                  // this.logsmsg.push({ msg: 'Add worker ' + workerForm.get('wName').value.trim(), icon: 'loader.gif' });
                  const workerapi = await this._clusterService.addWorkervm(vmData);
                  this.pageChanges[clusterIndex] = null;
                  //log('after',workerapi)
                  // this.logsmsg[i].icon = 'check.png';
                  /* console.log('i', i);
                  this.logsmsg[i].icon = 'fa-check';
                  i++;*/

                } catch (error) {
                  // alert('error')
                  //this.logsmsg[i].icon = 'cross.png';
                  i++;
                  j++;

                }

              });
              this.toastr.success('Updated Successfully.', 'Success!');
            });
            bar.then(() => {
              //this.modellref.close();
              //.router.navigate(['cluster']);
            });
          }, (err) => {
            this.logsmsg[0].icon = 'cross.png';
            if (err.status === 422) {
              alert('error');
              err.error.errors.errors.forEach(element => {
                this.errormsg.push({ name: element.param, msg: element.msg });
              });
            } else {
              this.toastr.error(err.error.message);
            }
          });
          //this.modellref.close();
          //this.router.navigate(['cluster']);
        } else {
          this.toastr.error('At least one worker required for update  cluster');
        }
      } else {
        this.toastr.error('Please enter a valid master Node');
      }
    }
  }

  //************************************************************************//

}
