import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { OrderingService } from '../ordering.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { resolve } from 'url';

@Component({
  selector: 'app-edit-ordering',
  templateUrl: './edit-ordering.component.html',
  styleUrls: ['./edit-ordering.component.scss']
})
export class EditOrderingComponent implements OnInit {
    orderingForm: FormGroup;
    organisations: any;
    modellref;
    errorIndex = 0;
    status = false;
    closeable = false;
    errormsg = [];
    logsmsg = [];
    records  = '';

    @ViewChild('content', { static: false }) private content;
    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private ActivatedRoute: ActivatedRoute,
        private orderingService: OrderingService,
        private toastr: ToastrService,
        private modalService: NgbModal) { }


    ngOnInit() {

        this.getOrderingById();

        this.orderingForm = this.formBuilder.group({
            orderingId: [''],
            name: ['', Validators.required],
            orgId: ['', Validators.required],
            ordererType: ['', Validators.required],
        }),
            this.getOrganisations();
    }

    getOrderingById(){

    let id = { "_id": this.ActivatedRoute.snapshot.paramMap.get('id') };
    this.orderingService.getOrderingById(id).subscribe((res) => {

      this.records = res.data;

      this.orderingForm.patchValue({
        orderingId: this.records['_id'],
        name: this.records['name'],
        orgId: this.records['orgId'],
        ordererType: '0',//this.records['ordererType'],
      }); 
      //this.orderingForm.updateValueAndValidity();
      //this.getAdmin(this.records['adminId']);

    },
      error => {
    });
    //console.log(this.records['caId']);
    
  }

    hideActivityModel() {
        this.closeable = false;
        this.modellref.close();
    }

    getOrganisations() {
        this.orderingService.getOrganisations().subscribe(response => {
            this.organisations = response.data.filter(data => data.type === 1);
        }, error => {
            this.toastr.error(error.errors.message);
        });
    }

    addOrdering() {

        try {

            this.logsmsg = [];

            for (const control of Object.keys(this.orderingForm.controls)) {
                this.orderingForm.controls[control].markAsTouched();
            }

            if (this.orderingForm.valid) {

                const formData = {
                    name: (this.orderingForm.get('name').value).trim(),
                    orgId: (this.orderingForm.get('orgId').value).trim(),
                    ordererType: (this.orderingForm.get('ordererType').value).trim()
                };

                /*addOrderingService*/
                this.logsmsg.push({ msg: 'addOrderingService', icon: 'loader.gif' });
                this.orderingService.addOrderingService(formData)
                    .subscribe(async (response) => {
                        this.logsmsg[0].icon = 'check.png';
                        this.modellref = this.modalService.open(this.content,
                            {
                                windowClass: 'activation-box animated zoomIn faster', centered: true, backdrop: 'static',
                                keyboard: false
                            });
                        const id = { _id: response.data.orderingService._id };
                        const orderingNodesId = { _id: response.data.orderingNodes[0]._id };
                        const isTLSNo = {
                            _id: response.data.orderingService._id,
                            isTLS: 0
                        };
                        const isTLSYes = {
                            _id: response.data.orderingService._id,
                            isTLS: 1
                        };

                        /*registerOrderingNodesWithCa*/
                        this.logsmsg.push({ msg: 'registerOrderingNodesWithCa', icon: 'loader.gif' });
                        await this.orderingService.registerOrderingNodesWithCa(isTLSNo).then(data => {
                            this.logsmsg[1].icon = 'check.png';
                        }).catch(error => {
                            this.toastr.error(error.error.message);
                            this.logsmsg[1].icon = 'cross.png';
                            this.closeable = true;
                            throw new Error('server error');
                        });

                        await this.orderingService.registerOrderingNodesWithCa(isTLSYes).then(data => {
                            this.logsmsg[1].icon = 'check.png';
                        }).catch(error => {
                            this.toastr.error(error.error.message);
                            this.logsmsg[1].icon = 'cross.png';
                            this.closeable = true;
                            throw new Error('server error');
                        });


                        /*enrollOrderingNodes*/
                        this.logsmsg.push({ msg: 'enrollOrderingNodes', icon: 'loader.gif' });
                        await this.orderingService.enrollOrderingNodes(isTLSNo).then(data => {
                            this.logsmsg[2].icon = 'check.png';
                        }).catch(error => {
                            this.toastr.error(error.error.message);
                            this.logsmsg[2].icon = 'cross.png';
                            this.closeable = true;
                            throw new Error('server error');
                        });

                        await this.orderingService.enrollOrderingNodes(isTLSYes).then(data => {
                        }).catch(error => {
                            this.toastr.error(error.error.message);
                            this.logsmsg[2].icon = 'cross.png';
                            this.closeable = true;
                            throw new Error('server error');
                        });


                        /*generateOrderingServiceMsp*/
                        this.logsmsg.push({ msg: 'generateOrderingServiceMsp', icon: 'loader.gif' });
                        await this.orderingService.generateOrderingServiceMsp(id).then(data => {
                            this.logsmsg[3].icon = 'check.png';
                        }).catch(error => {
                            this.toastr.error(error.error.message);
                            this.logsmsg[3].icon = 'cross.png';
                            this.closeable = true;
                            throw new Error('server error');
                        });

                        /*createGenesisBlock*/
                        this.logsmsg.push({ msg: 'createGenesisBlock', icon: 'loader.gif' });
                        await this.orderingService.createGenesisBlock(id).then(data => {
                            this.logsmsg[4].icon = 'check.png';
                        }).catch(error => {
                            this.toastr.error(error.error.message);
                            this.logsmsg[4].icon = 'cross.png';
                            this.closeable = true;
                            throw new Error('server error');
                        });

                        /*copyChannelArtifactsToNfs*/
                        this.logsmsg.push({ msg: 'copyChannelArtifactsToNfs', icon: 'loader.gif' });
                        await this.orderingService.copyChannelArtifactsToNfs(orderingNodesId).then(data => {
                            this.logsmsg[5].icon = 'check.png';
                        }).catch(error => {
                            this.toastr.error(error.error.message);
                            this.logsmsg[5].icon = 'cross.png';
                            this.closeable = true;
                            throw new Error('server error');
                        });


                        /* apisCallWithNodes*/

                        const totalNode = response.data.orderingNodes.length;
                        let j = 6;
                        let i = 7;
                        for (let iterate = 0; iterate < totalNode; iterate++) {
                            let id = { _id: response.data.orderingNodes[iterate]._id };

                            try {
                                this.logsmsg[j] = { msg: '<b>Setting up Node: ' + iterate + '</b>', icon: 'bullet.png' };
                                this.logsmsg[i] = { msg: 'copyCryptoMaterialToNfs', icon: 'loader.gif' };
                                await this.copyCryptoMaterialToNfs(id, i).then(async () => {
                                    i = i + 1;
                                    this.logsmsg[i] = { msg: 'createOrdererService', icon: 'loader.gif' };
                                    await this.createOrdererService(id, i).then(async () => {
                                        i = i + 1;
                                        this.logsmsg[i] = { msg: 'createOrdererDeployment', icon: 'loader.gif' };
                                        await this.createOrdererDeployment(id, i).then(async () => {
                                            i = i + 1;
                                        }).catch((error) => {
                                            this.logsmsg[i].icon = 'cross.png';
                                            this.closeable = true;
                                            throw new Error('server error');
                                        });
                                    }).catch((error) => {
                                        this.logsmsg[i].icon = 'cross.png';
                                        this.closeable = true;
                                        throw new Error('server error');
                                    });
                                }).catch((error) => {

                                    this.logsmsg[i].icon = 'cross.png';
                                    this.closeable = true;
                                    throw new Error('server error');
                                });
                                i = i + 1;
                                j = j + 4;

                            } catch (error) {
                                this.logsmsg[i].icon = 'cross.png';
                                this.closeable = true;
                            }
                        }

                        this.status = true;
                        this.closeable = true;
                        setTimeout(() => {
                            this.modellref.close();
                            this.router.navigate(['inner-sidebar/order-service']);
                        }, 3000);


                    }, (error) => {
                        this.toastr.error(error.error.message);
                        this.logsmsg[0].icon = 'cross.png';
                        this.closeable = true;
                    });
            }
        } catch (error) {
            this.toastr.error(error);
            this.closeable = true;

        }
    }

    async copyCryptoMaterialToNfs(orderingNodesId, i) {
        const self = this;
        return new Promise(async (resolve, reject) => {
            const cpCrypto = await self.orderingService.copyCryptoMaterialToNfs(orderingNodesId).catch((err) => {
                self.logsmsg[i].icon = 'cross.png';
                self.closeable = true;
                throw new Error('server error 12');
            });

            self.logsmsg[i] = { msg: 'copyCryptoMaterialToNfs', icon: 'loader.gif' };
            if (cpCrypto) {
                self.logsmsg[i].icon = 'check.png';
                resolve();
            } else {
                self.logsmsg[i].icon = 'cross.png';
                self.closeable = true;
                reject();

            }
        });
    }
    async createOrdererService(orderingNodesId, i) {
        const self = this;
        return new Promise(async (resolve, reject) => {
            const cpCrypto = await self.orderingService.createOrdererService(orderingNodesId).catch((err) => {
                self.logsmsg[i].icon = 'cross.png';
                self.closeable = true;
                throw new Error('server error 12');
            });

            self.logsmsg[i] = { msg: 'createOrdererService', icon: 'loader.gif' };
            if (cpCrypto) {
                self.logsmsg[i].icon = 'check.png';
                resolve();
            } else {
                self.logsmsg[i].icon = 'cross.png';
                self.closeable = true;
                reject();

            }
        });
    }
    async createOrdererDeployment(orderingNodesId, i) {
        const self = this;
        return new Promise(async (resolve, reject) => {
            const cpCrypto = await self.orderingService.createOrdererDeployment(orderingNodesId).catch((err) => {
                self.logsmsg[i].icon = 'cross.png';
                self.closeable = true;
                throw new Error('server error 12');
            });
            self.logsmsg[i] = { msg: 'createOrdererDeployment', icon: 'loader.gif' };
            if (cpCrypto) {
                self.logsmsg[i].icon = 'check.png';
                resolve();
            } else {
                self.logsmsg[i].icon = 'cross.png';
                self.closeable = true;
                throw new Error('server error');
                reject();
            }
        });
    }

}
