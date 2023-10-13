import { PeerService } from "./../../peer/peer.service";
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  QueryList,
  ViewChildren,
  OnChanges,
} from "@angular/core";
import {
  FormBuilder,
  FormArray,
  FormGroup,
  Validators,
  FormControl,
} from "@angular/forms";
import { OrganisationService } from "./../organisation.service";
import { NetworkService } from "./../../../network/network.service";
import { ApiKeyService } from "./../.././../api-key/api-key.service";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";
import { async } from "q";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
declare var $: any;

@Component({
  selector: "app-create-organisation",
  templateUrl: "./create-organisation.component.html",
  styleUrls: ["./create-organisation.component.scss"],
  providers: [PeerService],
})
export class CreateOrganisationComponent implements OnInit {
  adding_admin_loading_img = false;
  add_new_admin_button = true;
  showAdmin = false;
  closeAble = false;
  pwdShow = false;
  organisationForm: FormGroup;
  showPwd = "password";
  clusterList;
  caList;
  tlsCaList;
  peerName = [];
  validPeerName = true;
  add_CA_guide = true;
  responseData;
  adminList;
  orgId;
  success = false;
  modellref;
  invalidAccessModel;
  checkallapis = false;
  failApi = false;
  errormsg = [];
  height;
  checkSuccess = [];
  getPeerName = [];
  ClusterArray = [];
  logsmsg = [];
  crossError;
  logmsg = [
    { key: "object", msg: `creating peer12 `, icon: "loader.gif" },
    {
      key: "array",
      msgs: [
        { msg: `creating peer rtdfgyuhij `, icon: "loader.gif" },
        { msg: `creating peer rtfgyuh `, icon: "loader.gif" },
      ],
    },
    { key: "text", msg: `creating peer12 `, icon: "loader.gif" },
  ];
  @ViewChild("content", { static: false }) private content;
  @ViewChild("invalidAccess", { static: false }) private invalidAccess;
  @ViewChildren("peer_input") private peer_input;

  constructor(
    private formBuilder: FormBuilder,
    private Router: Router,
    private _organisationService: OrganisationService,
    private NetworkService: NetworkService,
    private PeerService: PeerService,
    private apiKeyService: ApiKeyService,
    private toastr: ToastrService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.organisationForm = this.formBuilder.group({
      name: ["", Validators.required],
      mspId: ["", Validators.required],
      type: ["0", Validators.required],
      tlsCaId: ["", Validators.required],
      caId: ["", Validators.required],
      adminId: ["", Validators.required],
      clusterId: ["", Validators.required],
      networkId: [""],
      peerRows: this.formBuilder.array([this.initPeerRows()]),
    });

    if (localStorage.getItem("netWorkId")) {
      this.organisationForm.patchValue({
        networkId: localStorage.getItem("netWorkId"),
      });
      this.getClusters(localStorage.getItem("netWorkId"));

      this.getAllCertificateAuthority(localStorage.getItem("netWorkId"));
    }
    this.apiKeyService.getToken("").then((res) => {
      localStorage.setItem("token", res.data.token);
    });
  }

  ngAfterViewInit() {
    if (localStorage.getItem("netWorkId") == null) {
      this.showInvaildAccessModal();
    }
  }

  goToNetworkList() {
    this.invalidAccessModel.close();
    this.Router.navigate(["/network"]);
  }

  showInvaildAccessModal() {
    this.invalidAccessModel = this.modalService.open(this.invalidAccess, {
      windowClass: "activation-box invalid-access-box animated  zoomIn faster",
      centered: true,
      backdrop: "static",
      keyboard: false,
    });
  }

  //hide Activity Model
  hideActivityModel() {
    this.closeAble = false;
    this.modellref.close();
    //this.Router.navigate(['/inner-sidebar/consortium-member']);
  }

  getClusters(networkId) {
    this.NetworkService.networkInfo(networkId).subscribe(
      (response) => {
        this.clusterList = response.data.cluster;
      },
      (err) => {
        this.toastr.error(err.error.message);
      }
    );
  }

  checkNAme(event) {
    this.peerName.push(event.target.value);
  }

  trim(feild, val) {
    let trimVal = val.trim();
    this.organisationForm.controls[feild].setValue(trimVal);
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

  special_char(event) {
    var k;
    k = event.charCode; //         k = event.keyCode;  (Both can be used)
    if (
      (k > 96 && k < 123) ||
      k == 8 ||
      k == 45 ||
      (k >= 48 && k <= 57) ||
      (k >= 65 && k <= 90)
    ) {
      return k;
    } else {
      this.toastr.error(
        "Only Alpha-Numeric characters  and Hyphen (-) are allowed"
      );
      return false;
    }
  }

  initPeerRows() {
    return this.formBuilder.group({
      peer_name: ["", Validators.required],
      peer_enroll_secret: ["", [Validators.required]],
      couchdbUsername: ["", Validators.required],
      couchdbPassword: ["", Validators.required],
      isPublic: ["true", Validators.required],
    });
  }

  get formArr() {
    return this.organisationForm.get("peerRows") as FormArray;
  }

  addNewRow() {
    this.formArr.push(this.initPeerRows());
    setTimeout(() => {
      $("#peerRows tr:last-child #peerName").focus();
    }, 0);
  }

  deleteRow(index: number) {
    if (this.organisationForm.controls.peerRows["controls"].length > 1) {
      this.formArr.removeAt(index);
      //this.formArr.splice(index, 1);
    } else {
      this.toastr.error("Minimum one Peer is required.");
    }
  }

  togglePassword(element) {
    this.pwdShow = !this.pwdShow;
    if (this.pwdShow) {
      element.target.previousElementSibling.type = "text";
    } else {
      element.target.previousElementSibling.type = "password";
    }
  }

  getAllCertificateAuthority(networkId) {
    this._organisationService
      .caList({ networkId: networkId })
      .subscribe((response) => {
        if (response.status === 1) {
          this.responseData = response.data;
          this.caList = this.responseData.filter((data) => data.isTLS === 0);
          this.tlsCaList = this.responseData.filter((data) => data.isTLS === 1);
        }
        if (this.tlsCaList.length) {
          this.organisationForm.controls["tlsCaId"].setValue(
            this.tlsCaList[0]._id
          );
        } else {
          this.toastr.error("TLS CA not found");
        }
      });
  }

  getAdmin(id) {
    if (this.organisationForm.value.caId != "") {
      this.adminList = [];

      this.organisationForm.controls["adminId"].setValue("");
      this.organisationForm.updateValueAndValidity();
      this.organisationForm.controls["adminId"].markAsUntouched();

      this._organisationService
        .getAdmins(this.organisationForm.value.caId)
        .subscribe(
          (response) => {
            this.adminList = response.data;

            let new_id = response.data.filter((data) => data._id == id);
            if (new_id.length) {
              this.organisationForm.controls["adminId"].setValue(new_id[0]._id);
              this.organisationForm.updateValueAndValidity();
            }
          },
          (err) => {
            this.toastr.info("Please create admin", "Admin not found for Ca");
            this.addAdmin();
          }
        );
    }
  }

  addOrganisation() {
    this.logsmsg = [];
    this.crossError = "";
    this.ClusterArray = [];

    let arr = this.organisationForm.controls["peerRows"] as FormArray;
    for (const c of Object.keys(this.organisationForm.controls)) {
      this.organisationForm.controls[c].markAsTouched();
      if (c == "peerRows") {
        for (const x of Object.keys(arr.controls)) {
          for (const z of Object.keys(arr.controls[x].controls))
            arr.controls[x].controls[z].markAsTouched();
        }
      }
    }

    // Object.keys(this.organisationForm.controls).forEach(key => {
    //   this.organisationForm.controls[name].setValue(this.organisationForm.controls[name].value.trim());
    // });
    this.organisationForm.controls["name"].setValue(
      this.organisationForm.controls["name"].value.trim()
    );
    this.organisationForm.controls["mspId"].setValue(
      this.organisationForm.controls["mspId"].value.trim()
    );

    if (this.peerName) {
      this.getPeerName = [];
      let peerArr = this.organisationForm.controls["peerRows"].value;
      peerArr.forEach((element) => {
        this.getPeerName.push(element.peer_name);
      });
      let self = this;
      let count = 1;
      this.getPeerName.forEach(function (value, index, arr) {
        let first_index = arr.indexOf(value);
        let last_index = arr.lastIndexOf(value);
        if (first_index !== last_index) {
          if (count == 1) {
            count++;
            self.toastr.error("Peer name should be unique");
            self.validPeerName = false;
            return false;
          }
        }
      });
    }

    if (this.validPeerName == false) {
      this.validPeerName = true;
      return false;
    }

    if (this.organisationForm.valid) {
      this.closeAble = false;
      this.checkallapis = false;
      this.failApi = false;
      this.logsmsg.push({
        key: "text",
        msg: "Creating consortium member.",
        icon: "loader.gif",
      });
      this.modellref = this.modalService.open(this.content, {
        windowClass: "activation-box-with-scroll animated zoomIn faster",
        centered: true,
        backdrop: "static",
        keyboard: false,
      });
      this._organisationService.add(this.organisationForm.value).subscribe(
        async (response) => {
          this.logsmsg[0].icon = "check.png";
          this.logsmsg.push({
            key: "text",
            msg: "Creating wallet.",
            icon: "loader.gif",
          });
          this.orgId = response.data._id;

          const bar = new Promise(async (resolve, reject) => {
            await this._organisationService
              .createWallet(response.data._id)
              .then((response) => {
                this.logsmsg[1].icon = "check.png";
              })
              .catch((error) => {
                if (!error.error.message) {
                  this.toastr.error("Something Went Wrong");
                } else {
                  this.toastr.error(error.error.message);
                }
                this.logsmsg[1].icon = "cross.png";
                this.crossError =
                  "Unable to create consortium member, Please try again later.";
                this.closeAble = true;
                this.failApi = true;
                reject();
                throw new Error();
              });
            resolve();
          });
          await bar;
          await this.addPeer(this.orgId);
        },
        (error) => {
          if (!error.error.message) {
            this.toastr.error("Something Went Wrong");
          } else {
            this.toastr.error(error.error.message);
          }
          this.logsmsg[0].icon = "cross.png";
          this.crossError =
            "Unable to create consortium member, Please try again later.";
          this.closeAble = true;
          this.failApi = true;
          throw new Error();
        }
      );
    }
  }

  addNewAdmin() {
    this.add_CA_guide = false;
    let registeredAdminId = "";
    let data = {
      caId: this.organisationForm.get("caId").value,
      admnId: this.organisationForm.get("newAdminId").value,
      admnSecret: this.organisationForm.get("newAdminSecret").value,
    };
    if (data.caId == "") {
      this.organisationForm.controls["caId"].markAsTouched();
      return;
    }

    this.adding_admin_loading_img = true;
    this.showAdmin = false;
    this.add_new_admin_button = false;
    this._organisationService.registerCaAdmin(data).subscribe(
      async (res) => {
        registeredAdminId = res.data._id;

        const bar = new Promise(async (resolve, reject) => {
          await this._organisationService
            .enrollCaAdmin({ _id: registeredAdminId })
            .then((res) => {
              this.adding_admin_loading_img = false;
              this.showAdmin = false;
              this.add_new_admin_button = true;
              this.add_CA_guide = true;

              this.getAdmin(registeredAdminId);

              this.organisationForm.removeControl("newAdminId");
              this.organisationForm.removeControl("newAdminSecret");
            })
            .catch((error) => {
              if (!error.error.message) {
                this.toastr.error("Something Went Wrong");
              } else {
                this.toastr.error(error.error.message);
              }
              this.adding_admin_loading_img = false;
              this.showAdmin = true;
              this.add_new_admin_button = true;
              this.add_CA_guide = false;
              reject();
              throw new Error();
            });
          resolve();
        });
        await bar;
        setTimeout(() => {}, 2000);
      },
      () => {
        this.adding_admin_loading_img = false;
        this.showAdmin = true;
        this.add_new_admin_button = true;
        this.add_CA_guide = false;
        // this.toastr.error("CA already exists");
      }
    );
  }

  addAdmin() {
    this.showAdmin = !this.showAdmin;
    this.add_CA_guide = !this.add_CA_guide;
    if (this.showAdmin) {
      this.organisationForm.addControl(
        "newAdminId",
        new FormControl("", Validators.compose([Validators.required]))
      );
      this.organisationForm.addControl(
        "newAdminSecret",
        new FormControl("", Validators.compose([Validators.required]))
      );
    } else {
      this.organisationForm.removeControl("newAdminId");
      this.organisationForm.removeControl("newAdminSecret");
    }
  }

  //pass couch DB parameter **************************

  registerPeerTrueApi(index, arrlocation, peerId, peerName, isPublic) {
    return new Promise(async (resolve, reject) => {
      let registerPeer = await this.PeerService.registerPeer(peerId, true)
        .catch((error) => {
          if (!error.error.message) {
            this.toastr.error("Something Went Wrong");
            reject();
            throw new Error();
          }
          this.logsmsg[arrlocation].innerlogs[2].icon = "refresh.png";
          this.toastr.error(error.error.message);
          this.crossError = "Unable to create peer(s), Please try again later.";
          this.closeAble = true;
          this.failApi = true;
          this.logsmsg[arrlocation].innerlogs[2].success = "no";
          reject();
          throw new Error();
        })
        .then((response) => {
          this.logsmsg[arrlocation].innerlogs[2].icon = "check.png";
          this.logsmsg[arrlocation].innerlogs.push({
            msg: `Enroll Peer ${peerName} with Registrar `,
            icon: "loader.gif",
            location: 2,
            arrlocation: arrlocation,
            index: index,
            data: peerId,
            peerName: peerName,
            isPublic: isPublic,
          });
          resolve();
        });
    });
  }

  enrollTrueApi(index, arrlocation, peerId, peerName, isPublic) {
    return new Promise(async (resolve, reject) => {
      const enroll = await this.PeerService.enrollPeer(peerId, true).catch(
        (error) => {
          if (!error.error.message) {
            this.toastr.error("Something Went Wrong");
            reject();
            throw new Error();
          }
          this.logsmsg[arrlocation].innerlogs[3].icon = "refresh.png";
          this.toastr.error(error.error.message);
          this.crossError = "Unable to create peer(s), Please try again later.";
          this.closeAble = true;
          this.failApi = true;
          this.logsmsg[arrlocation].innerlogs[3].success = "no";
          reject();
          throw new Error();
        }
      );
      this.logsmsg[arrlocation].innerlogs[3].icon = "check.png";
      this.logsmsg[arrlocation].innerlogs.push({
        msg: `Register Peer ${peerName} with  Root-CA `,
        icon: "loader.gif",
        location: 3,
        arrlocation: arrlocation,
        index: index,
        data: peerId,
        peerName: peerName,
        isPublic: isPublic,
      });

      resolve();
    });
  }

  registerPeerFalseApi(index, arrlocation, peerId, peerName, isPublic) {
    return new Promise(async (resolve, reject) => {
      const registerPeer = await this.PeerService.registerPeer(
        peerId,
        false
      ).catch((error) => {
        if (!error.error.message) {
          this.toastr.error("Something Went Wrong");
          reject();
          throw new Error();
        }
        this.logsmsg[arrlocation].innerlogs[4].icon = "refresh.png";
        this.toastr.error(error.error.message);
        this.crossError = "Unable to create peer(s), Please try again later.";
        this.closeAble = true;
        this.failApi = true;
        this.logsmsg[arrlocation].innerlogs[4].success = "no";
        reject();
        throw new Error();
      });
      this.logsmsg[arrlocation].innerlogs[4].icon = "check.png";
      this.logsmsg[arrlocation].innerlogs.push({
        msg: `Enroll peer ${peerName} with Root-CA `,
        icon: "loader.gif",
        location: 4,
        arrlocation: arrlocation,
        index: index,
        data: peerId,
        peerName: peerName,
        isPublic: isPublic,
      });

      resolve();
    });
  }

  enrollFalseApi(index, arrlocation, peerId, peerName, isPublic) {
    return new Promise(async (resolve, reject) => {
      const enrollPeer = await this.PeerService.enrollPeer(peerId, false).catch(
        (error) => {
          if (!error.error.message) {
            this.toastr.error("Something Went Wrong");
            reject();
            throw new Error();
          }
          this.logsmsg[arrlocation].innerlogs[5].icon = "refresh.png";
          this.toastr.error(error.error.message);
          this.crossError = "Unable to create peer(s), Please try again later.";
          this.closeAble = true;
          this.failApi = true;
          this.logsmsg[arrlocation].innerlogs[5].success = "no";
          reject();
          throw new Error();
        }
      );
      this.logsmsg[arrlocation].innerlogs[5].icon = "check.png";
      this.logsmsg[arrlocation].innerlogs.push({
        msg: `Generate Peer ${peerName} Msp `,
        icon: "loader.gif",
        location: 5,
        arrlocation: arrlocation,
        index: index,
        data: peerId,
        peerName: peerName,
        isPublic: isPublic,
      });

      resolve();
    });
  }
  // Pass Parameter %%*********************************
  generatePeerMsp(index, arrlocation, peerId, peerName, isPublic) {
    return new Promise(async (resolve, reject) => {
      const generatePeerMsp = await this.PeerService.generatePeerMsp(
        peerId
      ).catch((error) => {
        if (!error.error.message) {
          this.toastr.error("Something Went Wrong");
          reject();
          throw new Error();
        }
        this.logsmsg[arrlocation].innerlogs[6].icon = "refresh.png";
        this.toastr.error(error.error.message);
        this.crossError = "Unable to create peer(s), Please try again later.";
        this.closeAble = true;
        this.failApi = true;
        this.logsmsg[arrlocation].innerlogs[6].success = "no";
        reject();
        throw new Error();
      });
      this.logsmsg[arrlocation].innerlogs[6].icon = "check.png";
      this.logsmsg[arrlocation].innerlogs.push({
        msg: `Copy peer ${peerName} MaterialToNfs `,
        icon: "loader.gif",
        location: 6,
        arrlocation: arrlocation,
        index: index,
        data: peerId,
        peerName: peerName,
        isPublic: isPublic,
      });

      resolve();
    });
  }

  copyPeerMaterislToNfs(index, arrlocation, peerId, peerName, isPublic) {
    return new Promise(async (resolve, reject) => {
      const copyPeerMaterislToNfs = await this.PeerService.copyPeerMaterislToNfs(
        peerId
      ).catch((error) => {
        if (!error.error.message) {
          this.toastr.error("Something Went Wrong");
          reject();
          throw new Error();
        }
        this.logsmsg[arrlocation].innerlogs[7].icon = "refresh.png";
        this.toastr.error(error.error.message);
        this.crossError = "Unable to create peer(s), Please try again later.";
        this.closeAble = true;
        this.failApi = true;
        this.logsmsg[arrlocation].innerlogs[7].success = "no";
        reject();
        throw new Error();
      });
      this.logsmsg[arrlocation].innerlogs[7].icon = "check.png";
      this.logsmsg[arrlocation].innerlogs.push({
        msg: `Create Peer ${peerName} Service `,
        icon: "loader.gif",
        location: 7,
        arrlocation: arrlocation,
        index: index,
        data: peerId,
        peerName: peerName,
        isPublic: isPublic,
      });

      resolve();
    });
  }

  createPeerService(index, arrlocation, peerId, peerName, isPublic) {
    return new Promise(async (resolve, reject) => {
      const createPeerService = await this.PeerService.createPeerService(
        peerId
      ).catch((error) => {
        if (!error.error.message) {
          this.toastr.error("Something Went Wrong");
          reject();
          throw new Error();
        }
        this.logsmsg[arrlocation].innerlogs[8].icon = "refresh.png";
        this.toastr.error(error.error.message);
        this.crossError = "Unable to create peer(s), Please try again later.";
        this.closeAble = true;
        this.failApi = true;
        this.logsmsg[arrlocation].innerlogs[8].success = "no";
        reject();
        throw new Error();
      });
      this.logsmsg[arrlocation].innerlogs[8].icon = "check.png";
      this.logsmsg[arrlocation].innerlogs.push({
        msg: `Create Peer ${peerName} Deployment `,
        icon: "loader.gif",
        location: 8,
        arrlocation: arrlocation,
        index: index,
        data: peerId,
        peerName: peerName,
        isPublic: isPublic,
      });
      resolve();
    });
  }

  createPeerDeployment(index, arrlocation, peerId, peerName, isPublic) {
    return new Promise(async (resolve, reject) => {
      const createPeerDeployment = await this.PeerService.createPeerDeployment(
        peerId
      )
        .catch((error) => {
          if (!error.error.message) {
            this.toastr.error("Something Went Wrong");
            reject();
            throw new Error();
          }
          this.logsmsg[arrlocation].innerlogs[9].icon = "refresh.png";
          this.toastr.error(error.error.message);
          this.crossError = "Unable to create peer(s), Please try again later.";
          this.closeAble = true;
          this.failApi = true;
          this.logsmsg[arrlocation].innerlogs[9].success = "no";
          reject();
          throw new Error();
        })
        .then((response) => {
          this.logsmsg[arrlocation].innerlogs[9].icon = "check.png";
          this.logsmsg[arrlocation].innerlogs.push({
            msg: `Create Peer ${peerName} Couch Service `,
            icon: "loader.gif",
            location: 9,
            arrlocation: arrlocation,
            index: index,
            data: peerId,
            peerName: peerName,
            isPublic: isPublic,
          });
          resolve();
        });
    });
  }

  createPeerCouchService(index, arrlocation, peerId, peerName, isPublic) {
    return new Promise(async (resolve, reject) => {
      const data = {
        _id: peerId,
        isPublic: isPublic,
      };
      let createPeerCouchService = await this.PeerService.createPeerCouchService(
        data
      )
        .then((response) => {
          this.logsmsg[arrlocation].innerlogs[10].icon = "check.png";
          this.logsmsg[arrlocation].innerlogs.push({
            msg: `Create Peer ${peerName} Couch Deployment `,
            icon: "loader.gif",
            location: 10,
            arrlocation: arrlocation,
            index: index,
            data: peerId,
            peerName: peerName,
            isPublic: isPublic,
          });
          resolve();
        })
        .catch((error) => {
          if (!error.error.message) {
            this.toastr.error("Something Went Wrong");
            reject();
            throw new Error();
          }
          this.logsmsg[arrlocation].innerlogs[10].icon = "refresh.png";
          this.toastr.error(error.error.message);
          this.crossError = "Unable to create peer(s), Please try again later.";
          this.closeAble = true;
          this.failApi = true;
          this.logsmsg[arrlocation].innerlogs[10].success = "no";
          reject();
          throw new Error();
        });
    });
  }

  createPeerCouchDeployment(index, arrlocation, peerId, peerName, isPublic) {
    return new Promise(async (resolve, reject) => {
      let createPeerCouchDeployment = await this.PeerService.createPeerCouchDeployment(
        peerId
      )
        .then((response) => {
          this.logsmsg[arrlocation].innerlogs[11].icon = "check.png";
          this.checkSuccess.pop();
          if (!this.checkSuccess.length) {
            let self = this;
            this.success = true;
            this.checkallapis = true;
            this.closeAble = true;
            setTimeout(function () {
              self.modellref.close();
              self.Router.navigate(["/inner-sidebar/consortium-member"]);
            }, 2000);
          }
          resolve();
        })
        .catch((error) => {
          if (!error.error.message) {
            this.toastr.error("Something Went Wrong");
            reject();
            throw new Error();
          }
          //this.modellref.close();
          this.logsmsg[arrlocation].innerlogs[11].icon = "refresh.png";
          this.logsmsg[arrlocation].innerlogs[11].success = "no";
          this.toastr.error(error.error.message);
          this.crossError = "Unable to create peer(s), Please try again later.";
          this.closeAble = true;
          this.failApi = true;
          reject();
          throw new Error();
        });
    });
  }

  async rehitApi(location, index, arrlocation, peerId, peerName, isPublic) {
    if (location == 1) {
      this.checkallapis = false;
      this.failApi = false;
      //  this.logsmsg[arrlocation].innerlogs = {msg: `Register Peer ${index + 1} with tls true `, icon: 'loader.gif', location: 1, arrlocation: arrlocation, index: index, data: peerId};
      this.logsmsg[arrlocation].innerlogs[2].icon = "loader.gif";
      await this.registerPeerTrueApi(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.enrollTrueApi(index, arrlocation, peerId, peerName, isPublic);
      await this.registerPeerFalseApi(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.enrollFalseApi(index, arrlocation, peerId, peerName, isPublic);
      await this.generatePeerMsp(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.copyPeerMaterislToNfs(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.createPeerService(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.createPeerDeployment(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.createPeerCouchService(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.createPeerCouchDeployment(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
    }
    if (location == 2) {
      this.checkallapis = false;
      this.failApi = false;
      // this.logsmsg[arrlocation].innerlogs = { msg: `Enroll Peer ${index + 1} with tls true `, icon: 'loader.gif', location: 2, arrlocation: arrlocation, index: index, data: peerId };
      this.logsmsg[arrlocation].innerlogs[3].icon = "loader.gif";
      await this.enrollTrueApi(index, arrlocation, peerId, peerName, isPublic);
      await this.registerPeerFalseApi(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.enrollFalseApi(index, arrlocation, peerId, peerName, isPublic);
      await this.generatePeerMsp(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.copyPeerMaterislToNfs(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.createPeerService(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.createPeerDeployment(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.createPeerCouchService(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.createPeerCouchDeployment(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
    }
    if (location == 3) {
      this.checkallapis = false;
      this.failApi = false;
      //  this.logsmsg[arrlocation].innerlogs = { msg: `Register Peer ${index + 1} with tls false `, icon: 'loader.gif', location: 3, arrlocation: arrlocation, index: index, data: peerId };
      this.logsmsg[arrlocation].innerlogs[4].icon = "loader.gif";
      await this.registerPeerFalseApi(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.enrollFalseApi(index, arrlocation, peerId, peerName, isPublic);
      await this.generatePeerMsp(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.copyPeerMaterislToNfs(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.createPeerService(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.createPeerDeployment(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.createPeerCouchService(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.createPeerCouchDeployment(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
    }
    if (location == 4) {
      this.checkallapis = false;
      this.failApi = false;
      //  this.logsmsg[arrlocation].innerlogs = { msg: `Enroll peer ${index + 1} with tls true `, icon: 'loader.gif', location: 4, arrlocation: arrlocation, index: index, data: peerId };
      this.logsmsg[arrlocation].innerlogs[5].icon = "loader.gif";
      await this.enrollFalseApi(index, arrlocation, peerId, peerName, isPublic);
      await this.generatePeerMsp(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.copyPeerMaterislToNfs(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.createPeerService(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.createPeerDeployment(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.createPeerCouchService(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.createPeerCouchDeployment(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
    }
    if (location == 5) {
      this.checkallapis = false;
      this.failApi = false;
      // this.logsmsg[arrlocation].innerlogs = { msg: `Generate Peer ${index + 1} Msp `, icon: 'loader.gif', location: 5, arrlocation: arrlocation, index: index, data: peerId };
      this.logsmsg[arrlocation].innerlogs[6].icon = "loader.gif";
      await this.generatePeerMsp(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.copyPeerMaterislToNfs(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.createPeerService(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.createPeerDeployment(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.createPeerCouchService(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.createPeerCouchDeployment(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
    }
    if (location == 6) {
      this.checkallapis = false;
      this.failApi = false;
      // this.logsmsg[arrlocation].innerlogs = { msg: `Copy peer ${index + 1} MaterialToNfs `, icon: 'loader.gif', location: 6, arrlocation: arrlocation, index: index, data: peerId };
      this.logsmsg[arrlocation].innerlogs[7].icon = "loader.gif";
      await this.copyPeerMaterislToNfs(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.createPeerService(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.createPeerDeployment(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.createPeerCouchService(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.createPeerCouchDeployment(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
    }
    if (location == 7) {
      this.checkallapis = false;
      this.failApi = false;
      //  this.logsmsg[arrlocation].innerlogs = { msg: `Create Peer ${index + 1} Service `, icon: 'loader.gif', location: 7, arrlocation: arrlocation, index: index, data: peerId };
      this.logsmsg[arrlocation].innerlogs[8].icon = "loader.gif";
      await this.createPeerService(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.createPeerDeployment(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.createPeerCouchService(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.createPeerCouchDeployment(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
    }
    if (location == 8) {
      this.checkallapis = false;
      this.failApi = false;
      //  this.logsmsg[arrlocation].innerlogs = { msg: `Create Peer ${index + 1} Deployment `, icon: 'loader.gif', location: 8, arrlocation: arrlocation, index: index, data: peerId };
      this.logsmsg[arrlocation].innerlogs[9].icon = "loader.gif";
      await this.createPeerDeployment(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.createPeerCouchService(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.createPeerCouchDeployment(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
    }
    if (location == 9) {
      this.checkallapis = false;
      this.failApi = false;
      //  this.logsmsg[arrlocation].innerlogs = { msg: `Create Peer ${index + 1} Couch Service `, icon: 'loader.gif', location: 9, arrlocation: arrlocation, index: index, data: peerId };
      this.logsmsg[arrlocation].innerlogs[10].icon = "loader.gif";
      await this.createPeerCouchService(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
      await this.createPeerCouchDeployment(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
    }
    if (location == 10) {
      this.checkallapis = false;
      this.failApi = false;
      // this.logsmsg[arrlocation].innerlogs = { msg: `Create Peer ${index + 1} Couch Deployment `, icon: 'loader.gif', location: 10, arrlocation: arrlocation, index: index, data: peerId };
      this.logsmsg[arrlocation].innerlogs[11].icon = "loader.gif";
      await this.createPeerCouchDeployment(
        index,
        arrlocation,
        peerId,
        peerName,
        isPublic
      );
    }
  }

  redirect() {}

  async addPeer(orgId) {
    const self = this;
    let arr = this.organisationForm.controls["peerRows"] as FormArray;

    for (let index = 0; index < arr.value.length; index++) {
      this.checkSuccess.push(1);
      let data = arr.value[index];
      if (arr.valid) {
        let formValue = {
          name: data.peer_name,
          peer_enroll_secret: data.peer_enroll_secret,
          orgId: orgId,
          couchdbUsername: data.couchdbUsername,
          couchdbPassword: data.couchdbPassword,
          isPublic: data.isPublic,
        };
        this.logsmsg.push({ key: "array", innerlogs: [] });
        let arrlocation = this.logsmsg.length - 1;
        this.logsmsg[arrlocation].innerlogs.push({
          msg: `<b>Setting up Peer : ${data.peer_name} </b>`,
          icon: "bullet.png",
        });
        this.logsmsg[arrlocation].innerlogs.push({
          msg: `creating peer ${data.peer_name} `,
          icon: "loader.gif",
        });

        let peer = await this.PeerService.peer(formValue).catch((error) => {
          this.logsmsg[arrlocation].innerlogs[1].icon = "cross.png";
          this.toastr.error(error.error.message);
          this.crossError = "Unable to create peer(s), Please try again later.";
          this.closeAble = true;
          this.failApi = true;
          throw new Error();
        });
        this.logsmsg[arrlocation].innerlogs[1].icon = "check.png";
        this.logsmsg[arrlocation].innerlogs.push({
          msg: `Register Peer ${peer.data.name} with Registrar `,
          icon: "loader.gif",
          location: 1,
          arrlocation: arrlocation,
          index: index,
          data: peer.data._id,
          peerName: peer.data.name,
          isPublic: formValue.isPublic,
        });
        this.ClusterArray.push(
          this.addMultiNetwork(
            peer.data._id,
            index,
            arrlocation,
            peer.data.name,
            formValue.isPublic
          )
        );
      }
    }
    let resArray = await Promise.all(this.ClusterArray);
  }

  async addMultiNetwork(peerId, index, arrlocation, peerName, isPublic) {
    try {
      return new Promise(async (resolve, reject) => {
        await this.registerPeerTrueApi(
          index,
          arrlocation,
          peerId,
          peerName,
          isPublic
        );

        await this.enrollTrueApi(
          index,
          arrlocation,
          peerId,
          peerName,
          isPublic
        );

        await this.registerPeerFalseApi(
          index,
          arrlocation,
          peerId,
          peerName,
          isPublic
        );

        await this.enrollFalseApi(
          index,
          arrlocation,
          peerId,
          peerName,
          isPublic
        );

        await this.generatePeerMsp(
          index,
          arrlocation,
          peerId,
          peerName,
          isPublic
        );

        await this.copyPeerMaterislToNfs(
          index,
          arrlocation,
          peerId,
          peerName,
          isPublic
        );

        await this.createPeerService(
          index,
          arrlocation,
          peerId,
          peerName,
          isPublic
        );

        await this.createPeerDeployment(
          index,
          arrlocation,
          peerId,
          peerName,
          isPublic
        );

        await this.createPeerCouchService(
          index,
          arrlocation,
          peerId,
          peerName,
          isPublic
        );

        await this.createPeerCouchDeployment(
          index,
          arrlocation,
          peerId,
          peerName,
          isPublic
        );
      });
    } catch (error) {
      console.log("catch error block");
    }
    //await bar;
  }
}
