import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";

import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ClusterService } from "src/app/cluster/cluster.service";
import { NetworkService } from "src/app/network/network.service";
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { IpcCommunicationService } from "../../ipc-communication.service";

declare var $: any;

@Component({
  selector: "app-network-cluster-list",
  templateUrl: "./network-cluster-list.component.html",
  styleUrls: ["./network-cluster-list.component.scss"],
})
export class NetworkClusterListComponent implements OnInit, AfterViewInit {
  cancel_btn = false;
  save_btn = false;
  add_more_btn = true;
  select_box = false;
  closeAble = false;
  checkallapis = false;
  errorArr = [];
  failApi = false;
  networkClusterForm: FormGroup;
  @Input() id: string;
  @Input() maxSize: number;
  @Output() pageChange: EventEmitter<number>;
  @Output() pageBoundsCorrection: EventEmitter<number>;
  modellref;
  invalidAccessModel;
  incrementLogs: number = 0;
  showErrorBtn = false;
  records = [];
  networkClusterIds = [];
  networkId;
  allClusters = [];
  ClusterArray = [];
  clusterNames = [];
  logsmsg = [];
  public loading: boolean = false;
  p;

  @ViewChild("content", { static: false }) private content;
  @ViewChild("invalidAccess", { static: false }) private invalidAccess;
  constructor(
    private modalService: NgbModal,
    private clusterService: ClusterService,
    private networkService: NetworkService,
    private formBuilder: FormBuilder,
    private Router: Router,
    private toastr: ToastrService,
    private httpClient: HttpClient,
    private ipcCommunicationService: IpcCommunicationService
  ) {}

  ngOnInit() {
    if (localStorage.getItem("netWorkId") != null) {
      this.networkId = localStorage.getItem("netWorkId");
      this.getNetworkClusterList(this.networkId);
    }
    this.networkClusterFormFeilds();
  }

  showInvaildAccessModal() {
    this.invalidAccessModel = this.modalService.open(this.invalidAccess, {
      windowClass: "activation-box invalid-access-box animated zoomIn faster",
      centered: true,
      backdrop: "static",
      keyboard: false,
    });
  }

  goToNetworkList() {
    this.invalidAccessModel.close();
    this.Router.navigate(["/network"]);
  }

  networkClusterFormFeilds() {
    this.networkClusterForm = this.formBuilder.group({
      networkid: [this.networkId, Validators.required],
      cluster_id: [" ", Validators.required],
    });
  }

  addSelectBox() {
    this.select_box = true;
    this.add_more_btn = false;
    this.cancel_btn = true;
    this.getAllClusterList();
    ///$('#cluster_id').chosen();
  }

  deleteSelectBox() {
    this.select_box = false;
    this.add_more_btn = true;
    this.cancel_btn = false;
    $("#cluster_id").chosen("destroy");
  }

  getAllClusterList() {
    this.allClusters = [];
    this.clusterNames = [];
    let self = this;
    this.clusterService.getCluster().subscribe((res) => {
      res.data.forEach((element) => {
        if (!this.networkClusterIds.includes(element._id)) {
          this.allClusters.push(element);
          if (this.allClusters.length) {
            $(document).ready(() => {
              $("#cluster_id").chosen("destroy");
              $("#cluster_id").chosen({
                placeholder_text_multiple: "Select Cluster",
              });
              $(".chosen-search-input").css({
                "min-width": "max-content",
              });
              $("#cluster_id")
                .chosen()
                .change((event) => {
                  let clusters = [];

                  for (const i of Object.keys(
                    $("#cluster_id").chosen().val()
                  )) {
                    clusters.push(
                      $("#cluster_id")
                        .chosen()
                        .val()
                        [i].split(":")[1]
                        .trim()
                        .split("'")[1]
                    );
                  }

                  let selectedPeers = $("#cluster_id option:selected");
                  self.clusterNames = $.map(selectedPeers, function (
                    selectedPeers
                  ) {
                    return selectedPeers.text;
                  });

                  this.networkClusterForm.patchValue({ cluster_id: clusters });
                  if (this.networkClusterForm.value.cluster_id.length) {
                    this.save_btn = true;
                    this.cancel_btn = false;
                  } else {
                    this.save_btn = false;
                    this.cancel_btn = true;
                  }
                });
            });
          }
        }
        if (!this.allClusters.length) {
          $(document).ready(() => {
            $("#cluster_id").chosen("destroy");
            $("#cluster_id").chosen({
              placeholder_text_multiple: "No more Cluster to Add",
            });
            $(".chosen-search-input").css({
              "min-width": "140px",
            });
          });
        }
      });
    });
  }

  getNetworkClusterList(networkId) {
    this.networkService.networkInfo(networkId).subscribe(
      (res) => {
        this.records = res.data.cluster;
        this.records.forEach((element) => {
          this.networkClusterIds.push(element._id);
        });
      },
      (error) => {
        this.showInvaildAccessModal();
      }
    );
  }

  rehitApi(index, data, loopIndex, clusterName) {
    this.closeAble = false;
    this.checkallapis = false;
    this.failApi = false;
    if (index == 2) {
      this.logsmsg[loopIndex] = {
        msg: "Add Cluster to Network " + clusterName,
        icon: "loader.gif",
        index: 2,
        data: data,
        loopIndex: loopIndex,
        clusterName: clusterName,
      };

      this.addClusterToNetworkApi(data, loopIndex);
    }
  }

  async addCluster() {
    try {
      this.logsmsg = [];
      this.incrementLogs = 0;
      this.closeAble = false;
      this.checkallapis = false;
      this.failApi = false;
      this.modalPopUp();
      let clusters = this.networkClusterForm.value.cluster_id;
      for (let a = 0; a < clusters.length; a++) {
        this.errorArr.push(1);
        let clusterName = this.clusterNames[a];
        this.ClusterArray.push(
          this.addMultiNetwork(clusters[a], a, clusterName)
        );
      }
      let waitForRes = await Promise.all(this.ClusterArray);
      $("#cluster_id").chosen("destroy");
      this.getNetworkClusterList(this.networkId);
      this.save_btn = false;
      this.select_box = false;
      this.add_more_btn = true;
      this.cancel_btn = false;
      this.checkallapis = true;
      this.select_box = false;
      this.add_more_btn = true;
      this.cancel_btn = false;
      $("#cluster_id").chosen("destroy");
      setTimeout(() => {
        this.modellref.close();
        this.Router.navigate(["/inner-sidebar/cluster-list/"]);
      }, 2000);
    } catch (error) {
      this.showErrorBtn = true;
      this.closeAble = true;
    }
  }

  addMultiNetwork(clusterId, a, clusterName) {
    return new Promise(async (resolve, reject) => {
      let addCulster = {
        networkid: this.networkClusterForm.value.networkid,
        cluster_id: clusterId,
      };
      this.logsmsg.push({
        msg: "Add Cluster to Network " + clusterName,
        icon: "loader.gif",
        index: 2,
        data: addCulster,
        loopIndex: this.incrementLogs,
        clusterName: clusterName,
      });
      this.addClusterToNetworkApi(addCulster, this.incrementLogs);
      this.incrementLogs++;
    });
  }
  addClusterToNetworkApi(addCulster, loopIndex) {
    return new Promise(async (resolve, reject) => {
      let addNetworkToCluster = await this.networkService
        .addClusterToNetwork(addCulster)
        .catch((error) => {
          if (!error.error.message) {
            this.toastr.error("Something Went Wrong");
          } else {
            this.toastr.error(error.error.message);
          }
          this.logsmsg[loopIndex].icon = "refresh.png";
          this.logsmsg[loopIndex].success = "no";
          this.showErrorBtn = true;
          this.closeAble = true;
          this.failApi = true;
          reject();
          throw new Error();
        });
      this.errorArr.pop();
      this.logsmsg[loopIndex].icon = "check.png";
      if (!this.errorArr.length) {
        this.cancel_btn = false;
        this.checkallapis = true;
        setTimeout(() => {
          this.modellref.close();
          this.Router.navigate(["/inner-sidebar/cluster-list/"]);
        }, 2000);
        this.getNetworkClusterList(this.networkId);
        this.deleteSelectBox();
        this.save_btn = false;
        this.select_box = false;
        this.add_more_btn = true;
        this.cancel_btn = false;
        resolve();
      }
    });
  }
  modalPopUp() {
    this.modellref = this.modalService.open(this.content, {
      windowClass: "activation-box animated zoomIn faster",
      centered: true,
      backdrop: "static",
      keyboard: false,
    });
  }

  hideActivityModel() {
    this.closeAble = false;
    this.modellref.close();
  }

  ngAfterViewInit() {
    if (localStorage.getItem("netWorkId") == null) {
      this.showInvaildAccessModal();
    }
  }

  open(content) {
    this.modalService.open(content, {
      windowClass: "activation-box",
      centered: true,
    });
  }

  reDirect(clusterId: string): void {
    this.loading = true;
    let data = {
      clusterId: clusterId,
    };
    this.clusterService.setSshTunnelDashboard(data).subscribe(
      (res) => {
        this.loading = false;
        if (res.dashboard_url) {
          this.ipcCommunicationService.openUrlInElectron(res.dashboard_url);
        } else {
          this.toastr.error("Kubernates dashboard URL not found");
        }
      },
      (error) => {
        this.loading = false;
        this.toastr.error(error.error.message);
      }
    );
  }
}
