import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import { ChainCodeService } from "./../chain-code.service";
import { OrganisationService } from "./../../organisation/organisation.service";
import { PeerService } from "./../../peer/peer.service";
import { ChannelService } from "./../../channel/channel.service";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ApiKeyService } from "./../../../api-key/api-key.service";
declare var $: any;

@Component({
  selector: "app-create-chaincode",
  templateUrl: "./create-chaincode.component.html",
  styleUrls: ["./create-chaincode.component.scss"],
})
export class CreateChaincodeComponent implements OnInit, AfterViewInit {
  constructor(
    private formBuilder: FormBuilder,
    private ChainCodeService: ChainCodeService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private organisationService: OrganisationService,
    private PeerService: PeerService,
    private Router: Router,
    private channelService: ChannelService,
    private apiKeyService: ApiKeyService
  ) {}

  public fileData;
  networkId;
  url;
  members;
  resultStatus;
  value: number = 0;
  errorArr = [];
  closeAble = false;
  showErrorBtn = false;
  incrementLogs: number = 0;
  incrementMsp: number = 0;
  invalidAccessModel;
  modellref;
  logsmsg = [];
  success;
  argus;
  showPeer;
  channelList;
  advance = false;
  peerData = [];
  allPeer;
  multiOrgId = [];
  allPeerId = [];
  getPeerId;
  peerValue = [];
  orgMSP = [];
  membersId;
  getArgsValue;
  checkPeerLength = true;
  formData;
  chaincodeId;
  fileName;
  peersOrgData = [];
  selectedPeersOrgData = [];

  chainCodeForm: FormGroup;
  @ViewChild("content", { static: false }) private content;
  @ViewChild("invalidAccess", { static: false }) private invalidAccess;

  ngOnInit() {
    if (localStorage.getItem("netWorkId") != null) {
      this.networkId = localStorage.getItem("netWorkId");
      this.getOrganisationList(this.networkId);
      this.getChannelList();
    }
    this.chainCodeFields();
    this.apiKeyService.getToken("").then((res) => {
      localStorage.setItem("token", res.data.token);
    });
  }

  getOrganisationList(networkId) {
    this.organisationService
      .listOrganisationsByNetwork(networkId)
      .subscribe((res) => {
        this.members = res.data;
        //this.members = this.allOrgData.data;

        this.members = this.members.filter((data) => data.type === 0);
        this.members.forEach((org) => {
          org.peer.forEach((peers) => {
            this.peersOrgData.push(peers);
          });
        });
        this.getMember(networkId);
        $(document).ready(function () {
          $("#member").chosen("destroy");
          $("#member").chosen({ max_selected_options: 10 });
        });
      });
  }

  getChannelList() {
    let self = this;
    this.channelService.getChannelList(this.networkId).subscribe(
      (res) => {
        this.channelList = res.data;
      },
      (err) => {
        this.toastr.error(err.error.message);
      }
    );
  }

  omit_special_char(event) {
    var k;
    k = event.charCode; //         k = event.keyCode;  (Both can be used)
    if (
      (k > 64 && k < 91) ||
      (k > 96 && k < 123) ||
      k == 8 ||
      k == 45 ||
      (k >= 48 && k <= 57)
    ) {
      return k;
    } else {
      this.toastr.error(
        "Only Alpha-Numeric small characters  and Hyphen (-) are allowed"
      );
      return false;
    }
  }

  getMember(networkId) {
    let self = this;
    let orgData = [];
    this.showPeer = true;
    this.PeerService.listPeersByNetwork(networkId).subscribe(
      (response) => {
        this.allPeer = response.data;
        $(document).ready(() => {
          $("#peerDropDown").chosen("destroy");
          $("#peerDropDown")
            .chosen()
            .change(() => {
              orgData = [];
              self.allPeerId = [];
              this.selectedPeersOrgData = [];
              for (const i of Object.keys($("#peerDropDown").chosen().val())) {
                let peerId = $("#peerDropDown")
                  .chosen()
                  .val()
                  [i].split(":")[1]
                  .trim()
                  .split("'")[1];
                self.allPeerId.push(peerId);
                this.selectedPeersOrgData.push(
                  this.peersOrgData.find((peer) => peer._id == peerId)
                );
              }
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
              self.chainCodeForm.controls.peer.setValue(self.allPeerId);
            });
        });
      },
      (error) => {
        // console.log('error block');
      }
    );
  }

  chainCodeFields() {
    this.chainCodeForm = this.formBuilder.group({
      name: ["", Validators.required],
      version: ["", Validators.required],
      sequence: ["", Validators.required],
      type: ["golang", Validators.required],
      chaincode: ["", Validators.required],
      channel: [""],
      organisation_id: ["", Validators.required],
      peer: ["", Validators.required],
      chaincodeId: [""],
      channelId: [""],
      fcn: [""],
      args: [""],
      endorsement: ["or"],
      org_id: [],
    });
  }

  ngAfterViewInit() {
    if (localStorage.getItem("netWorkId") == null) {
      this.showInvaildAccessModal();
    }
    let self = this;
    $(document).ready(function () {
      $("#member").chosen("destroy");
      $("#member")
        .chosen({ max_selected_options: 5 })
        .change((event) => {
          self.peerData = [];
          self.multiOrgId = [];
          self.orgMSP = [];
          self.membersId = "";
          for (const i of Object.keys($("#member").chosen().val())) {
            self.membersId = $("#member")
              .chosen()
              .val()
              [i].split(":")[1]
              .trim()
              .split("'")[1];
            self.peerData.push(
              self.members.filter((data) => data._id == self.membersId)[0]
            );
            self.multiOrgId.push(self.membersId);
          }
          self.orgMSP = $("#member")
            .find("option:selected")
            .text()
            .trim()
            .split(" ");
          self.chainCodeForm.controls.organisation_id.patchValue(
            self.multiOrgId
          );
          $("#peerDropDown").chosen("destroy");
          $(document).ready(function () {
            $("#peerDropDown").chosen();
          });
        });
    });
    $("#peerDropDown").chosen("destroy");
    $("#peerDropDown").chosen();
  }

  goToNetworkList() {
    this.invalidAccessModel.close();
    this.Router.navigate(["/network"]);
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
    this.showErrorBtn = true;
    this.modellref.close();
  }

  uploadFile(event) {
    this.fileName = event.target.files[0].name;
  }

  onFileChange(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.fileData = file;
      this.fileName = event.target.files[0].name;
    }
  }

  addFeild() {
    this.advance = !this.advance;
    if (!this.advance) {
      this.chainCodeForm.controls["endorsement"].setValue("and");
    } else {
      this.chainCodeForm.controls["endorsement"].setValue("");
    }
    this.chainCodeForm.controls["endorsement"].markAsUntouched();
  }

  ChainCodeServiceApi() {
    return new Promise(async (resolve, reject) => {
      let response = await this.ChainCodeService.upload(this.formData).catch(
        (error) => {
          if (!error.error.message) {
            this.toastr.error("Something Went Wrong");
            reject();
            throw new Error();
          }
          this.toastr.error(error.error.message);
          this.chainCodeForm.controls["args"].setValue(this.getArgsValue);
          this.logsmsg[this.incrementLogs].icon = "refresh.png";
          this.logsmsg[this.incrementLogs].success = "no";
          this.closeAble = true;
          this.showErrorBtn = true;
          reject();
          throw new Error();
        }
      );
      //Success Block
      this.logsmsg[this.incrementLogs].icon = "check.png";
      this.incrementLogs++;
      this.chainCodeForm.controls["chaincodeId"].setValue(response.data._id);
      this.chaincodeId = response.data._id;
      resolve();
    });
  }

  async installChaniCodeApi() {
    let ele = this.selectedPeersOrgData;
    this.resultStatus = false;
    let self = this;
    this.value = 0;
    for (let a = this.value; a < ele.length; a++) {
      //   this.logsmsg.push({ msg: 'Install chaincode.' + this.orgMSP[this.incrementMsp], icon: 'loader.gif' });
      let peersArr = [];
      ele[a].peers.forEach((peers) => {
        peersArr.push(peers.peerId);
      });
      if (this.formData.has("org_id")) {
        this.formData.delete("org_id");
        this.formData.append("org_id", ele[a].orgId);
        this.chainCodeForm.controls["peer"].setValue(peersArr);
      } else {
        this.formData.append("org_id", ele[a].orgId);
        this.chainCodeForm.controls["peer"].setValue(peersArr);
      }

      let chainCodeData = {
        chaincodeId: this.chaincodeId,
        peerIds: this.chainCodeForm.controls["peer"].value,
        channelId: this.chainCodeForm.value.channelId,
      };

      //    this.logsmsg.push({ msg: 'Install chaincode.' + this.orgMSP[this.incrementMsp], icon: 'loader.gif', index: 3, data: chainCodeData, mspName: this.orgMSP[this.incrementMsp], loopIndex: this.incrementLogs, loop: a });
      if (this.orgMSP[this.incrementMsp]) {
        this.logsmsg[this.incrementLogs] = {
          msg: "Install chaincode on " + this.orgMSP[this.incrementMsp],
          icon: "loader.gif",
          index: 3,
          data: chainCodeData,
          mspName: this.orgMSP[this.incrementMsp],
          loopIndex: this.incrementLogs,
          loop: a,
        };
        /// Instal apiiiiii
        let installRes = await this.ChainCodeService.installChaniCode(
          chainCodeData
        ).catch((error) => {
          if (!error.error.message) {
            this.toastr.error("Something Went Wrong");
            throw new Error();
          }
          this.chainCodeForm.controls["args"].setValue(this.getArgsValue);
          this.logsmsg[this.incrementLogs].icon = "refresh.png";
          this.logsmsg[this.incrementLogs].success = "no";
          this.toastr.error(error.error.message);
          this.closeAble = true;
          this.showErrorBtn = true;
          throw new Error();
          //reject();
        });
        ////Success Block
        self.logsmsg[this.incrementLogs].icon = "check.png";
        this.incrementLogs++;
        this.incrementMsp++;
        this.resultStatus = true;
      }
    }
    if (!this.errorArr.length) {
      this.success = true;
      self.closeAble = true;
      localStorage.setItem(
        "channelId",
        this.chainCodeForm.controls["channel"].value
      );
      setTimeout(function () {
        self.modellref.close();
        self.Router.navigate(["inner-sidebar/chaincode/"]);
        // self.chainCodeForm.reset()
      }, 2000);
    }
  }

  async rehitApi(index, data, mspName, loopIndex, loop) {
    this.closeAble = false;
    this.showErrorBtn = false;
    if (index == 2) {
      this.logsmsg[loopIndex] = {
        msg: "Upload chaincode.",
        icon: "loader.gif",
        index: 2,
        data: data,
      };
      await this.ChainCodeServiceApi();
    }
    if (index == 3) {
      this.logsmsg[loopIndex] = {
        msg: "Install chaincode on" + mspName,
        icon: "loader.gif",
        index: 3,
        data: data,
        mspName: mspName,
        loopIndex: loopIndex,
        loop: loop,
      };
      const result = await this.installChaniCodeApi();
      if (this.resultStatus == true) {
        this.value = loop + 1;
        await this.installChaniCodeApi();
      }
    }
  }

  async submit() {
    for (const c of Object.keys(this.chainCodeForm.controls)) {
      this.chainCodeForm.controls[c].markAsTouched();
    }

    if (this.chainCodeForm.invalid) {
      return;
    }

    if (
      this.chainCodeForm.value.organisation_id.length !=
      this.selectedPeersOrgData.length
    ) {
      this.toastr.error(
        "please select atleast one peer of each consortium member "
      );
      return;
    }

    try {
      let i: number;
      let prop: any;
      this.logsmsg = [];
      let self = this;
      this.logsmsg = [];
      this.closeAble = false;
      this.showErrorBtn = false;
      this.incrementLogs = 0;
      this.incrementMsp = 0;
      this.getArgsValue = this.chainCodeForm.controls["args"].value;
      this.formData = new FormData();
      this.formData.append("name", this.chainCodeForm.get("name").value);
      this.formData.append("version", this.chainCodeForm.get("version").value);
      this.formData.append(
        "sequence",
        this.chainCodeForm.get("sequence").value
      );

      this.formData.append("type", this.chainCodeForm.get("type").value);
      this.formData.append("chaincode", this.fileData);
      this.formData.append(
        "organisation_id",
        this.chainCodeForm.get("organisation_id").value
      );
      this.formData.append("peer", this.chainCodeForm.get("peer").value);
      // this.formData.append('org_id', this.chainCodeForm.get('organisation_id').value);
      this.formData.append("networkId", this.networkId);

      this.argus = this.chainCodeForm.value.args.split(",");
      this.chainCodeForm.controls["args"].setValue(this.argus);

      this.modellref = this.modalService.open(this.content, {
        windowClass: "activation-box animated zoomIn faster",
        centered: true,
        backdrop: "static",
        keyboard: false,
      });

      this.logsmsg.push({
        msg: "Upload chaincode.",
        icon: "loader.gif",
        index: 2,
        data: this.formData,
        mspName: this.orgMSP[this.incrementMsp],
        loopIndex: this.incrementLogs,
      });
      /// uplaod api
      await this.ChainCodeServiceApi();

      await this.installChaniCodeApi();
    } catch (err) {
      console.log("error");
    }
  }

  ccInstantiate(endorsementJsonObj) {
    var lengthOf = endorsementJsonObj.org.length + "-of";
    var increment = 0;
    var forPolicy = [];

    //data for instantiate
    let instantiateData = {
      chaincodeId: endorsementJsonObj.chaincodeId,
      channelId: endorsementJsonObj.channelId,
      fcn: endorsementJsonObj.fcn,
      args: endorsementJsonObj.args,
    };

    //if endorsement is "AND" or "OR"
    let endorsementData = {
      identities: [],
      policy: {},
    };

    if (
      endorsementJsonObj.endorsement == "and" ||
      endorsementJsonObj.endorsement == "or"
    ) {
      endorsementJsonObj.org.forEach((element) => {
        endorsementData.identities.push({
          role: {
            name: "peer",
            mspId: element,
          },
        });
        forPolicy.push({
          "signed-by": increment,
        });
        increment++;
      });
    } else {
      instantiateData["endorsement"] = endorsementJsonObj.endorsement;
    }

    //if endorsement == AND
    if (endorsementJsonObj.endorsement == "and") {
      endorsementData.policy[lengthOf] = forPolicy;
      instantiateData["endorsement"] = endorsementData;
    }

    //if endorsement == OR
    if (endorsementJsonObj.endorsement == "or") {
      endorsementData.policy["1-of"] = forPolicy;

      instantiateData["endorsement"] = endorsementData;
    }

    return instantiateData;
  }
}
