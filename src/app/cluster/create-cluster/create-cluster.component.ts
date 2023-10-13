import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormArray, FormGroup, Validators } from "@angular/forms";
import { CreateClusterService } from "./create-cluster.service";
import { ApiKeyService } from "./../../api-key/api-key.service";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
declare var bootbox: any;
@Component({
  selector: "app-create-cluster",
  templateUrl: "./create-cluster.component.html",
  styleUrls: ["./create-cluster.component.scss"],
})
export class CreateClusterComponent implements OnInit {
  clusterForm: FormGroup;
  validateVm = "fa-times";
  showPwd = "password";
  worklist = [];
  workerlist = [];
  mnodeId = null;
  isDisable = "notdisabled";
  modellref;
  closeAble = false;
  failApi = false;
  errormsg = [];
  logsmsg = [];
  errorArr = [];
  checkSuccess = [];
  clusterId;
  clusterFormData;
  checkallapis = false;
  masterPreviousPassword = "";
  workerPreviousPassword = [];
  hitAPI = true;
  apiHitIcon = "fa fa-sign-in-alt vm-hitt-icon";
  mIpValid = true;
  @ViewChild("content", { static: false }) private content;
  // tslint:disable-next-line: max-line-length
  constructor(
    private formBuilder: FormBuilder,
    private _createClusterService: CreateClusterService,
    private apiKeyService: ApiKeyService,
    private toastr: ToastrService,
    private router: Router,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.clusterForm = this.formBuilder.group({
      cName: ["", Validators.required],
      mName: ["", Validators.required],
      mIp: [null, Validators.required],
      mUsername: [null, [Validators.required]],
      mPassword: ["", [Validators.required]],
      workerRows: this.formBuilder.array([this.initWorkerRows()]),
    });
    this.worklist.push({
      icon: "fa-times",
      pwd_type: "password",
      workerId: null,
      isDisable: "notdisabled",
    });

    this.workerlist.push({
      icon: "fa fa-sign-in-alt vm-hitt-icon",
      error: false,
    });

    this.apiKeyService.getToken("").then((res) => {
      localStorage.setItem("token", res.data.token);
    });
  }

  //hide Activity Model
  hideActivityModel() {
    this.closeAble = false;
    this.modellref.close();
  }

  initWorkerRows() {
    return this.formBuilder.group({
      wName: ["", Validators.required],
      wIp: [null, Validators.required],
      wPassword: ["", [Validators.required]],
      wUsername: [null, [Validators.required]],
    });
  }

  omit_special_char(event) {
    var k;
    k = event.charCode; //         k = event.keyCode;  (Both can be used)
    if ((k > 96 && k < 123) || k == 8 || k == 45 || (k >= 48 && k <= 57)) {
      return k;
    } else {
      this.toastr.error(
        "Only Alpha-Numeric small characters  and Hyphen (-) are allowed"
      );
      return false;
    }
  }

  get formArr() {
    return this.clusterForm.get("workerRows") as FormArray;
  }

  addNewRow() {
    this.formArr.push(this.initWorkerRows());
    this.worklist.push({
      icon: "fa-times",
      pwd_type: "password",
      workerId: null,
      isDisable: "notdisabled",
    });
    this.workerlist.push({ icon: "fa fa-sign-in-alt vm-hitt-icon" });
  }

  deleteRow(index: number) {
    if (this.clusterForm.controls.workerRows["controls"].length > 1) {
      this.formArr.removeAt(index);
      this.worklist.splice(index, 1);
      this.workerlist.splice(index, 1);
    } else {
      this.toastr.error("Minimum one worker required for create cluster.");
    }
  }

  checkconnection(type, index) {
    if (type === "worker") {
      this.worklist[index].workerId = null;
      this.worklist[index].icon = "fa-sync-alt";
    } else {
      if (this.hitAPI) {
        this.validateVm = "fa-sync-alt";
        this.mnodeId = null;
      }
    }
  }

  trimClusterName(feild) {
    this.clusterForm.controls["cName"].setValue(feild.target.value.trim());
  }

  trimFeild(name, feild) {
    if (name === "mIp" && feild.target.value != "") {
      this.clusterForm.controls[name].setValue(feild.target.value.trim());
      let pattern = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gm;

      if (!this.clusterForm.get("mIp").value.match(pattern)) {
        this.mIpValid = false;
      } else {
        this.mIpValid = true;
      }
      //Validators.pattern()
    } else {
      this.clusterForm.controls[name].setValue(feild.target.value.trim());
    }

    return;

    // Validators.pattern(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gm)
    this.clusterForm.controls[name].setValue(
      feild.target.value.replace(/^\s+|\s+$/gm, "")
    );
  }

  trimWorkers(name, feild, i) {
    let worker = this.clusterForm.controls.workerRows["controls"][i];
    if (name === "wIp" && feild.target.value != "") {
      worker.controls[name].setValue(feild.target.value.trim());
      let pattern = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gm;

      if (!worker.get("wIp").value.match(pattern)) {
        this.workerlist[i].error = true;
      } else {
        // this.mIpValid = true;
        this.workerlist[i].error = false;
      }
      //Validators.pattern()
    } else {
      worker.controls[name].setValue(feild.target.value.trim());
    }
  }

  focusOut() {
    this.clusterForm.controls.mIp.markAsTouched();
    this.clusterForm.controls.mName.markAsTouched();
    this.clusterForm.controls.mUsername.markAsTouched();
    this.clusterForm.controls.mPassword.markAsTouched();
    this.errormsg = [];
    let mIp = this.clusterForm.get("mIp").value;
    if (this.clusterForm.get("mIp").value) {
      mIp = this.clusterForm.get("mIp").value.trim();
    }
    let mName = this.clusterForm.get("mName").value;
    if (this.clusterForm.get("mName").value) {
      mName = this.clusterForm.get("mName").value.trim();
    }
    let mUsername = this.clusterForm.get("mUsername").value;
    if (this.clusterForm.get("mUsername").value) {
      mUsername = this.clusterForm.get("mUsername").value.trim();
    }
    let mPassword = this.clusterForm.get("mPassword").value;
    if (this.clusterForm.get("mPassword").value) {
      mPassword = this.clusterForm.get("mPassword").value.trim();
    }
    if (this.masterPreviousPassword == mPassword) {
      this.hitAPI = false;
      return;
    }
    // this.clusterForm.controls.mIp.markAsTouched();
    // this.clusterForm.controls.mName.markAsTouched();
    // this.clusterForm.controls.mUsername.markAsTouched();
    // this.clusterForm.controls.mPassword.markAsTouched();
    if (
      mName &&
      mIp &&
      mUsername &&
      mPassword &&
      mIp.match(
        /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gm
      )
    ) {
      this.isDisable = "disabled disabled-row";
      const formData = {
        ip: mIp,
        username: mUsername,
        password: mPassword,
        type: 1,
        description: mName,
      };
      this.validateVm = "fa-spin fa-spinner";
      this.apiHitIcon = "fa fa-spinner";
      this._createClusterService.addVm(formData).subscribe(
        (res) => {
          this.mnodeId = res.data._id;
          this.isDisable = "disabled disabled-row";
          this.validateVm = "fa-check";
          this.apiHitIcon = "fa fa-check";
          this.masterPreviousPassword = mPassword;
        },
        (err) => {
          this.validateVm = "fa-times";
          this.apiHitIcon = "fa fa-sync-alt vm-hitt-icon";
          this.mnodeId = null;
          this.isDisable = "notdisabled";
          if (err.status == 0) {
            this.toastr.error("Something went wrong");
            return false;
          }

          if (err.status === 422) {
            err.error.errors.errors.forEach((element) => {
              // this.errormsg.push({ name: element.param, msg: element.msg });
              this.toastr.error(element.msg);
            });
          } else {
            this.toastr.error(err.error.message);
          }
        }
      );
    }
  }

  workerFocusOut(index) {
    this.errormsg = [];
    const workerForm = this.clusterForm.controls.workerRows["controls"][index];
    let wIp = workerForm.get("wIp").value;
    if (workerForm.get("wIp").value) {
      wIp = workerForm.get("wIp").value.trim();
    }
    let wName = workerForm.get("wName").value;
    if (workerForm.get("wName").value) {
      wName = workerForm.get("wName").value.trim();
    }
    let wUsername = workerForm.get("wUsername").value;
    if (workerForm.get("wUsername").value) {
      wUsername = workerForm.get("wUsername").value.trim();
    }
    let wPassword = workerForm.get("wPassword").value;
    if (workerForm.get("wPassword").value) {
      wPassword = workerForm.get("wPassword").value.trim();
    }
    if (this.workerPreviousPassword[index] == wPassword) {
      return;
    }

    workerForm.controls.wIp.markAsTouched();
    workerForm.controls.wName.markAsTouched();
    workerForm.controls.wUsername.markAsTouched();
    workerForm.controls.wPassword.markAsTouched();
    if (
      wName &&
      wIp &&
      wUsername &&
      wPassword &&
      wIp.match(
        /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gm
      )
    ) {
      this.worklist[index].isDisable = "disabled disabled-row";
      const formData = {
        ip: wIp,
        username: wUsername,
        password: wPassword,
        type: 2,
        description: workerForm.get("wName").value,
      };
      this.worklist[index].icon = "fa-spin fa-spinner";
      this.workerlist[index].icon = "fa fa-spin fa-spinner";
      this._createClusterService.addVm(formData).subscribe(
        (res) => {
          // this.spinner.hide();
          this.worklist[index].workerId = res.data._id;
          this.worklist[index].icon = "fa-check";
          this.workerlist[index].icon = "fa fa-check";
          this.worklist[index].isDisable = "disabled disabled-row";
          this.workerPreviousPassword[index] = wPassword;
        },
        (err) => {
          this.worklist[index].icon = "fa-times";
          this.workerlist[index].icon = "fa fa-sync-alt vm-hitt-icon";
          this.worklist[index].workerId = null;
          this.worklist[index].isDisable = "notdisabled";
          if (err.status == 0) {
            this.toastr.error("Something went wrong");
            return false;
          }
          if (err.status === 422) {
            err.error.errors.errors.forEach((element) => {
              this.errormsg.push({ name: element.param, msg: element.msg });
              this.toastr.error(element.msg);
            });
          } else {
            this.toastr.error(err.error.message);
          }
        }
      );
    }
  }

  togglepwd(index, type) {
    if (type === "worker") {
      this.worklist[index].pwd_type =
        this.worklist[index].pwd_type === "text" ? "password" : "text";
    } else {
      this.showPwd = this.showPwd === "text" ? "password" : "text";
    }
  }

  async createClusterPromise(vmData, i, name) {
    this.closeAble = false;
    this.checkallapis = false;
    this.failApi = false;
    this.logsmsg[i] = {
      msg: "Setting up worker node :" + " " + name,
      icon: "loader.gif",
      index: 4,
      data: vmData,
      loopIndex: i,
      workerName: name,
    };
    return new Promise(async (resolve, reject) => {
      try {
        let apiRes = await this._createClusterService.addWorkervm(vmData);
        this.logsmsg[i].icon = "check.png";
        this.errorArr.pop();
        this.checkSuccess.pop();
        if (!this.checkSuccess.length) {
          ///Just  uncomment lines if you run kubernetes cluster dashboard api
          let loops = i + 1;
          this.logsmsg[loops] = {
            msg: "Create dashBoard URL for kubernetes cluster.",
            icon: "loader.gif",
            index: 5,
            data: this.clusterId,
            loopIndex: loops,
          };
          this.setupDashBoardApi(loops);
          //Hide redirect code if you run kubernetes cluster dashboard api
          // this.checkallapis = true;
          // this.closeAble = true;
          // setTimeout(() => {
          //   this.modellref.close();
          //   this.router.navigate(["cluster"]);
          // }, 3000);
        }
        resolve(apiRes);
      } catch (error) {
        this.errorArr.push(1);
        this.logsmsg[i].icon = "refresh.png";
        this.logsmsg[i].success = "no";
        this.checkallapis = false;
        this.failApi = true;
        if (error.status == 0) {
          this.toastr.error("Something went wrong");
          return false;
        } else {
          this.toastr.error(error.error.message);
        }

        reject(error);
      }
    });
  }

  async rehitApi(data, index, loopIndex, name) {
    if (index == 2) {
      await this.clusterApi();
      await this.masterApi();
      // await this.createClusterPromise(data, loopIndex, name);
      // this.checkallapis = true;
      // this.closeAble = true;
      // const self = this;
      // setTimeout(function () {
      //   self.modellref.close();
      //   self.router.navigate(['cluster']);
      // }, 3000);
    }
    if (index == 3) {
      await this.masterApi();
    }
    if (index == 4) {
      this.closeAble = false;
      this.failApi = false;
      await this.createClusterPromise(data, loopIndex, name);
      // this.checkallapis = true;
      // this.closeAble = true;
      // const self = this;
      // setTimeout(function () {
      //   self.modellref.close();
      //   self.router.navigate(['cluster']);
      // }, 3000);
    }
    if (index == 5) {
      this.logsmsg[loopIndex].icon = "loader.gif";
      this.setupDashBoardApi(loopIndex);
    }
  }

  async addCluster() {
    for (const c of Object.keys(this.clusterForm.controls)) {
      this.clusterForm.controls[c].markAsTouched();
    }
    //console.log('dsds', this.clusterForm.controls.workerRows['controls']);

    for (const c of Object.keys(
      this.clusterForm.controls.workerRows["controls"]
    )) {
      // console.log(this.clusterForm.controls.workerRows['controls'][c].controls);

      // this.clusterForm.controls.workerRows['controls'][c].markAsTouched();
      for (const a of Object.keys(
        this.clusterForm.controls.workerRows["controls"][c].controls
      )) {
        this.clusterForm.controls.workerRows["controls"][c].controls[
          a
        ].markAsTouched();
      }
    }

    if (this.clusterForm.invalid) {
      return false;
    }

    this.errormsg = [];
    this.logsmsg = [];
    this.closeAble = false;
    this.failApi = false;
    this.clusterForm.controls.cName.markAsTouched();
    if (this.clusterForm.get("cName").value) {
      if (this.mnodeId) {
        if (this.worklist[0].workerId) {
          this.modellref = this.modalService.open(this.content, {
            windowClass: "activation-box animated zoomIn faster",
            centered: true,
            backdrop: "static",
            keyboard: false,
          });

          this.clusterFormData = {
            name: this.clusterForm.get("cName").value,
            master_node: this.mnodeId,
            description: this.clusterForm.get("cName").value,
          };

          this.logsmsg.push({
            msg: "Save cluster information.",
            icon: "loader.gif",
            index: 2,
            data: "text",
            loopIndex: 0,
            workerName: "name",
          });
          await this.clusterApi();

          //Master Api
          this.logsmsg.push({
            msg: "Create master node on kubernetes cluster.",
            icon: "loader.gif",
            index: 3,
            data: "text",
            loopIndex: 0,
            workerName: name,
          });
          this.masterApi();
        } else {
          this.toastr.error("At least one worker required for create  cluster");
        }
      } else {
        // this.toastr.error('Please enter a valid master Node');
      }
    }
  }

  clusterApi() {
    this.logsmsg[0] = {
      msg: "Save cluster information.",
      icon: "loader.gif",
      index: 2,
      data: "text",
      loopIndex: 0,
      workerName: "name",
    };
    return new Promise(async (resolve, reject) => {
      this._createClusterService.addCluster(this.clusterFormData).subscribe(
        async (res) => {
          this.logsmsg[0].icon = "check.png";
          this.clusterId = res.data._id;
          resolve();
        },
        (err) => {
          this.logsmsg[0].icon = "refresh.png";
          this.logsmsg[0].success = "no";
          this.closeAble = true;
          this.failApi = true;
          reject();
          if (err.status == 0) {
            this.toastr.error("Something went wrong");
            return false;
          }

          if (err.status === 422) {
          } else {
            this.toastr.error(err.error.message);
          }
        }
      );
    });
  }

  masterApi() {
    this.closeAble = false;
    this.failApi = false;
    this.logsmsg[1] = {
      msg: "Create master node on kubernetes cluster.",
      icon: "loader.gif",
      index: 3,
      data: "text",
      loopIndex: 0,
      workerName: "name",
    };
    return new Promise(async (resolve, reject) => {
      await this._createClusterService
        .setupMaster(this.clusterId)
        .then(async (response) => {
          this.logsmsg[1].icon = "check.png";

          //Worker Api
          this.workerApi();

          resolve();
        })
        .catch((error) => {
          this.logsmsg[1].icon = "refresh.png";
          this.logsmsg[1].success = "no";
          this.failApi = true;

          this.closeAble = true;
          reject();
          if (error.status == 0) {
            this.toastr.error("Something went wrong");
            return false;
          }
          this.toastr.error(error.error.message);
          throw new Error();
        });
    });
  }

  async workerApi() {
    let i = 2;
    let j = 0;
    let promiseArray = [];
    for (let iterate = 0; iterate < this.worklist.length; iterate++) {
      this.checkSuccess.push(1);
      const workerForm = this.clusterForm.controls.workerRows["controls"][j];
      // this.logsmsg.push({ msg: 'Setting up worker node: ' + workerForm.get('wName').value.trim() + '.', icon: 'loader.gif', index: 4 ,data:});
      j++;
      try {
        const vmData = {
          cluster_id: this.clusterId,
          worker_vm_id: this.worklist[iterate].workerId,
        };
        let name = workerForm.get("wName").value.trim();
        this.logsmsg.push({
          msg: "Setting up worker node: " + " " + name + ".",
          icon: "loader.gif",
          index: 4,
          data: vmData,
          loopIndex: i,
          workerName: "name",
        });
        promiseArray.push(this.createClusterPromise(vmData, i, name));
        i++;
      } catch (error) {
        i++;
        this.logsmsg[i].icon = "cross.png";
        this.closeAble = true;
        this.failApi = true;
      }
    }
    await Promise.all(promiseArray);

    // if (!this.errorArr.length) {
    //   this.checkallapis = true;
    //   this.closeAble = true;
    //   const self = this;
    //   setTimeout(function () {
    //     self.modellref.close();
    //     self.router.navigate(['cluster']);
    //   }, 3000);
    // }
  }

  setupDashBoardApi(loopIndex) {
    this.closeAble = false;
    this.failApi = false;

    return new Promise(async (resolve, reject) => {
      await this._createClusterService
        .setupDashBoard(this.clusterId)
        .then(async (response) => {
          this.logsmsg[loopIndex].icon = "check.png";
          resolve();
          this.checkallapis = true;
          this.closeAble = true;
          setTimeout(() => {
            this.modellref.close();
            this.router.navigate(["cluster"]);
          }, 3000);
        })
        .catch((error) => {
          this.errorArr.push(1);
          this.logsmsg[loopIndex].icon = "refresh.png";
          this.logsmsg[loopIndex].success = "no";
          this.failApi = true;
          this.closeAble = true;
          reject();
          if (error.status == 0) {
            this.toastr.error("Something went wrong");
            return false;
          } else {
            this.toastr.error(error.error.message);
          }
          throw new Error();
        });
    });
  }
}
