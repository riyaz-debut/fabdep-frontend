import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import { CaService } from "./../../inner-sidebar/ca/ca.service";
import { CommonService } from "./../../inner-sidebar/common.service";
import { NetworkService } from "./../network.service";
import { ToastrService } from "ngx-toastr";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { promise } from "protractor";
import { ApiKeyService } from "./../../api-key/api-key.service";
declare var $: any;

@Component({
  selector: "app-create-network",
  templateUrl: "./create-network.component.html",
  styleUrls: ["./create-network.component.scss"],
})
export class CreateNetworkComponent implements OnInit, AfterViewInit {
  tokenFromUI: string = "0123456789123456";

  constructor(
    private formBuilder: FormBuilder,
    private caService: CaService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private Router: Router,
    private commonService: CommonService,
    private networkService: NetworkService,
    private apiKeyService: ApiKeyService
  ) {}

  caForm: FormGroup;
  submitted: false;
  specialCharErr = false;
  pwdShow = false;
  clusters;
  clusterValue;
  clusterNewValue;
  modellref;
  clusterName = [];
  errorArr = [];
  closeAble = false;
  incrementLogs: number = 0;
  NetworkIndexing: number = 0;
  success;
  caId;
  // getNetworkId;
  networkData;
  ClusterArray = [];
  networkId;
  showErrorBtn = false;
  isDisable = "notdisabled";
  logsmsg = [];
  @ViewChild("content", { static: false }) private content;

  ngOnInit() {
    //  this.getParamId();
    localStorage.removeItem("netWorkId");
    this.getClusters();
    this.caFormFields();
    this.apiKeyService.getToken("").then((res) => {
      localStorage.setItem("token", res.data.token);
    });
  }

  ngAfterViewInit() {
    let self = this;
    self.clusterName = [];
    $("#clusterDropDown")
      .chosen({ max_selected_options: 3 })
      .change((event) => {
        this.caForm.patchValue({
          cluster: $("#clusterDropDown").chosen().val(),
        });
        // self.getOperators();
        let clusterNames = $("#clusterDropDown option:selected");
        self.clusterName = $.map(clusterNames, function (clusterNames) {
          return clusterNames.text;
        });
      });
  }

  get basePath() {
    return this.caForm.controls;
  }

  getClusters() {
    let app = this;
    this.caService.getClusters().subscribe((response) => {
      app.clusters = response.data;

      $("#clusterDropDown").chosen("destroy");
      $(document).ready(function () {
        $("#clusterDropDown").chosen({
          no_results_text: "Ordering Service not found!",
        });
      });
    });
  }

  //hide Activity Model
  hideActivityModel() {
    this.closeAble = false;
    this.showErrorBtn = false;
    this.modellref.close();
  }

  caFormFields() {
    this.caForm = this.formBuilder.group({
      name: ["", Validators.required],
      isTLS: ["1", Validators.required],
      cluster: ["", Validators.required],
      networkName: ["", Validators.required],
      networkId: [""],
      admnId: ["", Validators.required],
      admnSecret: ["", Validators.required],
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

  async rehitApi(index, data, name, clusterId, loopIndex) {
    this.closeAble = false;
    this.showErrorBtn = false;
    if (index == 1) {
      await this.addNetwork();
      await this.addClusterToNetworkApi(data, clusterId, loopIndex);
      await this.addCa();
      await this.serviceCa();
      await this.caDeployement();
      await this.fetchTls();
      await this.writeConnection();
      await this.enrollApi();
    }
    if (index == 8) {
      this.logsmsg[loopIndex] = {
        msg: "Adding cluster:" + name,
        icon: "loader.gif",
        index: 8,
        data: data,
        name: name,
        clusterId: clusterId,
        loopIndex: loopIndex,
      };
      await this.addClusterToNetworkApi(data, clusterId, loopIndex);
      await this.addCa();
      await this.serviceCa();
      await this.caDeployement();
      await this.fetchTls();
      await this.writeConnection();
      await this.enrollApi();
    }
    if (index == 2) {
      await this.addCa();
      await this.serviceCa();
      await this.caDeployement();
      await this.fetchTls();
      await this.writeConnection();
      await this.enrollApi();
    }
    if (index == 3) {
      await this.serviceCa();
      await this.caDeployement();
      await this.fetchTls();
      await this.writeConnection();
      await this.enrollApi();
    }
    if (index == 4) {
      await this.caDeployement();
      await this.fetchTls();
      await this.writeConnection();
      await this.enrollApi();
    }
    if (index == 5) {
      await this.fetchTls();
      await this.writeConnection();
      await this.enrollApi();
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
    let self = this;
    this.ClusterArray = [];
    this.incrementLogs = 0;
    this.NetworkIndexing = 0;
    this.clusterNewValue;
    this.caForm.controls.name.setValue(this.caForm.value.networkName);

    this.caForm.controls["networkName"].setValue(
      this.caForm.controls["networkName"].value.trim()
    );
    this.caForm.controls["admnId"].setValue(
      this.caForm.controls["admnId"].value.trim()
    );
    this.caForm.controls["admnSecret"].setValue(
      this.caForm.controls["admnSecret"].value.trim()
    );

    //this.submitted = true;
    this.closeAble = false;
    for (const c of Object.keys(this.caForm.controls)) {
      this.caForm.controls[c].markAsTouched();
    }

    if (this.caForm.invalid) {
      return;
    }

    this.logsmsg = [];
    this.incrementLogs = 0;
    this.closeAble = false;
    this.showErrorBtn = false;

    try {
      this.modalPopUp();

      this.logsmsg.push({
        msg: "Network installation",
        icon: "loader.gif",
        index: 1,
      });
      await this.addNetwork();

      this.clusterValue = this.caForm.controls["cluster"].value;
      for (let a = 0; a < this.clusterValue.length; a++) {
        this.errorArr.push(1);
        this.ClusterArray.push(this.addMultiNetwork(this.clusterValue[a], a));
        this.incrementLogs++;
      }
      let resArray = await Promise.all(this.ClusterArray);

      await this.addCa();

      this.logsmsg.push({
        msg:
          "Creating kubernetes service for TLS-CA (Regstrar) of " +
          this.caForm.value.networkName +
          ".",
        icon: "loader.gif",
        index: 3,
        loopIndex: this.incrementLogs,
      });
      await this.serviceCa();

      this.logsmsg.push({
        msg: " Creating kubernetes deployment for TLS - CA(Registrar).",
        icon: "loader.gif",
        index: 4,
      });
      await this.caDeployement();

      this.logsmsg.push({
        msg: "Downloading TLS-CA (Registrar) certificates.",
        icon: "loader.gif",
        index: 5,
      });
      await this.fetchTls();

      this.logsmsg.push({
        msg: "Write connection configurations.",
        icon: "loader.gif",
        index: 6,
      });
      await this.writeConnection();

      this.logsmsg.push({
        msg: "Enroll TLS-CA (Registrar).",
        icon: "loader.gif",
        index: 7,
      });
      await this.enrollApi();
    } catch (error) {
      console.log(" error ");
      self.showErrorBtn = true;
      self.closeAble = true;
    }
  }
  modalPopUp() {
    this.modellref = this.modalService.open(this.content, {
      windowClass: "activation-box animated zoomIn faster",
      centered: true,
      backdrop: "static",
      keyboard: false,
    });
  }

  addMultiNetwork(clusterId, a) {
    return new Promise(async (resolve, reject) => {
      let addCulster = {
        networkid: this.caForm.controls["networkId"].value,
        cluster_id: clusterId,
      };
      this.logsmsg.push({
        msg: "Adding cluster:" + this.clusterName[a],
        icon: "loader.gif",
        index: 8,
        data: addCulster,
        name: this.clusterName[a],
        clusterId: clusterId,
        loopIndex: this.incrementLogs,
      });

      this.addClusterToNetworkApi(addCulster, clusterId, this.incrementLogs);
    });
  }

  addClusterToNetworkApi(addCulster, clusterId, loopIndex) {
    return new Promise(async (resolve, reject) => {
      let addNetworkToCluster = await this.networkService
        .addClusterToNetwork(addCulster)
        .catch((error) => {
          this.logsmsg[loopIndex].icon = "refresh.png";
          this.logsmsg[loopIndex].success = "no";
          this.toastr.error(error.error.message);
          this.showErrorBtn = true;
          this.closeAble = true;
          reject();
          throw new Error();
        });
      if (this.clusterNewValue == "" || this.clusterNewValue == undefined) {
        this.clusterNewValue = clusterId;
      }
      this.logsmsg[loopIndex].icon = "check.png";
      this.errorArr.pop();
      if (!this.errorArr.length) {
        await this.addCa();
        await this.serviceCa();
        await this.caDeployement();
        await this.fetchTls();
        await this.writeConnection();
        await this.enrollApi();
        resolve();
      }
    });
  }

  addNetwork() {
    return new Promise(async (resolve, reject) => {
      await this.caService
        .addNetwork(this.caForm)
        .then((response) => {
          this.caForm.patchValue({ networkId: response.data._id });
          this.logsmsg[this.incrementLogs].icon = "check.png";
          this.incrementLogs++;
          this.clusterValue = this.caForm.controls["cluster"].value;
          resolve();
        })
        .catch((error) => {
          console.log(error);

          this.toastr.error(error.error.message);
          this.logsmsg[this.incrementLogs].icon = "refresh.png";
          this.logsmsg[this.incrementLogs].success = "no";
          this.showErrorBtn = true;
          this.closeAble = true;
          reject();
          throw new Error();
        });
    });
  }

  addCa() {
    this.closeAble = false;
    this.showErrorBtn = false;
    this.logsmsg[this.incrementLogs] = {
      msg: "CA (Registrar) installation.",
      icon: "loader.gif",
      index: 2,
    };
    return new Promise(async (resolve, reject) => {
      let addCaData = {
        name: this.caForm.controls["name"].value + "-tlsca",
        networkId: this.caForm.controls["networkId"].value,
        clusterId: this.clusterNewValue,
        admnId: this.caForm.controls["admnId"].value,
        admnSecret: this.caForm.controls["admnSecret"].value,
        isTLS: this.caForm.controls["isTLS"].value,
      };
      let addCaResponse = await this.caService
        .addCa(addCaData)
        .catch((error) => {
          this.toastr.error(error.error.message);
          this.logsmsg[this.incrementLogs].icon = "refresh.png";
          this.logsmsg[this.incrementLogs].success = "no";
          this.closeAble = true;
          this.showErrorBtn = true;
          reject();
          throw new Error();
        });

      this.logsmsg[this.incrementLogs].icon = "check.png";
      this.incrementLogs++;
      this.caId = { caId: addCaResponse.data._id };
      resolve();
    });
  }

  serviceCa() {
    this.closeAble = false;
    this.showErrorBtn = false;
    this.logsmsg[this.incrementLogs] = {
      msg:
        "Creating kubernetes service for TLS-CA (Regstrar) of " +
        this.caForm.value.networkName +
        ".",
      icon: "loader.gif",
      index: 3,
    };
    return new Promise(async (resolve, reject) => {
      let caServiceResponse = await this.caService
        .createCaService(this.caId)
        .catch((error) => {
          this.toastr.error(error.error.message);
          this.logsmsg[this.incrementLogs].icon = "refresh.png";
          this.logsmsg[this.incrementLogs].success = "no";
          this.closeAble = true;
          this.showErrorBtn = true;
          reject();
          throw new Error();
        });
      this.logsmsg[this.incrementLogs].icon = "check.png";
      this.incrementLogs++;
      resolve();
    });
  }

  caDeployement() {
    this.closeAble = false;
    this.showErrorBtn = false;
    this.logsmsg[this.incrementLogs] = {
      msg: " Creating kubernetes deployment for TLS - CA(Registrar).",
      icon: "loader.gif",
      index: 4,
    };
    return new Promise(async (resolve, reject) => {
      let caDeploymentResponse = await this.caService
        .CreateCaDeployment(this.caId)
        .catch((error) => {
          this.toastr.error(error.error.message);
          this.logsmsg[this.incrementLogs].icon = "refresh.png";
          this.logsmsg[this.incrementLogs].success = "no";
          this.closeAble = true;
          this.showErrorBtn = true;
          reject();
          throw new Error();
        });
      setTimeout(async () => {
        this.logsmsg[this.incrementLogs].icon = "check.png";
        this.incrementLogs++;
        resolve();
      }, 30000);
    });
  }

  fetchTls() {
    this.closeAble = false;
    this.showErrorBtn = false;
    this.logsmsg[this.incrementLogs] = {
      msg: "Downloading TLS-CA (Registrar) certificates.",
      icon: "loader.gif",
      index: 5,
    };
    return new Promise(async (resolve, reject) => {
      let fetchCaTlsCertificatesResponse = await this.caService
        .fetchCaTlsCertificatesFromNFS(this.caId)
        .catch((error) => {
          this.toastr.error("something went wrong");
          this.logsmsg[this.incrementLogs].icon = "refresh.png";
          this.logsmsg[this.incrementLogs].success = "no";
          this.closeAble = true;
          this.showErrorBtn = true;
          reject();
          throw new Error();
        });
      if (fetchCaTlsCertificatesResponse.status == 0) {
        this.logsmsg[this.incrementLogs].icon = "refresh.png";
        this.logsmsg[this.incrementLogs].success = "no";
        this.toastr.error("something went wrong");
        this.showErrorBtn = true;
        this.closeAble = true;
        reject();
        throw new Error();
      }
      this.logsmsg[this.incrementLogs].icon = "check.png";
      this.incrementLogs++;
      resolve();
    });
  }

  writeConnection() {
    this.closeAble = false;
    this.showErrorBtn = false;
    this.logsmsg[this.incrementLogs] = {
      msg: "Write connection configurations.",
      icon: "loader.gif",
      index: 6,
    };
    return new Promise(async (resolve, reject) => {
      let connectionConfigsResponse = await this.caService
        .writeConnectionConfigs(this.caId)
        .catch((error) => {
          this.logsmsg[this.incrementLogs].icon = "refresh.png";
          this.logsmsg[this.incrementLogs].success = "no";
          this.toastr.error("something went wrong");
          this.closeAble = true;
          this.showErrorBtn = true;
          reject();
          throw new Error();
        });
      this.logsmsg[this.incrementLogs].icon = "check.png";
      this.incrementLogs++;
      resolve();
    });
  }

  enrollApi() {
    this.closeAble = false;
    this.showErrorBtn = false;
    let self = this;
    this.logsmsg[this.incrementLogs] = {
      msg: "Enroll TLS-CA (Registrar).",
      icon: "loader.gif",
      index: 7,
    };
    return new Promise(async (resolve, reject) => {
      let enrollResponse = await this.caService
        .enrollRegistrar(this.caId)
        .catch((error) => {
          this.logsmsg[this.incrementLogs].icon = "refresh.png";
          this.logsmsg[this.incrementLogs].success = "no";
          this.toastr.error("something went wrong");
          this.closeAble = true;
          this.showErrorBtn = true;
          reject();
          throw new Error();
        });
      this.logsmsg[this.incrementLogs].icon = "check.png";
      this.incrementLogs++;
      this.success = true;
      this.closeAble = true;
      localStorage.setItem(
        "netWorkId",
        this.caForm.controls["networkId"].value
      );
      setTimeout(function () {
        self.modellref.close();
        self.Router.navigate(["inner-sidebar/ca"]);
      }, 2000);
      resolve();
    });
  }
}
