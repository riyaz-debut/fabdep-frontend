import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnChanges,
} from "@angular/core";
import {
  FormBuilder,
  FormArray,
  FormGroup,
  Validators,
  FormControl,
} from "@angular/forms";
import { ChannelService } from "./../channel.service";
import { ApiKeyService } from "./../../../api-key/api-key.service";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";
import { async } from "q";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { OrderingService } from "./../../ordering-service/ordering.service";
declare var $: any;

@Component({
  selector: "app-create-channel",
  templateUrl: "./create-channel.component.html",
  styleUrls: ["./create-channel.component.scss"],
})
export class CreateChannelComponent implements OnInit, AfterViewInit {
  channelForm: FormGroup;
  orderingServices;
  peersData;
  channelId;
  data;
  operators;
  failApi = false;
  modellref;
  invalidAccessModel;
  new_operator;
  increment: number = 0;
  logsmsg = [];
  errorArr = [];
  checkallapis = false;
  closeAble = true;
  peerNames = [];
  peersOrgData = [];
  selectedPeersOrgData = [];
  peerArray = [];
  updateOrdererHostArray = [];
  updatePeerHostsArray = [];
  @ViewChild("content", { static: false }) private content;
  @ViewChild("invalidAccess", { static: false }) private invalidAccess;

  constructor(
    private formBuilder: FormBuilder,
    private Router: Router,
    private channelService: ChannelService,
    private orderingService: OrderingService,
    private apiKeyService: ApiKeyService,
    private toastr: ToastrService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.channelForm = this.formBuilder.group({
      name: ["", Validators.required],
      ordererserviceId: ["", Validators.required],
      operators: ["", Validators.required],
      peerId: ["", Validators.required],
    });

    if (localStorage.getItem("netWorkId") != null) {
      this.getOrderingServices(localStorage.getItem("netWorkId"));
    }
    this.apiKeyService.getToken("").then((res) => {
      localStorage.setItem("token", res.data.token);
    });
  }

  ngAfterViewInit() {
    if (localStorage.getItem("netWorkId") == null) {
      this.showInvaildAccessModal();
    }
    let self = this;
    let operatorsData = [];
    let peersDataa = [];

    $(document).ready(() => {
      $("#operators").chosen({ no_results_text: "Operators not found!" });
      $("#peerId").chosen({ no_results_text: "Peers not found!" });

      $("#ordererserviceId")
        .chosen({ max_selected_options: 3 })
        .change((event) => {
          self.channelForm.patchValue({
            ordererserviceId: $("#ordererserviceId").chosen().val(),
          });
          self.getOperators();
        });

      $("#operators")
        .chosen({ max_selected_options: 3 })
        .change((event) => {
          operatorsData = [];

          for (const i of Object.keys($("#operators").chosen().val())) {
            operatorsData.push(
              $("#operators")
                .chosen()
                .val()
                [i].split(":")[1]
                .trim()
                .split("'")[1]
            );
          }

          self.channelForm.patchValue({ operators: operatorsData });
          self.getPeers();
        });

      $("#peerId")
        .chosen({ max_selected_options: 3 })
        .change((event) => {
          peersDataa = [];
          this.selectedPeersOrgData = [];

          let new_peer = $("#peerId").chosen().val();
          for (const i of Object.keys(new_peer)) {
            let peerId = new_peer[i].split(":")[1].trim().split("'")[1];
            peersDataa.push(peerId);
            this.selectedPeersOrgData.push(
              this.peersOrgData.find((peer) => peer._id == peerId)
            );
          }

          let selectedPeers = $("#peerId option:selected");

          self.peerNames = $.map(selectedPeers, function (selectedPeers) {
            return selectedPeers.text;
          });
          let newArray = [];
          this.selectedPeersOrgData.forEach((ele) => {
            if (newArray.find((peer) => peer.orgId === ele.orgId)) {
              let index = newArray.findIndex((peer) => {
                return peer.orgId == ele.orgId;
              });
              newArray[index].peers.push({
                peerId: ele._id,
                name: ele.name,
              });
            } else {
              newArray.push({
                orgId: ele.orgId,
                peers: [
                  {
                    peerId: ele._id,
                    name: ele.name,
                  },
                ],
              });
            }
          });
          this.selectedPeersOrgData = [];
          this.selectedPeersOrgData = newArray;
          self.channelForm.patchValue({ peerId: peersDataa });
        });
    });
  }

  goToNetworkList() {
    this.invalidAccessModel.close();
    this.Router.navigate(["/network"]);
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

  showInvaildAccessModal() {
    this.invalidAccessModel = this.modalService.open(this.invalidAccess, {
      windowClass: "activation-box invalid-access-box animated zoomIn faster",
      centered: true,
      backdrop: "static",
      keyboard: false,
    });
  }

  //hide Activity Model
  hideActivityModel() {
    this.closeAble = false;
    this.modellref.close();
  }

  //Get Ordering List
  getOrderingServices(netWorkId) {
    this.orderingServices = [];
    this.operators = [];
    this.peersData = [];
    this.orderingServices = "";
    this.orderingService.getAllOrdererServicesByNetwork(netWorkId).subscribe(
      (res) => {
        this.orderingServices = res.data;
        $("#ordererserviceId").chosen("destroy");
        $(document).ready(function () {
          $("#ordererserviceId").chosen({
            no_results_text: "Ordering Service not found!",
          });
        });
      },
      (error) => {
        this.toastr.error(error.error.message);
      }
    );
  }

  getOperators() {
    this.operators = [];
    this.peersData = [];
    this.channelForm.patchValue({ operators: "", peerId: "" });
    let ordererserviceId = this.channelForm.value.ordererserviceId;
    if (ordererserviceId != "") {
      this.channelService.listOrdererConsortium(ordererserviceId).subscribe(
        (res) => {
          this.operators = res.data[0].organisations;
          this.operators.forEach((org) => {
            org.peer.forEach((peers) => {
              this.peersOrgData.push(peers);
            });
          });
          $("#operators").chosen("destroy");
          $("#peerId").chosen("destroy");
          $(document).ready(function () {
            $("#operators").chosen({ no_results_text: "Operators not found!" });
            $("#peerId").chosen({ no_results_text: "Peers not found!" });
          });
        },
        (error) => {
          this.toastr.error(error.error.message);
        }
      );
    } else {
      $("#operators").chosen("destroy");
      $("#peerId").chosen("destroy");
      $(document).ready(function () {
        $("#operators").chosen({ no_results_text: "Operators not found!" });
        $("#peerId").chosen({ no_results_text: "Peers not found!" });
      });
      this.channelForm.controls["operators"].markAsUntouched();
      this.channelForm.controls["peerId"].markAsUntouched();
    }
  }

  getPeers() {
    this.peersData = [];
    this.channelForm.patchValue({ peerId: "" });
    let operatorsId = this.channelForm.value.operators;

    if (operatorsId.length) {
      for (const i of Object.keys(operatorsId)) {
        this.peersData.push(
          this.operators.filter((data) => data._id == operatorsId[i])[0]
        );
      }

      if (!this.peersData[0].peer.length) {
        this.toastr.error("", "Peers not found");
        this.channelForm.controls["peerId"].markAsUntouched();
      }
    }

    $(document).ready(function () {
      $("#peerId").chosen("destroy");
      $("#peerId").chosen({ no_results_text: "Peers not found!" });
    });
  }

  saveChannelInfoApi() {
    return new Promise(async (resolve, reject) => {
      let saveChannelInfo = await this.channelService
        .saveChannelInfo(this.data)
        .catch((error) => {
          if (!error.error.message) {
            this.toastr.error("Something Went Wrong");
            reject();
            throw new Error();
          }
          this.logsmsg[this.increment].icon = "refresh.png";
          this.logsmsg[this.increment].success = "no";
          this.closeAble = true;
          this.failApi = true;
          this.toastr.error(error.error.message);
          reject();
          throw new Error();
        });
      this.logsmsg[this.increment].icon = "check.png";
      this.increment++;
      this.logsmsg.push({
        msg: "Creating channel transaction.",
        icon: "loader.gif",
        index: 2,
        iconLocation: this.increment,
      });
      this.channelId = saveChannelInfo.data._id;

      resolve();
    });
  }

  createChannelTxApi() {
    return new Promise(async (resolve, reject) => {
      let createChannelTx = await this.channelService
        .createChannelTx(this.channelId)
        .catch((error) => {
          if (!error.error.message) {
            this.toastr.error("Something Went Wrong");
          } else {
            this.toastr.error(error.error.message);
          }
          this.logsmsg[this.increment].icon = "refresh.png";
          this.logsmsg[this.increment].success = "no";
          this.increment++;
          this.closeAble = true;
          this.failApi = true;
          reject();
          throw new Error("my error");
        });
      this.logsmsg[this.increment].icon = "check.png";
      this.increment++;
      this.logsmsg.push({
        msg: "Creating channel.",
        icon: "loader.gif",
        index: 3,
        iconLocation: this.increment,
      });
      resolve();
    });
  }

  createChannelApi() {
    return new Promise(async (resolve, reject) => {
      let createChannel = await this.channelService
        .createChannel(this.channelId)
        .then((response) => {
          setTimeout(async () => {
            this.logsmsg[this.increment].icon = "check.png";
            this.increment++;
            resolve();
          }, 4000);
        })
        .catch((error) => {
          if (!error.error.message) {
            this.toastr.error("Something Went Wrong");
          } else {
            this.toastr.error(error.error.message);
          }
          this.logsmsg[this.increment].icon = "refresh.png";
          this.logsmsg[this.increment].success = "no";
          this.closeAble = true;
          this.failApi = true;
          reject();
          throw new Error("my error");
        });
      //this.logsmsg.push({ msg: 'joinChannel : '+this.increment, icon: 'loader.gif' });
    });
  }

  async joinChannelFunctionApi() {
    // for (const i of Object.keys(this.channelForm.value.peerId)) {
    this.peerArray.push(
      this.joinChannelFunction(this.channelId, this.channelForm.value.peerId)
    );
    // }
    let waitHere = await Promise.all(this.peerArray);
  }

  joinChannelFunction(channelId, peerId) {
    return new Promise(async (resolve, reject) => {
      this.errorArr.push("1");
      this.logsmsg.push({
        // msg: "Join channel : " + this.peerNames[i],
        msg: "Join channel : " + this.peerNames.join(", "),
        icon: "loader.gif",
        index: 4,
        iconLocation: this.increment,
        channelId: channelId,
        peerId: peerId,
        // peerNames: this.peerNames[i],
        peerNames: this.peerNames.join(", "),
      });
      this.joinChannel(channelId, peerId, this.increment);
      this.increment++;
    });
  }

  joinChannel(channelId, peerId, increment) {
    return new Promise(async (resolve, reject) => {
      await this.channelService
        .joinChannel(channelId, peerId)
        .then((response) => {
          this.logsmsg[increment].icon = "check.png";
          this.errorArr.pop();
          if (!this.errorArr.length) {
            this.logsmsg.push({
              msg: "Get updated alias-list.",
              icon: "loader.gif",
              index: 5,
              iconLocation: this.increment,
            });
            this.getUpdateAliasListApi();
          }
          resolve();
        })
        .catch((error) => {
          if (!error.error.message) {
            this.toastr.error("Something Went Wrong");
          } else {
            this.toastr.error(error.error.message);
          }
          this.logsmsg[increment].icon = "refresh.png";
          this.logsmsg[increment].success = "no";
          this.closeAble = true;
          this.failApi = true;
          reject();
          throw new Error("my error");
        });
    });
  }

  getUpdateAliasListApi() {
    return new Promise(async (resolve, reject) => {
      let self = this;
      await this.channelService
        .getUpdateAliasList(this.channelId)
        .then(async (response) => {
          this.logsmsg[this.increment].icon = "check.png";
          if (response.status == 1) {
            this.increment++;
            this.updateOrdererHostApi(response);
            this.updatePeerHostsApi(response);
          } else {
            this.checkallapis = true;
            this.closeAble = true;
            setTimeout(() => {
              self.modellref.close();
              self.Router.navigate(["/inner-sidebar/channel"]);
            }, 2000);
          }
          resolve();
        })
        .catch((error) => {
          if (!error.error.message) {
            this.toastr.error("Something Went Wrong");
          } else {
            this.toastr.error(error.error.message);
          }
          this.logsmsg[this.increment].icon = "refresh.png";
          this.logsmsg[this.increment].success = "no";
          this.closeAble = true;
          this.failApi = true;
          reject();
          throw new Error("my error");
        });
    });
  }

  async updateOrdererHostApi(response) {
    for (const i of Object.keys(response.data.OrderNodelist)) {
      this.updateOrdererHost(
        this.channelId,
        response.data.OrderNodelist[i]._id,
        response.data.OrderNodelist[i].name,
        this.increment
      );
      //this.updateOrdererHostArray.push(this.updateOrdererHost(this.channelId, response.data.OrderNodelist[i]._id, response.data.OrderNodelist[i].name))
      this.increment++;
      this.errorArr.push("1");
    }
    let stopHere = await Promise.all(this.updateOrdererHostArray);
  }

  updateOrdererHost(channelId, orderernodeId, orderernodeName, increment) {
    return new Promise(async (resolve, reject) => {
      this.logsmsg.push({
        msg: "Update orderer host for " + orderernodeName,
        icon: "loader.gif",
        index: 6,
        iconLocation: this.increment,
        channelId: channelId,
        peerId: orderernodeId,
        peerNames: orderernodeName,
      });

      await this.channelService
        .updateOrdererHost(channelId, orderernodeId)
        .then((response) => {
          this.logsmsg[increment].icon = "check.png";
          this.errorArr.pop();
          if (!this.errorArr.length) {
            this.checkallapis = true;
            this.closeAble = true;
            setTimeout(() => {
              this.modellref.close();
              this.Router.navigate(["/inner-sidebar/channel"]);
            }, 2000);
          }

          resolve();
        })
        .catch((error) => {
          if (!error.error.message) {
            this.toastr.error("Something Went Wrong");
          } else {
            this.toastr.error(error.error.message);
          }
          this.logsmsg[increment].icon = "refresh.png";
          this.logsmsg[increment].success = "no";
          this.closeAble = true;
          this.failApi = true;
          reject();
          throw new Error("my error");
        });
    });
  }

  updatePeerHostsApi(response) {
    for (const i of Object.keys(response.data.OrganisationList)) {
      let orgPeers = response.data.OrganisationList[i].organisations.peer;
      for (const j of Object.keys(orgPeers)) {
        this.updatePeerHostsArray.push(
          this.updatePeerHosts(
            this.channelId,
            orgPeers[j]._id,
            orgPeers[j].name,
            this.increment
          )
        );
        this.logsmsg.push({
          msg: "Update peer host for " + orgPeers[j].name,
          icon: "loader.gif",
          index: 7,
          iconLocation: this.increment,
          channelId: this.channelId,
          peerId: orgPeers[j]._id,
          peerNames: orgPeers[j].name,
        });
        this.increment++;
        this.errorArr.push("1");
      }
    }
  }

  updatePeerHosts(channelId, peerId, peerName, increment) {
    return new Promise(async (resolve, reject) => {
      await this.channelService
        .updatePeerHosts(channelId, peerId)
        .then((response) => {
          this.logsmsg[increment].icon = "check.png";
          this.errorArr.pop();
          if (!this.errorArr.length) {
            this.checkallapis = true;
            this.closeAble = true;
            setTimeout(() => {
              this.modellref.close();
              this.Router.navigate(["/inner-sidebar/channel"]);
            }, 2000);
          }
          resolve();
        })
        .catch((error) => {
          if (!error.error.message) {
            this.toastr.error("Something Went Wrong");
          } else {
            this.toastr.error(error.error.message);
          }
          this.logsmsg[increment].icon = "refresh.png";
          this.logsmsg[increment].success = "no";
          this.closeAble = true;
          this.failApi = true;
          reject();
          throw new Error("my error");
        });
    });
  }

  async rehitApi(index, channelId, peerId, iconLocation, peerNames, loopIndex) {
    this.closeAble = false;
    this.checkallapis = false;
    this.failApi = false;
    if (index == 1) {
      this.logsmsg[iconLocation] = {
        msg: "Save channel information.",
        icon: "loader.gif",
        index: 1,
        iconLocation: iconLocation,
      };
      await this.saveChannelInfoApi();
      await this.createChannelTxApi();
      await this.createChannelApi();
    }
    if (index == 2) {
      this.logsmsg[iconLocation] = {
        msg: "Creating channel transaction.",
        icon: "loader.gif",
        index: 2,
        iconLocation: iconLocation,
      };
      await this.createChannelTxApi();
      await this.createChannelApi();
      await this.joinChannelFunctionApi();
    }
    if (index == 3) {
      this.logsmsg[iconLocation] = {
        msg: "Creating channel .",
        icon: "loader.gif",
        index: 3,
        iconLocation: iconLocation,
      };
      await this.createChannelApi();
      await this.joinChannelFunctionApi();
    }
    if (index == 4) {
      this.logsmsg[iconLocation] = {
        msg: "Join channel : " + peerNames,
        icon: "loader.gif",
        index: 4,
        iconLocation: iconLocation,
        channelId: channelId,
        peerId: peerId,
        peerNames: peerNames,
      };

      await this.joinChannel(channelId, peerId, iconLocation);
    }
    if (index == 5) {
      this.logsmsg[iconLocation] = {
        msg: "Get updated alias-list.",
        icon: "loader.gif",
        index: 5,
        iconLocation: iconLocation,
      };
      await this.getUpdateAliasListApi();
    }
    if (index == 6) {
      this.logsmsg[iconLocation] = {
        msg: "Update orderer host for " + peerNames,
        icon: "loader.gif",
        index: 6,
        iconLocation: iconLocation,
        channelId: channelId,
        peerId: peerId,
        peerNames: peerNames,
      };
      await this.updateOrdererHost(channelId, peerId, peerNames, iconLocation);
    }
    if (index == 7) {
      this.logsmsg[iconLocation] = {
        msg: "Update peer host for " + peerNames,
        icon: "loader.gif",
        index: 7,
        iconLocation: iconLocation,
        channelId: channelId,
        peerId: peerId,
        peerNames: peerNames,
      };
      await this.updatePeerHosts(channelId, peerId, peerNames, iconLocation);
    }
  }

  async addChannel() {
    this.increment = 0;
    this.logsmsg = [];

    for (const c of Object.keys(this.channelForm.controls)) {
      this.channelForm.controls[c].markAsTouched();
    }

    let anchorpeerId;

    if (
      this.channelForm.value.operators.length !=
      this.selectedPeersOrgData.length
    ) {
      this.toastr.error(
        "Please select ateast one peer of each selected operator"
      );
      return;
    }

    if (this.channelForm.invalid) {
      return;
    }

    this.closeAble = false;
    this.checkallapis = false;
    this.failApi = false;

    this.modellref = this.modalService.open(this.content, {
      windowClass: "activation-box-with-scroll animated zoomIn faster",
      centered: true,
      backdrop: "static",
      keyboard: false,
    });

    this.data = {
      name: this.channelForm.value.name,
      ordererserviceId: this.channelForm.value.ordererserviceId,
      operators: this.channelForm.value.operators,
    };
    this.logsmsg.push({
      msg: "Save channel information.",
      icon: "loader.gif",
      iconLocation: this.increment,
      index: 1,
    });

    try {
      await this.saveChannelInfoApi();

      await this.createChannelTxApi();

      await this.createChannelApi();

      await this.joinChannelFunctionApi();

      await this.getUpdateAliasListApi();
    } catch (error) {
      this.logsmsg[this.increment].icon = "refresh.png";
      this.closeAble = true;
      this.failApi = true;
      this.toastr.error(error.error.message);
    }
  }
}
