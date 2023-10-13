import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ChannelService } from "./../channel.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";
import { OrganisationService } from "./../../organisation/organisation.service";
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import { PeerService } from "./../../peer/peer.service";
import { ApiKeyService } from "./../../../api-key/api-key.service";
import { async } from "@angular/core/testing";
declare var $: any;

@Component({
  selector: "app-view-channel",
  templateUrl: "./view-channel.component.html",
  styleUrls: ["./view-channel.component.scss"],
})
export class ViewChannelComponent implements OnInit, AfterViewInit {
  constructor(
    private channelService: ChannelService,
    private organisationService: OrganisationService,
    private route: ActivatedRoute,
    private peerService: PeerService,
    private apiKeyService: ApiKeyService,
    private router: Router,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder
  ) {}

  @ViewChild("deleteModel", { static: false }) private deleteModel;
  @ViewChild("activityLogs", { static: false }) private activityLogs;
  @ViewChild("activityLogsAdd", { static: false }) private activityLogsAdd;

  addOrganisation: FormGroup;
  channelData: any;
  activityLogsModal;
  activityLogsAddModal;
  deleteModalBox;
  apiData;
  failApi = false;
  closeAble = false;
  success = false;
  logsmsg = [];
  cancel_btn = false;
  save_btn = false;
  add_more_btn = true;
  select_box = false;
  checkallapis = false;
  organisationIds = [];
  organisationList = [];
  listData = [];
  joinOrgs = [];
  channelorgs = [];
  incrementLogs: number = 0;
  networkId;
  addLabel = "";
  orgPeerData = [];
  checkErrArr = [];
  peerJoinChannelArray = [];
  adminData;
  policyData;
  updateOrdererHostArray = [];

  updatePeerHostsArray = [];
  deleteIds = {
    channelId: "",
    orgId: "",
    isRemoveOrg: false,
  };

  private setting = {
    element: {
      dynamicDownload: null as HTMLElement,
    },
  };

  ngOnInit() {
    this.networkId = localStorage.getItem("netWorkId");
    this.getNetworkId(this.networkId);
    this.organisationFields();
    this.apiKeyService.getToken("").then((res) => {
      localStorage.setItem("token", res.data.token);
    });
  }
  ngAfterViewInit() {
    $(document).ready(() => {
      $("#peer-dropdown").chosen({
        no_results_text: "Peer not found!",
        placeholder_text_multiple: "No Peer Found",
      });
    });
  }

  getNetworkId(networkId) {
    this.organisationIds = [];
    let organisationList = this.organisationService
      .getListByNetwork(networkId)
      .catch((error) => {})
      .then((response) => {
        let data = response.data.filter((data) => data.type == 0);
        data.forEach((element, index) => {
          if (element.type == 0) {
            this.organisationIds.push(element);
            if (index == data.length - 1) {
              this.getChannelDetail();
            }
          }
        });
      });
  }

  ///Form Fields
  organisationFields() {
    this.addOrganisation = this.formBuilder.group({
      channelId: [""],
      organisation: ["", Validators.required],
      admin: [""],
      anchorpeerId: ["", Validators.required],
    });
  }

  getChannelDetail() {
    let id = this.route.snapshot.paramMap.get("id");
    this.addOrganisation.patchValue({ channelId: id });
    this.channelService.getChannelDetail(id).subscribe(
      (response) => {
        this.joinOrgs = response.data.channelorgs;
        this.listData = response.data.organisations;
        this.channelData = response.data;
        $(document).ready(() => {
          $("#peer-dropdown").chosen("destroy");
          $("#peer-dropdown").chosen({
            no_results_text: "Peer not found!",
            placeholder_text_multiple: "No Peer Found",
          });
        });

        this.channelorgs = [];
        this.organisationList = [];
        this.orgPeerData = [];
        this.joinOrgs.forEach((ele, index) => {
          this.channelorgs.push(ele.organisation._id);
          if (index == this.joinOrgs.length - 1) {
            this.organisationIds.forEach((org) => {
              if (!this.channelorgs.includes(org._id)) {
                this.organisationList.push(org);
              }
            });
          }
        });
      },
      (error) => {
        //console.log('error');
      }
    );
  }

  async SaveOrganisation() {
    this.addOrganisation.controls["organisation"].markAsTouched();
    this.addOrganisation.controls["anchorpeerId"].markAsTouched();
    if (this.addOrganisation.invalid) {
      return;
    }
    this.addLabel = "organisation";
    if (this.addOrganisation.value.admin) {
      this.addLabel = "organisation and as admin";
    }

    let self = this;
    this.logsmsg = [];
    this.closeAble = false;
    this.failApi = false;
    this.success = false;
    this.incrementLogs = 0;

    try {
      this.activityLogsAddModal = this.modalService.open(this.activityLogsAdd, {
        windowClass: "activation-box invalid-access-box animated zoomIn faster",
        centered: true,
        backdrop: "static",
        keyboard: false,
      });
      this.apiData = {
        channelId: this.addOrganisation.value.channelId,
        anchorpeerId: this.addOrganisation.value.anchorpeerId[0],
      };
      this.logsmsg.push({
        msg: "Fetch channel information.",
        icon: "loader.gif",
        index: 1,
      });

      await this.fetchChannelApi();

      this.logsmsg.push({
        msg: "Create config transaction for organisation.",
        icon: "loader.gif",
        index: 2,
      });
      await this.createOrgApi();

      this.logsmsg.push({
        msg: "Add organisation to channel config.",
        icon: "loader.gif",
        index: 3,
      });
      await this.orgToChannelApi();

      this.logsmsg.push({
        msg: "Update channel.",
        icon: "loader.gif",
        index: 4,
      });
      await this.peerToChannelApi();

      await this.loopFun();

      if (this.addOrganisation.controls["admin"].value == true) {
        this.incrementLogs++;
        this.logsmsg.push({
          msg: "Get channel config.",
          icon: "loader.gif",
          index: 6,
        });
        await this.getChannelConfigApi();

        this.logsmsg.push({
          msg: "Add organisation as Admin in channel.",
          icon: "loader.gif",
          index: 7,
        });
        await this.addOrgAsAdminApi();

        this.logsmsg.push({
          msg: "Update channel policy.",
          icon: "loader.gif",
          index: 8,
        });
        await this.policyApi();
      } else {
        this.success = true;
        this.failApi = false;
        this.closeAble = true;
        setTimeout(() => {
          this.addOrganisation.reset();
          this.activityLogsAddModal.close();
          this.getNetworkId(this.networkId);
          // this.router.navigate(['/inner-sidebar/channel']);
        }, 2000);
      }

      return;

      this.logsmsg.push({
        msg: "Fetch channel information.",
        icon: "loader.gif",
      });
      let channelId = this.addOrganisation.controls["channelId"].value;
      let fetchChannel = await this.channelService
        .fetchChannel(channelId)
        .catch((error) => {
          this.toastr.error(error.error.message.message);
          this.logsmsg[this.incrementLogs].icon = "cross.png";
          this.closeAble = true;
          this.failApi = true;
          throw new Error();
        });
      this.logsmsg[this.incrementLogs].icon = "check.png";
      this.incrementLogs++;

      this.logsmsg.push({
        msg: "Create config transaction for organisation.",
        icon: "loader.gif",
      });
      let data = {
        channelId: channelId,
        anchorpeerId: this.addOrganisation.controls["anchorpeerId"].value,
      };

      let createOrg = await this.channelService
        .createOrg(data)
        .catch((error) => {
          this.toastr.error(error.error.message);
          this.logsmsg[this.incrementLogs].icon = "cross.png";
          this.closeAble = true;
          this.failApi = true;
          throw new Error();
        });
      this.logsmsg[this.incrementLogs].icon = "check.png";
      this.incrementLogs++;

      this.logsmsg.push({
        msg: "Add organisation to channel config.",
        icon: "loader.gif",
      });
      let orgToChannel = await this.channelService
        .orgToChannel(data)
        .catch((error) => {
          this.toastr.error(error.error.message);
          this.logsmsg[this.incrementLogs].icon = "cross.png";
          this.closeAble = true;
          this.failApi = true;
          throw new Error();
        });
      this.logsmsg[this.incrementLogs].icon = "check.png";
      this.incrementLogs++;

      this.logsmsg.push({ msg: "Update channel.", icon: "loader.gif" });
      let peerToChannel = await this.channelService
        .peerToChannel(data)
        .catch((error) => {
          this.toastr.error(error.error.message);
          this.logsmsg[this.incrementLogs].icon = "cross.png";
          this.closeAble = true;
          this.failApi = true;
          throw new Error();
        });
      this.logsmsg[this.incrementLogs].icon = "check.png";
      this.incrementLogs++;

      if (this.addOrganisation.controls["admin"].value == true) {
        //this.addAsAdmin(channelId, this.addOrganisation.controls['organisation'].value, true, 1);
        this.logsmsg.push({ msg: "Get channel config.", icon: "loader.gif" });
        let getChannelConfig2 = await this.channelService
          .getChannelConfig(this.addOrganisation.controls["channelId"].value)
          .catch((err) => {
            this.logsmsg[this.incrementLogs].icon = "cross.png";
            this.toastr.error(err.error.message);
            this.closeAble = true;
            this.failApi = true;
            throw new Error();
          });
        this.logsmsg[this.incrementLogs].icon = "check.png";
        this.incrementLogs++;

        this.logsmsg.push({
          msg: "Add organisation as Admin in channel.",
          icon: "loader.gif",
        });

        let adminData = {
          channelId: this.addOrganisation.controls["channelId"].value,
          orgId: this.addOrganisation.controls["organisation"].value,
        };
        let addOrgAsAdmin = await this.channelService
          .addOrgAsAdmin(adminData)
          .catch((err) => {
            this.logsmsg[this.incrementLogs].icon = "cross.png";
            this.toastr.error(err.error.message);
            this.closeAble = true;
            this.failApi = true;
            throw new Error();
          });
        let policyData = {
          channelId: this.addOrganisation.controls["channelId"].value,
          orgId: this.addOrganisation.controls["organisation"].value,
          isRemoveOrg: false,
          isRemoveAdmin: false,
        };
        this.logsmsg[this.incrementLogs].icon = "check.png";
        this.incrementLogs++;

        this.logsmsg.push({
          msg: "Update channel policy.",
          icon: "loader.gif",
        });
        let policy = await this.channelService
          .policy(policyData)
          .catch((err) => {
            this.logsmsg[this.incrementLogs].icon = "cross.png";
            this.toastr.error(err.error.message);
            this.closeAble = true;
            this.failApi = true;
            throw new Error();
          });

        this.logsmsg[this.incrementLogs].icon = "check.png";
        this.incrementLogs++;

        this.success = true;
        this.closeAble = true;
        setTimeout(() => {
          this.addOrganisation.reset();
          this.activityLogsAddModal.close();
          this.getNetworkId(this.networkId);
          // this.router.navigate(['/inner-sidebar/channel']);
        }, 2000);
        return false;
      }
      this.success = true;
      this.failApi = false;
      this.closeAble = true;
      setTimeout(() => {
        this.addOrganisation.reset();
        this.activityLogsAddModal.close();
        this.getNetworkId(this.networkId);
        // this.router.navigate(['/inner-sidebar/channel']);
      }, 2000);
    } catch (err) {}
  }

  /*
  this.logsmsg.push({ msg: 'Update channel.', icon: 'loader.gif', index: 4 });
  this.logsmsg.push({ msg: 'Get channel config.', icon: 'loader.gif', index: 6 });
  this.logsmsg.push({ msg: 'Add organisation as Admin in channel.', icon: 'loader.gif', index: 7 });
  this.logsmsg.push({ msg: 'Update channel policy.', icon: 'loader.gif', index: 8 });
  */
  async reHitApi(
    apiIndex,
    logIndex,
    data,
    indexValue,
    peerId,
    peerNames,
    iconLocation
  ) {
    this.closeAble = false;
    this.failApi = false;
    this.success = false;
    if (apiIndex == 1) {
      this.logsmsg[logIndex].icon = "loader.gif";
      await this.fetchChannelApi();

      this.logsmsg.push({
        msg: "Create config transaction for organisation.",
        icon: "loader.gif",
        index: 2,
      });
      await this.createOrgApi();

      this.logsmsg.push({
        msg: "Add organisation to channel config.",
        icon: "loader.gif",
        index: 3,
      });
      await this.orgToChannelApi();

      this.logsmsg.push({
        msg: "Update channel.",
        icon: "loader.gif",
        index: 4,
      });
      await this.peerToChannelApi();

      await this.loopFun();

      this.logsmsg.push({
        msg: "Get channel config.",
        icon: "loader.gif",
        index: 6,
      });
      await this.getChannelConfigApi();

      this.logsmsg.push({
        msg: "Add organisation as Admin in channel.",
        icon: "loader.gif",
        index: 7,
      });
      await this.addOrgAsAdminApi();

      this.logsmsg.push({
        msg: "Update channel policy.",
        icon: "loader.gif",
        index: 8,
      });
      await this.policyApi();
    }
    if (apiIndex == 2) {
      this.logsmsg[logIndex].icon = "loader.gif";
      await this.createOrgApi();

      this.logsmsg.push({
        msg: "Add organisation to channel config.",
        icon: "loader.gif",
        index: 3,
      });
      await this.orgToChannelApi();

      this.logsmsg.push({
        msg: "Update channel.",
        icon: "loader.gif",
        index: 4,
      });
      await this.peerToChannelApi();

      await this.loopFun();

      this.logsmsg.push({
        msg: "Get channel config.",
        icon: "loader.gif",
        index: 6,
      });
      await this.getChannelConfigApi();

      this.logsmsg.push({
        msg: "Add organisation as Admin in channel.",
        icon: "loader.gif",
        index: 7,
      });
      await this.addOrgAsAdminApi();

      this.logsmsg.push({
        msg: "Update channel policy.",
        icon: "loader.gif",
        index: 8,
      });
      await this.policyApi();
    }
    if (apiIndex == 3) {
      this.logsmsg[logIndex].icon = "loader.gif";
      await this.orgToChannelApi();

      this.logsmsg.push({
        msg: "Update channel.",
        icon: "loader.gif",
        index: 4,
      });
      await this.peerToChannelApi();

      await this.loopFun();

      this.logsmsg.push({
        msg: "Get channel config.",
        icon: "loader.gif",
        index: 6,
      });
      await this.getChannelConfigApi();

      this.logsmsg.push({
        msg: "Add organisation as Admin in channel.",
        icon: "loader.gif",
        index: 7,
      });
      await this.addOrgAsAdminApi();

      this.logsmsg.push({
        msg: "Update channel policy.",
        icon: "loader.gif",
        index: 8,
      });
      await this.policyApi();
    }
    if (apiIndex == 4) {
      this.logsmsg[logIndex].icon = "loader.gif";
      await this.peerToChannelApi();

      await this.loopFun();

      this.logsmsg.push({
        msg: "Get channel config.",
        icon: "loader.gif",
        index: 6,
      });
      await this.getChannelConfigApi();

      this.logsmsg.push({
        msg: "Add organisation as Admin in channel.",
        icon: "loader.gif",
        index: 7,
      });
      await this.addOrgAsAdminApi();

      this.logsmsg.push({
        msg: "Update channel policy.",
        icon: "loader.gif",
        index: 8,
      });
      await this.policyApi();
    }
    if (apiIndex == 5) {
      this.logsmsg[logIndex].icon = "loader.gif";
      //await this.loopFun();

      await this.joinChannel(data.channelId, data.peerId, indexValue);

      // this.logsmsg.push({ msg: 'Get channel config.', icon: 'loader.gif', index: 6 });
      // await this.getChannelConfigApi();

      // this.logsmsg.push({ msg: 'Add organisation as Admin in channel.', icon: 'loader.gif', index: 7 });
      // await this.addOrgAsAdminApi();

      // this.logsmsg.push({ msg: 'Update channel policy.', icon: 'loader.gif', index: 8 });
      // await this.policyApi();
    }
    if (apiIndex == 6) {
      this.logsmsg[logIndex].icon = "loader.gif";
      await this.getChannelConfigApi();

      this.logsmsg.push({
        msg: "Add organisation as Admin in channel.",
        icon: "loader.gif",
        index: 7,
      });
      await this.addOrgAsAdminApi();

      this.logsmsg.push({
        msg: "Update channel policy.",
        icon: "loader.gif",
        index: 8,
      });
      await this.policyApi();
    }
    if (apiIndex == 7) {
      this.logsmsg[logIndex].icon = "loader.gif";
      await this.addOrgAsAdminApi();

      this.logsmsg.push({
        msg: "Update channel policy.",
        icon: "loader.gif",
        index: 8,
      });
      await this.policyApi();
    }
    if (apiIndex == 8) {
      this.logsmsg[logIndex].icon = "loader.gif";
      await this.policyApi();
    }

    if (apiIndex == 101) {
      this.logsmsg[0].icon = "loader.gif";
      await this.getChannelConfigApiAdd();

      this.logsmsg.push({
        msg: "Add organisation as Admin in channel",
        icon: "loader.gif",
        index: 102,
      });
      await this.addOrgAsAdminApis();

      this.logsmsg.push({
        msg: "Update channel policy",
        icon: "loader.gif",
        index: 103,
      });
      await this.upddateChannelPolicyAsAdminApis();
    }
    if (apiIndex == 102) {
      this.logsmsg[1].icon = "loader.gif";
      await this.addOrgAsAdminApis();

      this.logsmsg.push({
        msg: "Update channel policy",
        icon: "loader.gif",
        index: 103,
      });
      await this.upddateChannelPolicyAsAdminApis();
    }
    if (apiIndex == 103) {
      this.logsmsg[2].icon = "loader.gif";
      await this.upddateChannelPolicyAsAdminApis();
    }

    //.//hereeee
    if (apiIndex == 15) {
      this.logsmsg[logIndex].icon = "loader.gif";
      await this.getUpdateAliasListApi(data);
      this.logsmsg.push({
        msg: "Update channel policy.",
        icon: "loader.gif",
        index: 8,
      });
      await this.policyApi();
    }

    if (apiIndex == 16) {
      this.logsmsg[iconLocation] = {
        msg: "Update orderer host for " + peerNames,
        icon: "loader.gif",
        index: 16,
        iconLocation: iconLocation,
        channelId: data,
        peerId: peerId,
        peerNames: peerNames,
      };
      await this.updateOrdererHost(data, peerId, peerNames, iconLocation);
    }
    if (apiIndex == 17) {
      this.logsmsg[iconLocation] = {
        msg: "Update peer host for " + peerNames,
        icon: "loader.gif",
        index: 17,
        iconLocation: iconLocation,
        channelId: data,
        peerId: peerId,
        peerNames: peerNames,
      };
      await this.updatePeerHosts(data, peerId, peerNames, iconLocation);
    }
  }

  async fetchChannelApi() {
    return new Promise(async (resolve, reject) => {
      let channelId = this.addOrganisation.controls["channelId"].value;
      let fetchChannel = await this.channelService
        .fetchChannel(channelId)
        .catch((error) => {
          this.toastr.error(error.error.message.message);
          this.logsmsg[this.incrementLogs].icon = "refresh.png";
          this.closeAble = true;
          this.failApi = true;
          reject();
          throw new Error();
        })
        .then((res) => {
          this.logsmsg[this.incrementLogs].icon = "check.png";
          this.logsmsg[this.incrementLogs].success = true;
          this.incrementLogs++;
          resolve();
        });
    });
  }
  async createOrgApi() {
    return new Promise(async (resolve, reject) => {
      let createOrg = await this.channelService
        .createOrg(this.apiData)
        .catch((error) => {
          this.toastr.error(error.error.message);
          this.logsmsg[this.incrementLogs].icon = "refresh.png";
          this.closeAble = true;
          this.failApi = true;
          reject();
          throw new Error();
        })
        .then((res) => {
          this.logsmsg[this.incrementLogs].icon = "check.png";
          this.logsmsg[this.incrementLogs].success = true;
          this.incrementLogs++;

          resolve();
        });
    });
  }
  async orgToChannelApi() {
    return new Promise(async (resolve, reject) => {
      let orgToChannel = await this.channelService
        .orgToChannel(this.apiData)
        .catch((error) => {
          this.toastr.error(error.error.message);
          this.logsmsg[this.incrementLogs].icon = "refresh.png";
          this.closeAble = true;
          this.failApi = true;
          reject();
          throw new Error();
        })
        .then((res) => {
          this.logsmsg[this.incrementLogs].icon = "check.png";
          this.logsmsg[this.incrementLogs].success = true;
          this.incrementLogs++;
          resolve();
        });
    });
  }

  async peerToChannelApi() {
    return new Promise(async (resolve, reject) => {
      let peerToChannel = await this.channelService
        .peerToChannel(this.apiData)
        .catch((error) => {
          this.toastr.error(error.error.message);
          this.logsmsg[this.incrementLogs].icon = "refresh.png";
          this.closeAble = true;
          this.failApi = true;
          throw new Error();
        })
        .then((res) => {
          this.logsmsg[this.incrementLogs].icon = "check.png";
          this.logsmsg[this.incrementLogs].success = true;
          this.incrementLogs++;
          resolve();
        });
    });
  }

  async loopFun() {
    return new Promise(async (resolve, reject) => {
      for (let i = 0; i < this.addOrganisation.value.anchorpeerId.length; i++) {
        this.checkErrArr.push("1");
        let data = {
          channelId: this.addOrganisation.value.channelId,
          peerId: this.addOrganisation.value.anchorpeerId[i],
        };
        this.logsmsg.push({
          msg: "Join channel : Peer" + (i + 1),
          icon: "loader.gif",
          index: 5,
          data: data,
          logIndex: this.incrementLogs,
        });

        this.peerJoinChannelArray.push(
          this.joinChannel(
            this.addOrganisation.value.channelId,
            this.addOrganisation.value.anchorpeerId[i],
            this.incrementLogs
          )
        );
        this.incrementLogs++;
      }

      let wait = await Promise.all(this.peerJoinChannelArray);
    });
  }

  async joinChannel(channelId, peerId, incrementLogs) {
    return new Promise(async (resolve, reject) => {
      await this.channelService
        .joinChannel(channelId, peerId)
        .then(async (response) => {
          this.logsmsg[incrementLogs].icon = "check.png";
          this.logsmsg[incrementLogs].success = true;
          this.checkErrArr.pop();
          if (!this.checkErrArr.length) {
            this.logsmsg.push({
              msg: "Get updated alias-list.",
              icon: "loader.gif",
              index: 15,
              data: channelId,
            });

            resolve();

            this.getUpdateAliasListApi(channelId);
            if (this.addOrganisation.controls["admin"].value == true) {
              this.checkErrArr.push("1");
              this.logsmsg.push({
                msg: "Get channel config.",
                icon: "loader.gif",
                index: 6,
              });
              await this.getChannelConfigApi();

              this.logsmsg.push({
                msg: "Add organisation as Admin in channel.",
                icon: "loader.gif",
                index: 7,
              });
              await this.addOrgAsAdminApi();

              this.logsmsg.push({
                msg: "Update channel policy.",
                icon: "loader.gif",
                index: 8,
              });
              await this.policyApi();
            }
          }
        })
        .catch((error) => {
          this.logsmsg[incrementLogs].icon = "refresh.png";
          this.closeAble = true;
          this.failApi = true;
          reject();
          throw new Error("my error");
        });
    });
  }

  getUpdateAliasListApi(channelId) {
    return new Promise(async (resolve, reject) => {
      let self = this;
      await this.channelService
        .getUpdateAliasList(channelId)
        .then(async (response) => {
          this.logsmsg[this.incrementLogs].icon = "check.png";
          this.logsmsg[this.incrementLogs].success = true;
          if (response.status == 1) {
            this.incrementLogs++;
            this.updateOrdererHostApi(response, channelId);
            this.updatePeerHostsApi(response, channelId);
          } else {
            this.closeAble = true;
            this.failApi = true;
            setTimeout(() => {
              this.addOrganisation.reset();
              this.activityLogsAddModal.close();
              this.getNetworkId(this.networkId);
              // this.router.navigate(['/inner-sidebar/channel']);
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
          this.logsmsg[this.incrementLogs].icon = "refresh.png";

          this.closeAble = true;
          this.failApi = true;
          reject();
          throw new Error("my error");
        });
    });
  }

  async updateOrdererHostApi(response, channelId) {
    for (const i of Object.keys(response.data.OrderNodelist)) {
      this.updateOrdererHost(
        channelId,
        response.data.OrderNodelist[i]._id,
        response.data.OrderNodelist[i].name,
        this.incrementLogs
      );
      //this.updateOrdererHostArray.push(this.updateOrdererHost(this.channelId, response.data.OrderNodelist[i]._id, response.data.OrderNodelist[i].name))
      this.incrementLogs++;
      this.checkErrArr.push("1");
    }
    let stopHere = await Promise.all(this.updateOrdererHostArray);
  }

  updateOrdererHost(channelId, orderernodeId, orderernodeName, increment) {
    return new Promise(async (resolve, reject) => {
      this.logsmsg.push({
        msg: "Update orderer host for " + orderernodeName,
        icon: "loader.gif",
        index: 16,
        data: channelId,
        peerId: orderernodeId,
        peerNames: orderernodeName,
        iconLocation: increment,
      });

      await this.channelService
        .updateOrdererHost(channelId, orderernodeId)
        .then((response) => {
          this.logsmsg[increment].icon = "check.png";
          this.logsmsg[increment].success = true;
          this.checkErrArr.pop();
          if (!this.checkErrArr.length) {
            this.success = true;
            this.failApi = false;
            this.closeAble = true;
            setTimeout(() => {
              this.addOrganisation.reset();
              this.activityLogsAddModal.close();
              this.getNetworkId(this.networkId);
              this.router.navigate(["/inner-sidebar/channel"]);
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
          this.closeAble = true;
          this.failApi = true;
          reject();
          throw new Error("my error");
        });
    });
  }

  updatePeerHostsApi(response, channelId) {
    for (const i of Object.keys(response.data.OrganisationList)) {
      let orgPeers = response.data.OrganisationList[i].organisations.peer;
      for (const j of Object.keys(orgPeers)) {
        this.updatePeerHostsArray.push(
          this.updatePeerHosts(
            channelId,
            orgPeers[j]._id,
            orgPeers[j].name,
            this.incrementLogs
          )
        );
        this.logsmsg.push({
          msg: "Update peer host for " + orgPeers[j].name,
          icon: "loader.gif",
          index: 17,
          iconLocation: this.incrementLogs,
          data: channelId,
          peerId: orgPeers[j]._id,
          peerNames: orgPeers[j].name,
        });
        this.incrementLogs++;
        this.checkErrArr.push("1");
      }
    }
  }

  updatePeerHosts(channelId, peerId, peerName, increment) {
    return new Promise(async (resolve, reject) => {
      await this.channelService
        .updatePeerHosts(channelId, peerId)
        .then((response) => {
          this.logsmsg[increment].icon = "check.png";
          this.logsmsg[increment].success = true;
          this.checkErrArr.pop();
          if (!this.checkErrArr.length) {
            this.success = true;
            this.failApi = false;
            this.closeAble = true;
            setTimeout(() => {
              this.addOrganisation.reset();
              this.activityLogsAddModal.close();
              this.getNetworkId(this.networkId);
              this.router.navigate(["/inner-sidebar/channel"]);
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
          this.closeAble = true;
          this.failApi = true;
          reject();
          throw new Error("my error");
        });
    });
  }

  async getChannelConfigApi() {
    return new Promise(async (resolve, reject) => {
      let getChannelConfig2 = await this.channelService
        .getChannelConfig(this.addOrganisation.controls["channelId"].value)
        .catch((err) => {
          this.logsmsg[this.incrementLogs].icon = "refresh.png";
          this.toastr.error(err.error.message);
          this.closeAble = true;
          this.failApi = true;
          reject();
          throw new Error();
        })
        .then((res) => {
          this.logsmsg[this.incrementLogs].icon = "check.png";
          this.logsmsg[this.incrementLogs].success = true;
          this.incrementLogs++;
          resolve();
        });
    });
  }

  async addOrgAsAdminApi() {
    return new Promise(async (resolve, reject) => {
      let adminData = {
        channelId: this.addOrganisation.controls["channelId"].value,
        orgId: this.addOrganisation.controls["organisation"].value,
      };
      let addOrgAsAdmin = await this.channelService
        .addOrgAsAdmin(adminData)
        .catch((err) => {
          this.logsmsg[this.incrementLogs].icon = "refresh.png";
          this.toastr.error(err.error.message);
          this.closeAble = true;
          this.failApi = true;
          throw new Error();
        })
        .then((res) => {
          this.logsmsg[this.incrementLogs].icon = "check.png";
          this.logsmsg[this.incrementLogs].success = true;
          this.incrementLogs++;
          resolve();
        });
    });
  }

  async policyApi() {
    return new Promise(async (resolve, reject) => {
      let policyData = {
        channelId: this.addOrganisation.controls["channelId"].value,
        orgId: this.addOrganisation.controls["organisation"].value,
        isRemoveOrg: false,
        isRemoveAdmin: false,
      };

      let policy = await this.channelService.policy(policyData).catch((err) => {
        this.logsmsg[this.incrementLogs].icon = "refresh.png";
        this.toastr.error(err.error.message);
        this.closeAble = true;
        this.failApi = true;
        throw new Error();
      });

      this.checkErrArr.pop();
      this.logsmsg[this.incrementLogs].icon = "check.png";
      this.logsmsg[this.incrementLogs].success = true;
      this.incrementLogs++;
      if (!this.checkErrArr.length) {
        this.success = true;
        this.failApi = false;
        this.closeAble = true;
        setTimeout(() => {
          this.addOrganisation.reset();
          this.activityLogsAddModal.close();
          this.getNetworkId(this.networkId);
          this.router.navigate(["/inner-sidebar/channel"]);
        }, 2000);
      }
    });
  }

  async addAsAdmin(channelId, orgId, res, status) {
    this.addLabel = "organisation as admin";
    let self = this;
    if (status == 0) {
      this.logsmsg = [];
      this.closeAble = false;
      this.failApi = false;
      this.success = false;
      this.incrementLogs = 0;
      this.activityLogsAddModal = this.modalService.open(this.activityLogsAdd, {
        windowClass: "activation-box invalid-access-box animated zoomIn faster",
        centered: true,
        backdrop: "static",
        keyboard: false,
      });
    }

    this.adminData = {
      channelId: channelId,
      orgId: orgId,
    };
    this.policyData = {
      channelId: channelId,
      orgId: orgId,
      isRemoveOrg: res,
      isRemoveAdmin: res,
    };

    this.logsmsg.push({
      msg: "Fetch channel configuration.",
      icon: "loader.gif",
      index: 101,
    });
    await this.getChannelConfigApiAdd();
    // let getChannelConfig2 = await this.channelService.getChannelConfig(this.addOrganisation.controls['channelId'].value).catch((err) => {
    //   this.logsmsg[this.incrementLogs].icon = 'cross.png';
    //   this.toastr.error(err.error.message.message);
    //   this.closeAble = true;
    //   this.failApi = true;
    //   throw new Error();
    // });
    // this.logsmsg[this.incrementLogs].icon = 'check.png';
    // this.incrementLogs++;

    this.logsmsg.push({
      msg: "Add organisation as Admin in channel",
      icon: "loader.gif",
      index: 102,
    });

    await this.addOrgAsAdminApis();

    // let addOrgAsAdmin = await this.channelService.addOrgAsAdmin(adminData).catch((err) => {
    //   this.logsmsg[this.incrementLogs].icon = 'cross.png';
    //   this.toastr.error(err.error.message);
    //   this.closeAble = true;
    //   this.failApi = true;
    //   throw new Error();
    // });

    // this.logsmsg[this.incrementLogs].icon = 'check.png';
    // this.incrementLogs++;
    this.logsmsg.push({
      msg: "Update channel policy.",
      icon: "loader.gif",
      index: 103,
    });
    await this.upddateChannelPolicyAsAdminApis();

    // let policy = await this.channelService.policy(policyData).catch((err) => {
    //   this.logsmsg[this.incrementLogs].icon = 'cross.png';
    //   this.toastr.error(err.error.message);
    //   this.closeAble = true;
    //   this.failApi = true;
    //   throw new Error();
    // });
    // this.logsmsg[this.incrementLogs].icon = 'check.png';
    // this.incrementLogs++;

    // this.success = true;
    // this.closeAble = true;
    // setTimeout(() => {

    //   this.getNetworkId(this.networkId);
    //   this.activityLogsAddModal.close();

    //   // this.router.navigate(['/inner-sidebar/channel']);
    // }, 2000)
  }

  hideBtn(id) {
    this.orgPeerData = [];
    if (id) {
      this.peerService
        .getpeerByorg(id)
        .catch((error) => {})
        .then((response) => {
          this.orgPeerData = response.data;
          if (!response.data.length) {
            //alert("toster");
            this.addOrganisation.patchValue({ organisation: "" });
            this.toastr.error(
              "This Organisation does not have any peer",
              "Choose another Organisation"
            );

            $(document).ready(() => {
              $("#peer-dropdown").chosen("destroy");

              $("#peer-dropdown").chosen({
                placeholder_text_multiple: "No Peer Found",
                no_results_text: "Peer not found!",
              });
              $(".chosen-search-input").css({
                "min-width": "140px",
              });
            });
            return false;
          }
          $(document).ready(() => {
            $("#peer-dropdown").chosen("destroy");
            $("#peer-dropdown").chosen({
              no_results_text: "Peer not found!",
              placeholder_text_multiple: "Select Peer",
            });
          });
          $("#peer-dropdown")
            .chosen()
            .change((event) => {
              let val = $("#peer-dropdown").chosen().val();
              this.addOrganisation.patchValue({ anchorpeerId: val });

              // for (const i of Object.keys(val)) {
              //   // peers.push(val[i].split(':')[1].trim().split('\'')[1]);
              //   console.log(val[i].);

              // }
              //console.log(peers);

              //this.addOrganisation.patchValue({ anchorpeerId: peers });
            });
          //this.addOrganisation.controls['anchorpeerId'].setValue(response.data[0]._id);
        });

      this.save_btn = true;
      this.cancel_btn = true;
    } else {
      this.orgPeerData = [];
      this.addOrganisation.controls["anchorpeerId"].setValue("");
      $(document).ready(() => {
        $("#peer-dropdown").chosen("destroy");

        $("#peer-dropdown").chosen({
          placeholder_text_multiple: "No Peer Found",
          no_results_text: "Peer not found!",
        });
        $(".chosen-search-input").css({
          "min-width": "140px",
        });
      });
    }
  }

  // addSelectBox() {
  //   // this.select_box = true;
  //   // this.add_more_btn = false;
  //   // this.cancel_btn = true;
  //   // console.log(this.organisationIds);

  //   // this.organisationIds.forEach(org => {
  //   //   if (!this.channelorgs.includes(org._id)) {
  //   //     this.organisationList.push(org);
  //   //   }
  //   // });
  // }

  deleteSelectBox() {
    this.select_box = false;
    this.add_more_btn = true;
    this.cancel_btn = false;
  }

  hideActivityModel() {
    this.closeAble = false;
    this.activityLogsModal.close();
  }

  hideAddActivityModel() {
    this.closeAble = false;
    this.activityLogsAddModal.close();
  }

  deleteModelPopUp(channelId, orgId, isRemoveOrg) {
    this.deleteIds = {
      channelId: "",
      orgId: "",
      isRemoveOrg: false,
    };

    this.deleteIds = {
      channelId: channelId,
      orgId: orgId,
      isRemoveOrg: isRemoveOrg,
    };

    this.deleteModalBox = this.modalService.open(this.deleteModel, {
      windowClass: "activation-box invalid-access-box animated zoomIn faster",
      centered: true,
      backdrop: "static",
      keyboard: false,
    });
  }

  async deleteRecord() {
    this.deleteIds;
    this.logsmsg = [];
    this.closeAble = false;
    this.failApi = false;
    this.success = false;

    this.activityLogsModal = this.modalService.open(this.activityLogs, {
      windowClass: "activation-box invalid-access-box animated zoomIn faster",
      centered: true,
      backdrop: "static",
      keyboard: false,
    });

    try {
      this.logsmsg.push({
        msg: "Get channel configration.",
        icon: "loader.gif",
        index: 1,
      });
      await this.getChannelConfigApiRemove();

      if (this.deleteIds.isRemoveOrg) {
        this.logsmsg.push({
          msg: "Remove organisation from Channel.",
          icon: "loader.gif",
          index: 2,
        });
      } else {
        this.logsmsg.push({
          msg: "Remove organisation as admin from Channel.",
          icon: "loader.gif",
          index: 2,
        });
      }
      await this.removeOrgOrAdminFromChannelAPI();

      this.logsmsg.push({
        msg: "Update channel policy",
        icon: "loader.gif",
        index: 3,
      });
      await this.updateChannelAPIRemove();
    } catch (err) {}
  }

  // async reHitApiAddAsAdmin(index,data) {
  //   if (index == 1) {
  //     this.logsmsg[0].icon = 'loader.gif';
  //     await this.getChannelConfigApiAdd();

  //     this.logsmsg.push({ msg: 'Add organisation as Admin in channel', icon: 'loader.gif', index: 102, data: adminData });
  //     await this.addOrgAsAdminApis(data);

  //     this.logsmsg.push({ msg: 'Update channel policy', icon: 'loader.gif', index: 103 });
  //     await this.upddateChannelPolicyAsAdminApis(data)
  //   }
  //   if (index == 2) {
  //     this.logsmsg[1].icon = 'loader.gif';
  //     await this.addOrgAsAdminApis(data);

  //     this.logsmsg.push({ msg: 'Update channel policy', icon: 'loader.gif', index: 103 });
  //     await this.upddateChannelPolicyAsAdminApis(data)
  //   }
  //   if (index == 3) {
  //     this.logsmsg[2].icon = 'loader.gif';
  //     await this.updateChannelAPIRemove()
  //   }

  // }

  async getChannelConfigApiAdd() {
    return new Promise(async (resolve, reject) => {
      let getChannelConfig2 = await this.channelService
        .getChannelConfig(this.addOrganisation.controls["channelId"].value)
        .catch((err) => {
          this.logsmsg[this.incrementLogs].icon = "refresh.png";
          this.toastr.error(err.error.message.message);
          this.closeAble = true;
          this.failApi = true;
          reject();
          throw new Error();
        })
        .then((res) => {
          this.logsmsg[this.incrementLogs].icon = "check.png";
          resolve();
          this.incrementLogs++;
        });
    });
  }

  async addOrgAsAdminApis() {
    return new Promise(async (resolve, reject) => {
      let addOrgAsAdmin = await this.channelService
        .addOrgAsAdmin(this.adminData)
        .catch((err) => {
          this.logsmsg[this.incrementLogs].icon = "refresh.png";
          this.toastr.error(err.error.message);
          this.closeAble = true;
          this.failApi = true;
          reject();
          throw new Error();
        })
        .then((res) => {
          this.logsmsg[this.incrementLogs].icon = "check.png";
          resolve();
          this.incrementLogs++;
        });
    });
  }

  async upddateChannelPolicyAsAdminApis() {
    return new Promise(async (resolve, reject) => {
      let policy = await this.channelService
        .policy(this.policyData)
        .catch((err) => {
          this.logsmsg[this.incrementLogs].icon = "refresh.png";
          this.toastr.error(err.error.message);
          this.closeAble = true;
          this.failApi = true;
          reject();
          throw new Error();
        })
        .then((res) => {
          this.logsmsg[this.incrementLogs].icon = "check.png";
          this.incrementLogs++;
          this.success = true;
          this.closeAble = true;
          setTimeout(() => {
            this.getNetworkId(this.networkId);
            this.activityLogsAddModal.close();

            // this.router.navigate(['/inner-sidebar/channel']);
          }, 2000);
        });
    });
  }

  async reHittRemoveApi(index) {
    this.closeAble = false;
    this.failApi = false;
    this.success = false;
    if (index == 1) {
      this.logsmsg[0].icon = "loader.gif";
      await this.getChannelConfigApiRemove();

      if (this.deleteIds.isRemoveOrg) {
        this.logsmsg.push({
          msg: "Remove organisation from Channel.",
          icon: "loader.gif",
          index: 2,
        });
      } else {
        this.logsmsg.push({
          msg: "Remove organisation as admin from Channel.",
          icon: "loader.gif",
          index: 2,
        });
      }
      await this.removeOrgOrAdminFromChannelAPI();

      this.logsmsg.push({
        msg: "Update channel policy",
        icon: "loader.gif",
        index: 3,
      });
      await this.updateChannelAPIRemove();
    }
    if (index == 2) {
      this.logsmsg[1].icon = "loader.gif";
      await this.removeOrgOrAdminFromChannelAPI();

      this.logsmsg.push({
        msg: "Update channel policy",
        icon: "loader.gif",
        index: 3,
      });
      await this.updateChannelAPIRemove();
    }
    if (index == 3) {
      this.logsmsg[2].icon = "loader.gif";
      await this.updateChannelAPIRemove();
    }
  }

  async getChannelConfigApiRemove() {
    return new Promise(async (resolve, reject) => {
      let getChannelConfig = await this.channelService
        .getChannelConfig(this.deleteIds.channelId)
        .catch((err) => {
          this.logsmsg[0].icon = "refresh.png";
          this.toastr.error(err.error.message.message);
          this.closeAble = true;
          this.failApi = true;
          reject();
          throw new Error();
        })
        .then((res) => {
          this.logsmsg[0].icon = "check.png";
          this.logsmsg[0].success = true;
          resolve();
        });
    });
  }

  async removeOrgOrAdminFromChannelAPI() {
    return new Promise(async (resolve, reject) => {
      let deletePeerCouchDeployment = await this.channelService
        .removeOrgOrAdminFromChannel(this.deleteIds)
        .catch((err) => {
          this.logsmsg[1].icon = "refresh.png";
          this.toastr.error(err.error.message);
          this.closeAble = true;
          this.failApi = true;
          reject();
          throw new Error();
        })
        .then((res) => {
          this.logsmsg[1].icon = "check.png";
          this.logsmsg[1].success = true;
          resolve();
        });
    });
  }

  async updateChannelAPIRemove() {
    return new Promise(async (resolve, reject) => {
      let deletePeerCouchService = await this.channelService
        .updateChannel({
          channelId: this.deleteIds.channelId,
          orgId: this.deleteIds.orgId,
          isRemoveOrg: this.deleteIds.isRemoveOrg,
          isRemoveAdmin: true,
        })
        .catch((err) => {
          this.logsmsg[2].icon = "refresh.png";
          this.toastr.error(err.error.message);
          this.closeAble = true;
          this.failApi = true;
          reject();
          throw new Error();
        })
        .then((res) => {
          resolve();
          this.logsmsg[2].icon = "check.png";
          this.logsmsg[2].success = true;
          this.success = true;
          this.closeAble = true;
          this.addOrganisation.reset();
          setTimeout(() => {
            this.getNetworkId(this.networkId);
            this.activityLogsModal.close();
            // this.router.navigate(['/inner-sidebar/channel']);
          }, 2000);
        });
    });
  }

  exportChannel(id) {
    let data = { channelId: id };
    this.channelService.exportChannel(data).subscribe((res) => {
      this.dyanmicDownloadByHtmlTag({
        fileName: res.message.channelName + ".json",
        text: JSON.stringify(res.message),
      });
    });
  }

  private dyanmicDownloadByHtmlTag(arg: { fileName: string; text: string }) {
    if (!this.setting.element.dynamicDownload) {
      this.setting.element.dynamicDownload = document.createElement("a");
    }
    const element = this.setting.element.dynamicDownload;
    const fileType =
      arg.fileName.indexOf(".json") > -1 ? "text/json" : "text/plain";
    element.setAttribute(
      "href",
      `data:${fileType};charset=utf-8,${encodeURIComponent(arg.text)}`
    );
    element.setAttribute("download", arg.fileName);

    var event = new MouseEvent("click");
    element.dispatchEvent(event);
  }
}
