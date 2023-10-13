import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { OrderingService } from '../ordering.service';
import { OrganisationService } from '../../organisation/organisation.service';
import { ApiKeyService } from './../../../api-key/api-key.service'
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NgbModal, NgbPaginationNext } from '@ng-bootstrap/ng-bootstrap';
import { resolve } from 'url';
import { promise } from 'protractor';
declare var $: any;


@Component({
    selector: 'app-create-ordering',
    templateUrl: './create-ordering.component.html',
    styleUrls: ['./create-ordering.component.scss']
})
export class CreateOrderingComponent implements OnInit, AfterViewInit {
    orderingForm: FormGroup;
    orderers: any;
    consortium_members: any;
    modellref;
    invalidAccessModel;
    id;
    orgName = [];
    formData;
    orderingNodesId;
    isTLSNo;
    errorArr = [];
    incrementLogs: number = 0;
    isTLSYes;
    response;
    errorIndex = 0;
    status = false;
    closeable = false;
    failApi = false;
    settingUpNodeError = [];
    errormsg = [];
    logsmsg = [];
    promiseArray = [];
    @ViewChild('content', { static: false }) private content;
    @ViewChild('invalidAccess', { static: false }) private invalidAccess;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private orderingService: OrderingService,
        private OrganisationService: OrganisationService,
        private apiKeyService: ApiKeyService,
        private toastr: ToastrService,
        private modalService: NgbModal) { }


    ngOnInit() {
        this.orderingForm = this.formBuilder.group({
            name: ['', Validators.required],
            orgId: ['', Validators.required],
            cmId: ['', Validators.required],
            ordererType: ['1', Validators.required],
        })
        if (localStorage.getItem("netWorkId") != null) {
            this.getOrganisations(localStorage.getItem("netWorkId"));
        }
        this.apiKeyService.getToken('').then(res => {
            localStorage.setItem("token", res.data.token);
        });

    }

    ngAfterViewInit() {
        if (localStorage.getItem("netWorkId") == null) {
            this.showInvaildAccessModal();
        }
        let self = this;
        $(document).ready(function () {
            $('#consortium').chosen({ no_results_text: "Consortium Member not found!" }).change((event) => {
                let consortiumData = [];
                for (const i of Object.keys($('#consortium').chosen().val())) {
                    consortiumData.push($('#consortium').chosen().val()[i].split(':')[1].trim().split('\'')[1]);

                }
                self.orderingForm.patchValue({ cmId: consortiumData });

                let selectedPeers = $("#consortium option:selected");
                self.orgName = $.map(selectedPeers, function (selectedPeers) {
                    return selectedPeers.text;
                });
            });
        });
    }

    goToNetworkList() {
        this.invalidAccessModel.close()
        this.router.navigate(['/network']);
    }

    showInvaildAccessModal() {
        this.invalidAccessModel = this.modalService.open(this.invalidAccess,
            {
                windowClass: 'activation-box invalid-access-box animated zoomIn faster', centered: true, backdrop: 'static',
                keyboard: false
            });
    }


    hideActivityModel() {
        this.closeable = false;
        this.modellref.close();
        //this.router.navigate(['inner-sidebar/order-service']);
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

    getOrganisations(netWorkId) {
        this.OrganisationService.listOrganisationsByNetwork(netWorkId).subscribe(response => {
            this.orderers = response.data.filter(data => data.type === 1);
            this.consortium_members = response.data.filter(data => data.type === 0);
            $(document).ready(function () {
                $('#consortium').chosen('destroy');
                $('#consortium').chosen({ no_results_text: "Consortium Member not found!" });
            });
        }, error => {
            if (!error.error.message) {
                this.toastr.error("Something Went Wrong");
            }
            else {
                this.toastr.error(error.error.message);
            }
        });
    }

    refreshApibkup(index, nodeId, apiName) {
        this.failApi = false;
        this.status = false;
        this.closeable = false;
        const self = this;
        self.logsmsg[index].icon = 'loader.gif';

        if (apiName === 'copyCryptoMaterialToNfs') {
            this.copyCryptoMaterialToNfs(nodeId, index)
                .then(async (response) => {
                    self.logsmsg[index].icon = 'check.png';
                }, (error) => {
                    self.logsmsg[index].icon = 'refresh.png';
                });
        }

        if (apiName === 'createOrdererService') {
            this.createOrdererService(nodeId, index)
                .then(async (response) => {
                    self.logsmsg[index].icon = 'check.png';
                }, (error) => {
                    self.logsmsg[index].icon = 'refresh.png';
                });
        }

        if (apiName === 'createOrdererDeployment') {
            this.createOrdererDeployment(nodeId, index)
                .then(async (response) => {
                    self.logsmsg[index].icon = 'check.png';
                }, (error) => {
                    self.logsmsg[index].icon = 'refresh.png';
                });
        }

    }

    refreshApi(index: number, nodeId, apiName) {
        const self = this;
        let i: number;
        this.failApi = false;
        this.status = false;
        this.closeable = false;
        if (apiName === 'copyCryptoMaterialToNfs') {
            self.logsmsg[index].icon = 'loader.gif';
            i = index + 1;
            self.logsmsg[i].icon = 'loader.gif';
            i = i + 1;
            self.logsmsg[i].icon = 'loader.gif';

            this.copyCryptoMaterialToNfs(nodeId, index)
                .then(async (response) => {
                    self.logsmsg[index].icon = 'check.png';
                    this.createOrdererService(nodeId, index)
                        .then(async (response) => {
                            i = index + 1;
                            self.logsmsg[i].icon = 'check.png';
                            this.createOrdererDeployment(nodeId, index)
                                .then(async (response) => {
                                    i = index + 2;
                                    self.logsmsg[i].icon = 'check.png';
                                    this.errorArr.pop();
                                    if (!this.errorArr.length) {
                                        this.status = true;
                                        this.closeable = true;
                                        setTimeout(() => {
                                            this.modellref.close();
                                            this.router.navigate(['inner-sidebar/order-service']);
                                        }, 2000);
                                    }
                                    //self.logsmsg[index].icon = 'check.png';
                                }, (error) => {
                                    this.failApi = true;
                                    self.logsmsg[index].icon = 'refresh.png';
                                });

                        }, (error) => {
                            this.failApi = true;
                            this.logsmsg[index].success = "no";
                            self.logsmsg[index].icon = 'refresh.png';
                            i = index + 1;
                            self.logsmsg[i].icon = 'refresh.png';
                        });

                }, (error) => {
                    this.failApi = true;
                    this.logsmsg[index].success = "no";
                    self.logsmsg[index].icon = 'refresh.png';
                    i = index + 1;
                    self.logsmsg[i].icon = 'refresh.png';
                    i = i + 1;
                    self.logsmsg[i].icon = 'refresh.png';
                });

        }

        if (apiName === 'createOrdererService') {

            self.logsmsg[index].icon = 'loader.gif';
            i = index + 1;
            self.logsmsg[i].icon = 'loader.gif';

            this.createOrdererService(nodeId, index)
                .then(async (response) => {
                    self.logsmsg[index].icon = 'check.png';

                    this.createOrdererDeployment(nodeId, index)
                        .then(async (response) => {
                            i = index + 1;
                            self.logsmsg[i].icon = 'check.png';
                            this.errorArr.pop();
                            if (!this.errorArr.length) {
                                this.status = true;
                                this.closeable = true;
                                setTimeout(() => {
                                    this.modellref.close();
                                    this.router.navigate(['inner-sidebar/order-service']);
                                }, 2000);
                            }
                        }, (error) => {
                            this.failApi = true;
                            this.logsmsg[index].success = "no";
                            self.logsmsg[i].icon = 'refresh.png';
                        });
                }, (error) => {
                    this.failApi = true;
                    this.logsmsg[index].success = "no";
                    self.logsmsg[index].icon = 'refresh.png';
                    i = index + 1;
                    self.logsmsg[i].icon = 'refresh.png';
                });
        }

        if (apiName === 'createOrdererDeployment') {
            self.logsmsg[index].icon = 'loader.gif';
            this.createOrdererDeployment(nodeId, index)
                .then(async (response) => {
                    self.logsmsg[index].icon = 'check.png';
                    this.errorArr.pop();
                    if (!this.errorArr.length) {
                        this.status = true;
                        this.closeable = true;
                        setTimeout(() => {
                            this.modellref.close();
                            this.router.navigate(['inner-sidebar/order-service']);
                        }, 2000);
                    }
                }, (error) => {
                    this.failApi = true;
                    this.logsmsg[index].success = "no";
                    self.logsmsg[index].icon = 'refresh.png';
                });
        }

    }

    addOrderingServiceApi() {
        return new Promise(async (resolve, reject) => {
            this.orderingService.addOrderingService(this.formData)
                .subscribe(async (response) => {
                    this.id = { _id: response.data.orderingService._id };
                    this.orderingNodesId = { _id: response.data.orderingNodes[0]._id };
                    this.isTLSNo = {
                        _id: response.data.orderingService._id,
                        isTLS: 0
                    };
                    this.isTLSYes = {
                        _id: response.data.orderingService._id,
                        isTLS: 1
                    };
                    this.response = response;

                    /*registerOrderingNodesWithCa*/
                    this.logsmsg[this.incrementLogs].icon = 'check.png';
                    this.incrementLogs++;
                    this.logsmsg.push({
                        msg: 'Register ordering nodes with Root-CA.',
                        icon: 'loader.gif',
                        refresh: '',
                        refreshnode: '',
                        index: 3,
                        data: this.isTLSNo,
                        iconIndex: this.incrementLogs
                    });
                    resolve();
                }, (error) => {
                    if (!error.error.message) {
                        this.toastr.error("Something Went Wrong");
                    }
                    else {
                        this.toastr.error(error.error.message);
                    }
                    this.logsmsg[this.incrementLogs].iconIndex = this.incrementLogs;
                    this.logsmsg[this.incrementLogs].icon = 'refresh.png';
                    this.closeable = true;
                    this.failApi = true;
                    this.logsmsg[this.incrementLogs].success = "no";
                    reject();
                    throw new Error();
                });
        });
    }

    registerOrderingNodesWithCaTlsNoApi() {
        return new Promise(async (resolve, reject) => {
            await this.orderingService.registerOrderingNodesWithCa(this.isTLSNo).then(data => {
                this.logsmsg[this.incrementLogs].icon = 'check.png';
                this.incrementLogs++;
                this.logsmsg.push({
                    msg: 'Register ordering nodes with Registrar.',
                    icon: 'loader.gif',
                    refresh: '',
                    refreshnode: '',
                    index: 4,
                    data: this.isTLSNo,
                    iconIndex: this.incrementLogs
                });
                resolve();
            }).catch(error => {

                if (!error.error.message) {
                    this.toastr.error("Something Went Wrong");
                }
                else {
                    this.toastr.error(error.error.message);
                }
                this.logsmsg[this.incrementLogs].iconIndex = this.incrementLogs;
                this.logsmsg[this.incrementLogs].icon = 'refresh.png';
                this.closeable = true;
                this.failApi = true;
                this.logsmsg[this.incrementLogs].success = "no";
                reject();
                throw new Error();
                // throw new Error('server error');
            });
        });

    }

    registerOrderingNodesWithCaAPI() {
        return new Promise(async (resolve, reject) => {
            await this.orderingService.registerOrderingNodesWithCa(this.isTLSYes).then(data => {
                /*enrollOrderingNodes*/
                this.logsmsg[this.incrementLogs].icon = 'check.png';
                this.incrementLogs++;
                this.logsmsg.push({
                    msg: 'Enroll ordering nodes with Root-CA.',
                    icon: 'loader.gif',
                    refresh: '',
                    refreshnode: '',
                    index: 5,
                    data: this.isTLSYes,
                    iconIndex: this.incrementLogs
                });
                resolve();
            }).catch(error => {
                if (!error.error.message) {
                    this.toastr.error("Something Went Wrong");
                }
                else {
                    this.toastr.error(error.error.message);
                }
                this.logsmsg[this.incrementLogs].iconIndex = this.incrementLogs;
                this.logsmsg[this.incrementLogs].icon = 'refresh.png';
                this.closeable = true;
                this.failApi = true;
                this.logsmsg[this.incrementLogs].success = "no";
                reject();
                throw new Error('server error');
            });
        });

    }

    enrollOrderingNodesApi() {
        return new Promise(async (resolve, reject) => {
            await this.orderingService.enrollOrderingNodes(this.isTLSNo).then(data => {
                this.logsmsg[this.incrementLogs].icon = 'check.png';
                this.incrementLogs++;
                this.logsmsg.push({
                    msg: 'Enroll ordering nodes with Registrar.',
                    icon: 'loader.gif',
                    refresh: '',
                    refreshnode: '',
                    index: 6,
                    data: this.isTLSNo,
                    iconIndex: this.incrementLogs
                });
                resolve();
            }).catch(error => {
                if (!error.error.message) {
                    this.toastr.error("Something Went Wrong");
                }
                else {
                    this.toastr.error(error.error.message);
                }
                this.logsmsg[this.incrementLogs].iconIndex = this.incrementLogs;
                this.logsmsg[this.incrementLogs].icon = 'refresh.png';
                this.closeable = true;
                this.failApi = true;
                this.logsmsg[this.incrementLogs].success = "no";
                reject();
                throw new Error('server error');
            });
        });
    }

    enrollOrderingNodesTlsYesApi() {
        return new Promise(async (resolve, reject) => {
            await this.orderingService.enrollOrderingNodes(this.isTLSYes).then(data => {
                this.logsmsg[this.incrementLogs].icon = 'check.png';
                this.incrementLogs++;
                /*generateOrderingServiceMsp*/
                this.logsmsg.push({
                    msg: 'Generate MSP for ordering service.',
                    icon: 'loader.gif',
                    refresh: '',
                    refreshnode: '',
                    index: 7,
                    data: this.isTLSNo,
                    iconIndex: this.incrementLogs
                });
                resolve();
            }).catch(error => {
                if (!error.error.message) {
                    this.toastr.error("Something Went Wrong");
                }
                else {
                    this.toastr.error(error.error.message);
                }
                this.logsmsg[this.incrementLogs].iconIndex = this.incrementLogs;
                this.logsmsg[this.incrementLogs].icon = 'refresh.png';
                this.closeable = true;
                this.failApi = true;
                this.logsmsg[this.incrementLogs].success = "no";
                reject();
                throw new Error('server error');
            });

        });
    }

    generateOrderingServiceMspApi() {
        return new Promise(async (resolve, reject) => {
            await this.orderingService.generateOrderingServiceMsp(this.id).then(data => {
                /*createGenesisBlock*/
                this.logsmsg[this.incrementLogs].icon = 'check.png';
                this.incrementLogs++;
                resolve();
            }).catch(error => {
                if (!error.error.message) {
                    this.toastr.error("Something Went Wrong");
                }
                else {
                    this.toastr.error(error.error.message);
                }
                this.logsmsg[this.incrementLogs].iconIndex = this.incrementLogs;
                this.logsmsg[this.incrementLogs].icon = 'refresh.png';
                this.closeable = true;
                this.failApi = true;
                this.logsmsg[this.incrementLogs].success = "no";
                reject();
                throw new Error('server error');
            });
        });
    }

    addConsortiumMembersApi() {
        return new Promise(async (resolve, reject) => {
            for (const i of Object.keys(this.orderingForm.get('cmId').value)) {

                let data = {
                    orderingServiceId: this.id._id,
                    orgId: this.orderingForm.get('cmId').value[i]
                }
                this.logsmsg.push({
                    msg: 'Add consortium member ' + this.orgName[i],
                    icon: 'loader.gif',
                    refresh: '',
                    refreshnode: '',
                    index: 8,
                    data: this.isTLSNo,
                    iconIndex: this.incrementLogs
                });
                await this.orderingService.addConsortiumMembers(data).then(data => {
                    this.logsmsg[this.incrementLogs].icon = 'check.png';
                    this.incrementLogs++;

                }).catch(error => {
                    if (!error.error.message) {
                        this.toastr.error("Something Went Wrong");
                    }
                    else {
                        this.toastr.error(error.error.message);
                    }
                    this.logsmsg[this.incrementLogs].iconIndex = this.incrementLogs;
                    this.logsmsg[this.incrementLogs].icon = 'refresh.png';
                    this.closeable = true;
                    this.failApi = true;
                    this.logsmsg[this.incrementLogs].success = "no";
                    throw new Error('server error');
                });
            }
            resolve();
            this.logsmsg.push({
                msg: 'Create genesis block .',
                icon: 'loader.gif',
                refresh: '',
                refreshnode: '',
                index: 9,
                data: this.isTLSNo,
                iconIndex: this.incrementLogs
            });
        });
    }

    createGenesisBlockApi() {
        return new Promise(async (resolve, reject) => {
            await this.orderingService.createGenesisBlock(this.id).then(data => {
                this.logsmsg[this.incrementLogs].icon = 'check.png';
                this.incrementLogs++;
                this.logsmsg.push({
                    msg: 'Upload channel-artifacts to NFS.',
                    icon: 'loader.gif',
                    refresh: '',
                    refreshnode: '',
                    index: 10,
                    data: this.id,
                    iconIndex: this.incrementLogs
                });
                resolve();
            }).catch(error => {
                if (!error.error.message) {
                    this.toastr.error("Something Went Wrong");
                }
                else {
                    this.toastr.error(error.error.message);
                }
                this.logsmsg[this.incrementLogs].iconIndex = this.incrementLogs;
                this.logsmsg[this.incrementLogs].icon = 'refresh.png';
                this.closeable = true;
                this.failApi = true;
                this.logsmsg[this.incrementLogs].success = "no";
                reject();
                throw new Error('server error');
            });
        });
    }

    copyChannelArtifactsToNfsApi() {
        return new Promise(async (resolve, reject) => {
            await this.orderingService.copyChannelArtifactsToNfs(this.orderingNodesId).then(data => {
                this.logsmsg[this.incrementLogs].icon = 'check.png';
                this.incrementLogs++;
                resolve();
            }).catch(error => {
                if (!error.error.message) {
                    this.toastr.error("Something Went Wrong");
                }
                else {
                    this.toastr.error(error.error.message);
                }
                this.logsmsg[this.incrementLogs].iconIndex = this.incrementLogs;
                this.logsmsg[this.incrementLogs].icon = 'refresh.png';
                this.closeable = true;
                this.failApi = true;
                this.logsmsg[this.incrementLogs].success = "no";
                reject();
                throw new Error('server error');
            });
        });
    }

    initializeNodeApi() {
        /* apisCallWithNodes*/
        return new Promise(async (resolve, reject) => {
            this.errorArr = [];
            const totalNode = this.response.data.orderingNodes.length;
            let i: number;
            let prop: any;
            for (let iterate = 0; iterate < totalNode; iterate++) {
                this.promiseArray.push(this.initializeNode(this.response.data.orderingNodes[iterate], iterate, i))
                this.errorArr.push(1);
            }



            let resArray = await Promise.all(this.promiseArray);

            if (this.settingUpNodeError.length === 0) {
                this.status = true;
                this.closeable = true;
                setTimeout(() => {
                    this.modellref.close();
                    this.router.navigate(['inner-sidebar/order-service']);
                }, 2000);
            } else {
                this.status = false;
                this.closeable = true;
            }
        });
    }


    async  rehitApi(index, data, iconIndex) {
        this.failApi = false;
        this.status = false;
        if (index == 2) {
            this.logsmsg[iconIndex] = {
                msg: 'Create ordering service.',
                icon: 'loader.gif',
                refresh: '',
                refreshnode: '',
                index: 2,
                data: data,
            };
            await this.addOrderingServiceApi();
            await this.registerOrderingNodesWithCaTlsNoApi();
            await this.registerOrderingNodesWithCaAPI();
            await this.enrollOrderingNodesApi();
            await this.enrollOrderingNodesTlsYesApi();
            await this.generateOrderingServiceMspApi();
            await this.addConsortiumMembersApi();
            await this.createGenesisBlockApi();
            await this.copyChannelArtifactsToNfsApi();
            await this.initializeNodeApi();
        }
        if (index == 3) {
            this.logsmsg[iconIndex] = {
                msg: 'Register ordering nodes with Root-CA.',
                icon: 'loader.gif',
                refresh: '',
                refreshnode: '',
                index: 3,
                data: data,
            };
            await this.registerOrderingNodesWithCaTlsNoApi();
            await this.registerOrderingNodesWithCaAPI();
            await this.enrollOrderingNodesApi();
            await this.enrollOrderingNodesTlsYesApi();
            await this.generateOrderingServiceMspApi();
            await this.addConsortiumMembersApi();
            await this.createGenesisBlockApi();
            await this.copyChannelArtifactsToNfsApi();
            await this.initializeNodeApi();
        }
        if (index == 4) {
            this.logsmsg[iconIndex] = {
                msg: 'Register ordering nodes with Registrar.',
                icon: 'loader.gif',
                refresh: '',
                refreshnode: '',
                index: 4,
                data: data,
            };
            await this.registerOrderingNodesWithCaAPI();
            await this.enrollOrderingNodesApi();
            await this.enrollOrderingNodesTlsYesApi();
            await this.generateOrderingServiceMspApi();
            await this.addConsortiumMembersApi();
            await this.createGenesisBlockApi();
            await this.copyChannelArtifactsToNfsApi();
            await this.initializeNodeApi();
        }
        if (index == 5) {
            this.logsmsg[iconIndex] = {
                msg: 'Enroll ordering nodes with Root-CA.',
                icon: 'loader.gif',
                refresh: '',
                refreshnode: '',
                index: 5,
                data: data,
            };
            await this.enrollOrderingNodesApi();
            await this.enrollOrderingNodesTlsYesApi();
            await this.generateOrderingServiceMspApi();
            await this.addConsortiumMembersApi();
            await this.createGenesisBlockApi();
            await this.copyChannelArtifactsToNfsApi();
            await this.initializeNodeApi();
        }
        if (index == 6) {
            this.logsmsg[iconIndex] = {
                msg: ' Enroll ordering nodes with Registrar.',
                icon: 'loader.gif',
                refresh: '',
                refreshnode: '',
                index: 6,
                data: data,
            };
            await this.enrollOrderingNodesTlsYesApi();
            await this.generateOrderingServiceMspApi();
            await this.addConsortiumMembersApi();
            await this.createGenesisBlockApi();
            await this.copyChannelArtifactsToNfsApi();
            await this.initializeNodeApi();
        }
        if (index == 7) {
            this.logsmsg[iconIndex] = {
                msg: 'Generate MSP for ordering service.',
                icon: 'loader.gif',
                refresh: '',
                refreshnode: '',
                index: 7,
                data: data,
            };
            await this.generateOrderingServiceMspApi();
            await this.addConsortiumMembersApi();
            await this.createGenesisBlockApi();
            await this.copyChannelArtifactsToNfsApi();
            await this.initializeNodeApi();
        }

        if (index == 8) {
            this.logsmsg[iconIndex] = {
                msg: 'Add consortium member',
                icon: 'loader.gif',
                refresh: '',
                refreshnode: '',
                index: 8,
                data: data,
            };
            await this.addConsortiumMembersApi();
            await this.createGenesisBlockApi();
            await this.copyChannelArtifactsToNfsApi();
            await this.initializeNodeApi();
        }

        if (index == 9) {
            this.logsmsg[iconIndex] = {
                msg: 'Create genesis block.',
                icon: 'loader.gif',
                refresh: '',
                refreshnode: '',
                index: 9,
                data: data,
            };
            await this.createGenesisBlockApi();
            await this.copyChannelArtifactsToNfsApi();
            await this.initializeNodeApi();
        }

        if (index == 10) {
            this.logsmsg[iconIndex] = {
                msg: 'Upload channel-artifacts to NFS.',
                icon: 'loader.gif',
                refresh: '',
                refreshnode: '',
                index: 10,
                data: data,
            };
            await this.copyChannelArtifactsToNfsApi();
            await this.initializeNodeApi();
        }

        if (index == 19) {
            await this.initializeNodeApi();
        }
    }

    async  addOrdering() {
        this.incrementLogs = 0;
        try {
            this.logsmsg = [];
            this.failApi = false;
            this.status = false;

            for (const control of Object.keys(this.orderingForm.controls)) {
                this.orderingForm.controls[control].markAsTouched();
            }

            if (this.orderingForm.valid) {

                this.formData = {
                    name: (this.orderingForm.get('name').value).trim(),
                    orgId: (this.orderingForm.get('orgId').value).trim(),
                    ordererType: parseInt(this.orderingForm.get('ordererType').value)
                };
                this.modellref = this.modalService.open(this.content,
                    {
                        windowClass: 'activation-box-with-scroll animated zoomIn faster', centered: true, backdrop: 'static',
                        keyboard: false
                    });

                /*addOrderingService*/
                this.logsmsg.push({
                    msg: 'Create ordering service.',
                    icon: 'loader.gif',
                    refresh: '',
                    refreshnode: '',
                    index: 2,
                    data: this.formData,
                    iconIndex: this.incrementLogs
                });

                await this.addOrderingServiceApi();

                await this.registerOrderingNodesWithCaTlsNoApi();

                await this.registerOrderingNodesWithCaAPI();

                await this.enrollOrderingNodesApi();

                await this.enrollOrderingNodesTlsYesApi();

                await this.generateOrderingServiceMspApi();

                await this.addConsortiumMembersApi();

                await this.createGenesisBlockApi();

                await this.copyChannelArtifactsToNfsApi();

                await this.initializeNodeApi();

            }
        } catch (error) {
            if (!error.error.message) {
                this.toastr.error("Something Went Wrong");
                throw new Error();
            }
            this.toastr.error(error.error.message);
            this.closeable = true;
            this.failApi = true;
        }
    }

    initializeNode(obj, iterate, i) {

        return new Promise(async (resolve, reject) => {

            let id = { _id: obj._id };
            // let id = { _id: 1 };
            i = (iterate * 4) + (this.incrementLogs + 1);
            this.logsmsg.push({ msg: '<b>Setting up Node : ' + iterate + '</b>', icon: 'bullet.png' });
            let height = document.getElementById('scroll').scrollHeight;
            document.getElementById('scroll').style.paddingBottom = "25px";
            document.getElementById('scroll').scrollTop = height;
            await this.settingNodes(id, i);
            resolve();
        })

    }

    async settingNodes(id, i) {
        this.logsmsg.push({ msg: 'Upload crypto-material to NFS.', icon: 'loader.gif', refresh: '', refreshnode: '' });
        this.logsmsg.push({ msg: 'Creating kubernetes service.', icon: 'loader.gif', refresh: '', refreshnode: '' });
        this.logsmsg.push({ msg: 'Creating kubernetes deployment.', icon: 'loader.gif', refresh: '', refreshnode: '' });
        /*copyCryptoMaterialToNfs*/
        return new Promise(async (resolve, reject) => {
            await this.copyCryptoMaterialToNfs(id, i).then(async () => {
                this.logsmsg[i].icon = 'check.png';
                i = i + 1;
                let height = document.getElementById('scroll').scrollHeight;
                document.getElementById('scroll').style.paddingBottom = "25px";
                document.getElementById('scroll').scrollTop = height;

                /*createOrdererService*/
                await this.createOrdererService(id, i).then(async () => {
                    this.logsmsg[i].icon = 'check.png';
                    i = i + 1;
                    let height = document.getElementById('scroll').scrollHeight;
                    document.getElementById('scroll').style.paddingBottom = "25px";
                    document.getElementById('scroll').scrollTop = height;

                    /*createOrdererDeployment*/
                    await this.createOrdererDeployment(id, i).then(async () => {
                        this.errorArr.pop();
                        this.logsmsg[i].icon = 'check.png';
                        i = i + 1;
                    }).catch((error) => {
                        this.failApi = true;
                        this.logsmsg[i].success = "no";
                        this.logsmsg[i].success = 'no';
                        i = i + 1;
                        this.logsmsg[i].icon = 'refresh.png';
                        this.logsmsg[i].refresh = id;
                        this.logsmsg[i].refreshnode = 'createOrdererDeployment';
                        this.settingUpNodeError.push({ error: 'Creating kubernetes deployment.' });
                        let height = document.getElementById('scroll').scrollHeight;
                        document.getElementById('scroll').style.paddingBottom = "50px";
                        document.getElementById('scroll').scrollTop = height;
                    });
                }).catch((error) => {
                    this.failApi = true;
                    this.logsmsg[i].success = "no";
                    this.logsmsg[i].success = 'no';
                    // i = i + 1;
                    this.logsmsg[i].icon = 'refresh.png';
                    this.logsmsg[i].refresh = id;
                    this.logsmsg[i].refreshnode = 'createOrdererService';
                    this.settingUpNodeError.push({ error: 'createOrdererService' });
                    i = i + 1;
                    this.logsmsg[i].msg = 'createOrdererDeployment';
                    this.logsmsg[i].icon = 'refresh.png';
                    this.logsmsg[i].refresh = id;
                    this.logsmsg[i].refreshnode = 'createOrdererDeployment';
                    this.settingUpNodeError.push({ error: 'Creating kubernetes service.' });
                    let height = document.getElementById('scroll').scrollHeight;
                    document.getElementById('scroll').style.paddingBottom = "50px";
                    document.getElementById('scroll').scrollTop = height;
                });

            }).then(() => {
                resolve();
            }).catch((error) => {
                this.failApi = true;
                this.logsmsg[i].success = "no";
                this.logsmsg[i].icon = 'refresh.png';
                this.logsmsg[i].refresh = id;
                this.logsmsg[i].refreshnode = 'copyCryptoMaterialToNfs';
                this.settingUpNodeError.push({ error: 'copyCryptoMaterialToNfs' });
                /*createOrdererService error*/
                i = i + 1;
                this.logsmsg[i].msg = 'createOrdererService';
                this.logsmsg[i].icon = 'refresh.png';
                this.logsmsg[i].refresh = id;
                this.logsmsg[i].refreshnode = 'createOrdererService';

                /*createOrdererDeployment error*/
                i = i + 1;

                this.logsmsg[i].msg = 'createOrdererDeployment';
                this.logsmsg[i].icon = 'refresh.png';
                this.logsmsg[i].refresh = id;
                this.logsmsg[i].refreshnode = 'createOrdererDeployment';


                let height = document.getElementById('scroll').scrollHeight;
                document.getElementById('scroll').style.paddingBottom = "50px";
                document.getElementById('scroll').scrollTop = height;
            });

        });


    }

    async copyCryptoMaterialToNfs(orderingNodesId, i) {
        const self = this;
        return new Promise(async (resolve, reject) => {
            const cpCrypto = await self.orderingService.copyCryptoMaterialToNfs(orderingNodesId).catch((err) => {
            });

            if (cpCrypto) {
                resolve();
            } else {
                reject();
            }
        });
    }
    async createOrdererService(orderingNodesId, i) {
        const self = this;
        return new Promise(async (resolve, reject) => {
            const cpCrypto = await self.orderingService.createOrdererService(orderingNodesId).catch((err) => {
            });

            if (cpCrypto) {
                resolve();
            } else {
                reject();
            }
        });
    }
    async createOrdererDeployment(orderingNodesId, i) {
        const self = this;
        return new Promise(async (resolve, reject) => {
            const cpCrypto = await self.orderingService.createOrdererDeployment(orderingNodesId).catch((err) => {
            });
            if (cpCrypto) {
                resolve();
            } else {
                reject();
            }
        });
    }

}
