import {
  Component,
  OnInit,
  ViewChild,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import {
  FormGroup,
  Validators,
  FormBuilder,
  FormControl,
} from "@angular/forms";
import { ChainCodeService } from "./../chain-code.service";
import { HttpHeaders } from "@angular/common/http";
import { ToastrService } from "ngx-toastr";
import { ChannelService } from "./../../channel/channel.service";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ApiKeyService } from "./../../../api-key/api-key.service";
import { NgbTabChangeEvent, NgbTabset } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-instantiate",
  templateUrl: "./instantiate.component.html",
  styleUrls: ["./instantiate.component.scss"],
})
export class InstantiateComponent implements OnInit {
  instantiateForm: FormGroup;
  advance = false;
  closeAble = false;
  showErrorBtn = false;
  modellref;
  networkId;
  logsmsg = [];
  getArgsValue;
  success;
  argus;
  channelList;
  orgMSP;
  peerId;
  peerLength;
  incrementMsp: number = 0;
  incrementLogs: number = 0;
  instatiated = [];
  instantiatFinalData;
  p;
  orgData = [];
  peerList;
  instantiateChannelIds = [];
  showUpgradeOption = false;
  collectionDataEmptyErr = false;
  showViewAddButton = false;

  @Input() id: string;
  @Input() maxSize: number;
  @Output() pageChange: EventEmitter<number>;
  @Output() pageBoundsCorrection: EventEmitter<number>;

  @ViewChild("content", { static: false }) private content;
  @ViewChild("endorsementTabs", { static: true }) private endorsementTabs;
  constructor(
    private formBuilder: FormBuilder,
    private ChainCodeService: ChainCodeService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private Router: Router,
    private route: ActivatedRoute,
    private apiKeyService: ApiKeyService,
    private channelService: ChannelService
  ) {}

  async ngOnInit() {
    this.apiKeyService.getToken("").then((res) => {
      localStorage.setItem("token", res.data.token);
    });
    await this.instantiateFields();
    await this.getChainCodeIds();
    // this.getPrivateCollections();
    // await this.getPrivateCollections();
    this.networkId = localStorage.getItem("netWorkId");
    if (this.networkId) {
      await this.getChannelList();
      // await this.getPrivateCollections();
      if (localStorage.getItem("setInstantiateDataByCollection")) {
        await this.getInstantiateDataByCollection();
      }
    }
  }
  beforeChange($event: NgbTabChangeEvent) {
    this.addFeild();
  }

  getChannelList() {
    this.channelService.getChannelList(this.networkId).subscribe(
      (res) => {
        this.channelList = res.data;
      },
      (err) => {
        this.toastr.error(err.error.message);
      }
    );
  }

  getChannelOrganisations(event) {
    let selectedChannel = "";
    this.showUpgradeOption = false;
    this.instantiateForm.controls["upgrade"].setValue("");
    if (event.target.value != "") {
      selectedChannel = event.target.value;
      this.channelService.getChannelDetail(event.target.value).subscribe(
        (res) => {
          let uniqueNamesArr = [];
          res.data.channelorgs.forEach((data) => {
            if (!uniqueNamesArr.includes(data.organisation.mspId)) {
              uniqueNamesArr.push(data.organisation.mspId);
            }
          });
          this.orgMSP = uniqueNamesArr;
          this.showUpgradeOption = false;
          this.instantiateForm.controls["upgrade"].setValue("");
          if (this.instantiateChannelIds.includes(selectedChannel)) {
            this.showUpgradeOption = true;
          }
        },
        (err) => {
          this.toastr.error(err.error.message);
        }
      );

      this.ChainCodeService.getTargetPeer(
        event.target.value,
        this.instantiateForm.value.chaincodeId
      ).subscribe(
        (res) => {
          if (res.data.targetPeers.length) {
            let peerId = res.data.targetPeers[0].joinedpeer;

            this.instantiateForm.controls["peerId"].setValue(peerId);
          } else {
            this.toastr.error(
              "Chaincode not installed on any peer,Please select other channel"
            );
            this.instantiateForm.controls.channelId.setValue("");
          }

          //this.peerList = res.data.targetPeers;
        },
        (err) => {
          this.toastr.error(err.error.message);
        }
      );
    }
  }

  getChainCodeIds() {
    let uniqueNames = [];
    this.instatiated = [];
    let peerId = "";
    this.ChainCodeService.getChainCodeData().subscribe((record) => {
      if (record === null || record === "") {
        this.Router.navigate(["/inner-sidebar/chaincode"]);
        return false;
      }
      this.instantiateForm.controls["chaincodeId"].setValue(record._id);
      this.instantiateForm.controls["chainCodeName"].setValue(record.name);

      this.ChainCodeService.instantiatedChainCodeChannelList(
        record._id
      ).subscribe((res) => {
        this.instatiated = res.data;
        for (let data of this.instatiated) {
          this.instantiateChannelIds.push(data.channelId);
        }
      });
    });
  }

  instantiateFields() {
    this.instantiateForm = this.formBuilder.group({
      chaincodeId: [""],
      channelId: ["", Validators.required],
      fcn: ["", Validators.required],
      // args: ['', Validators.required],
      args: [""],
      endorsement: ["and", Validators.required],
      peerId: [""],
      chainCodeName: [""],
      upgrade: [""],
      pvDataConfig: ["false"],
    });
  }

  hideActivityModel() {
    this.closeAble = false;
    this.showErrorBtn = true;
    this.modellref.close();
    this.argus = "";
  }

  reHittApi(index, logLocation) {
    this.closeAble = false;
    this.showErrorBtn = false;
    if (index == 1) {
      this.logsmsg[logLocation].icon = "loader.gif";
      this.chaincodeInstantiateApi();
    }

    if (index == 2) {
      this.logsmsg[logLocation].icon = "loader.gif";
      this.upgradeChaincodeApi();
    }
  }

  async submit() {
    let self = this;
    this.logsmsg = [];
    this.closeAble = false;
    this.showErrorBtn = false;
    this.incrementLogs = 0;
    this.incrementMsp = 0;
    this.getArgsValue = this.instantiateForm.controls["args"].value;

    for (const c of Object.keys(this.instantiateForm.controls)) {
      this.instantiateForm.controls[c].markAsTouched();
    }

    if (this.instantiateForm.invalid || this.collectionDataEmptyErr) {
      return;
    }

    this.argus = this.instantiateForm.value.args.split(",");
    this.instantiateForm.controls["args"].setValue(this.argus);
    this.modellref = this.modalService.open(this.content, {
      windowClass: "activation-box animated zoomIn faster",
      centered: true,
      backdrop: "static",
      keyboard: false,
    });

    let instantiateData = {
      chaincodeId: this.instantiateForm.controls["chaincodeId"].value,
      channelId: this.instantiateForm.controls["channelId"].value,
      peerId: this.instantiateForm.controls["peerId"].value,
      fcn: this.instantiateForm.controls["fcn"].value,
      args: this.instantiateForm.controls["args"].value,
      endorsement: this.instantiateForm.controls["endorsement"].value,
      org: this.orgMSP,
      peerLength: this.peerLength,
    };

    this.instantiatFinalData = await this.ccInstantiate(instantiateData);
    // this.instantiatFinalData = await this.getPrivateCollections(this.instantiatFinalData);

    // console.log('instantiatFinalData', JSON.stringify(this.instantiatFinalData));

    // return;

    if (this.instantiateForm.value.upgrade) {
      this.logsmsg.push({
        msg: "Upgrade chaincode.",
        icon: "loader.gif",
        index: 2,
        logLocation: this.incrementLogs,
      });
      this.upgradeChaincodeApi();
    } else {
      this.logsmsg.push({
        msg: "Instantiate chaincode.",
        icon: "loader.gif",
        index: 1,
        logLocation: this.incrementLogs,
      });
      this.chaincodeInstantiateApi();
    }
  }

  async chaincodeInstantiateApi() {
    try {
      let instanceRes = await this.ChainCodeService.instantiate(
        this.instantiatFinalData
      ).catch((error) => {
        if (!error.error.message) {
          this.toastr.error("Something Went Wrong");
          throw new Error();
        }
        this.instantiateForm.controls["args"].setValue(this.getArgsValue);
        // this.logsmsg[this.incrementLogs].icon = 'cross.png';
        this.logsmsg[this.incrementLogs].icon = "refresh.png";
        this.closeAble = true;
        this.showErrorBtn = true;
        this.toastr.error(error.error.message);
        throw new Error();
      });

      this.logsmsg[this.incrementLogs].icon = "check.png";
      this.logsmsg[this.incrementLogs].success = true;
      this.success = true;
      this.closeAble = true;
      this.toastr.success("Chain Code has been successfully instantiated");
      setTimeout(() => {
        this.modellref.close();
        this.Router.navigate(["inner-sidebar/chaincode/"]);
        // self.chainCodeForm.reset()
      }, 2000);
    } catch (error) {
      console.log();
    }
  }

  async upgradeChaincodeApi() {
    try {
      let instanceRes = await this.ChainCodeService.upgradeChaincode(
        this.instantiatFinalData
      ).catch((error) => {
        if (!error.error.message) {
          this.toastr.error("Something Went Wrong");
        } else {
          this.toastr.error(error.error.message);
        }
        this.instantiateForm.controls["args"].setValue(this.getArgsValue);
        // this.logsmsg[this.incrementLogs].icon = 'cross.png';
        this.logsmsg[this.incrementLogs].icon = "refresh.png";
        this.closeAble = true;
        this.showErrorBtn = true;
        throw new Error();
      });

      this.logsmsg[this.incrementLogs].icon = "check.png";
      this.logsmsg[this.incrementLogs].success = true;
      this.success = true;
      this.closeAble = true;
      this.toastr.success("Chain Code has been successfully upgraded");
      setTimeout(() => {
        this.modellref.close();
        this.Router.navigate(["inner-sidebar/chaincode/"]);
        // self.chainCodeForm.reset()
      }, 2000);
    } catch (error) {
      console.log();
    }
  }

  addFeild() {
    this.advance = !this.advance;
    // alert(this.advance)
    if (!this.advance) {
      this.instantiateForm.controls["endorsement"].setValue("and");
    } else {
      this.instantiateForm.controls["endorsement"].setValue("");
    }

    this.instantiateForm.controls["endorsement"].markAsUntouched();
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
      peerId: endorsementJsonObj.peerId,
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
      endorsementJsonObj.org.forEach((orgMSPId) => {
        endorsementData.identities.push({
          role: {
            name: "peer",
            mspId: orgMSPId,
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

    if (
      this.instantiateForm.value.pvDataConfig == "true" &&
      localStorage.getItem("collectionData") &&
      JSON.parse(localStorage.getItem("collectionData")).length
    ) {
      instantiateData["pvDataConfig"] = JSON.parse(
        localStorage.getItem("collectionData")
      );
    }
    return instantiateData;
  }

  //check CoolectionData available
  checkCoolectionData() {
    this.collectionDataEmptyErr = false;
    this.showViewAddButton = false;
    if (this.instantiateForm.value.pvDataConfig == "true") {
      this.showViewAddButton = true;
      if (
        !localStorage.getItem("collectionData") ||
        !JSON.parse(localStorage.getItem("collectionData")).length
      ) {
        this.collectionDataEmptyErr = true;
      }
    }
  }

  viewAndAddCollection() {
    // alert();
    this.ChainCodeService.setInstantiateData(this.instantiateForm.value);
    this.Router.navigate(["/inner-sidebar/chaincode/private-data-collection"]);
  }

  getChannelOrganisationsAfter(val) {
    let selectedChannel = "";
    this.showUpgradeOption = false;
    this.instantiateForm.controls["upgrade"].setValue("");
    if (val != "") {
      selectedChannel = val;
      this.channelService.getChannelDetail(val).subscribe(
        (res) => {
          let uniqueNamesArr = [];
          res.data.channelorgs.forEach((data) => {
            if (!uniqueNamesArr.includes(data.organisation.mspId)) {
              uniqueNamesArr.push(data.organisation.mspId);
            }
          });
          this.orgMSP = uniqueNamesArr;
          this.showUpgradeOption = false;
          this.instantiateForm.controls["upgrade"].setValue("");
          if (this.instantiateChannelIds.includes(selectedChannel)) {
            this.showUpgradeOption = true;
          }
        },
        (err) => {
          this.toastr.error(err.error.message);
        }
      );

      this.ChainCodeService.getTargetPeer(
        val,
        this.instantiateForm.value.chaincodeId
      ).subscribe(
        (res) => {
          if (res.data.targetPeers.length) {
            let peerId = res.data.targetPeers[0].joinedpeer;

            this.instantiateForm.controls["peerId"].setValue(peerId);
          } else {
            this.toastr.error(
              "Chaincode not installed on any peer,Please select other channel"
            );
            this.instantiateForm.controls.channelId.setValue("");
          }

          //this.peerList = res.data.targetPeers;
        },
        (err) => {
          this.toastr.error(err.error.message);
        }
      );
    }
  }

  getInstantiateDataByCollection() {
    this.ChainCodeService.getInstantiateDataByCollection().subscribe((data) => {
      // console.log(data);

      if (data) {
        this.instantiateForm.controls["chaincodeId"].setValue(data.chaincodeId);
        this.instantiateForm.controls["channelId"].setValue(data.channelId);
        this.instantiateForm.controls["fcn"].setValue(data.fcn);
        this.instantiateForm.controls["args"].setValue(data.args);
        this.instantiateForm.controls["endorsement"].setValue(data.endorsement);
        this.instantiateForm.controls["peerId"].setValue(data.peerId);
        this.instantiateForm.controls["chainCodeName"].setValue(
          data.chainCodeName
        );
        this.instantiateForm.controls["upgrade"].setValue(data.upgrade);
        this.instantiateForm.controls["pvDataConfig"].setValue(
          data.pvDataConfig
        );

        if (
          data.endorsement != "" &&
          data.endorsement != "and" &&
          data.endorsement != "or"
        ) {
          // this.advance = true;
          this.endorsementTabs.select("tab2");
          // this.addFeild();
          this.instantiateForm.controls["endorsement"].setValue(
            data.endorsement
          );
        }
        this.checkCoolectionData();

        // if (data.pvDataConfig == 'true'){}

        this.getChannelOrganisationsAfter(data.channelId);
      }

      // console.log('data', data);
      // if(data){

      //   this.chainCodeService.setInstantiateDataByCollection(data);
      // }
      // newData = data;
    });
  }

  ngOnDestroy() {
    this.ChainCodeService.setInstantiateDataByCollection(null);
    localStorage.removeItem("setInstantiateDataByCollection");
  }
}
