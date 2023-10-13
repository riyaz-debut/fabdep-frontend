import { Component, OnInit, ViewChild } from '@angular/core';
import { ChannelService } from './../../channel/channel.service';
import { ChainCodeService } from './../chain-code.service';
import { OrganisationService } from '../../organisation/organisation.service';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { FormGroup, Validators, FormBuilder, } from "@angular/forms";
declare var $: any;

@Component({
  selector: 'app-private-data-collection',
  templateUrl: './private-data-collection.component.html',
  styleUrls: ['./private-data-collection.component.scss']
})
export class PrivateDataCollectionComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private Router: Router,
    private channelService: ChannelService,
    private organisationService: OrganisationService,
    private chainCodeService: ChainCodeService,
    private location: Location

  ) { }

  consortiumMembers = [];
  collectionModellref;
  collectionForm: FormGroup;
  privateCollectionConfig = [];
  sameCollectionErr = false;
  @ViewChild('collectionDialog', { static: true }) private collectionDialog;

  ngOnInit() {
    this.addCollectionForm();
    if (localStorage.getItem("netWorkId") != null) {
      this.getOrganisations(localStorage.getItem("netWorkId"));
      this.getInstantiateData();
    }
    if (localStorage.getItem('collectionData')) {
      this.privateCollectionConfig = JSON.parse(localStorage.getItem('collectionData'));
    }

  }


  addCollectionForm() {
    this.collectionForm = this.formBuilder.group({
      collectionName: ['', Validators.required],
      requiredPeerCount: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      maxPeerCount: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      blockToLive: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      memberOnlyRead: ['true', Validators.required],
      organisation: ['', Validators.required],

    });



  }

  getOrganisations(netWorkId) {
    this.organisationService.listOrganisationsByNetwork(netWorkId).subscribe(response => {
      // this.orderers = response.data.filter(data => data.type === 1);
      this.consortiumMembers = response.data.filter(data => data.type === 0);
    }, error => {
      if (!error.error.message) {
        this.toastr.error("Something Went Wrong");
      }
      else {
        this.toastr.error(error.error.message);
      }
    });
  }

  addCollectionDialog() {
    $(document).ready(function () {
      $('#consortium').chosen('destroy');
      $('#consortium').chosen({ no_results_text: "Consortium Member not found!" });
    });
    this.getSelectedOrganisation();
    this.collectionModellref = this.modalService.open(this.collectionDialog,
      {
        windowClass: 'activation-box animated zoomIn faster', centered: true, keyboard: false, backdrop: false
      });

  }

  //hide Activity Model 
  hideActivityModel() {
    this.collectionForm.reset();
    this.collectionModellref.close();
    this.collectionForm.patchValue({ memberOnlyRead: 'true' });
  }

  getSelectedOrganisation() {
    $(document).ready(() => {
      $('#consortium').chosen({ no_results_text: "Consortium Member not found!" }).change((event) => {
        let consortiumData = [];
        for (const i of Object.keys($('#consortium').chosen().val())) {
          consortiumData.push($('#consortium').chosen().val()[i].split(':')[1].trim().split('\'')[1]);
        }
        this.collectionForm.patchValue({ organisation: consortiumData });
      });
    });
  }

  checkDuplicateCollectionName() {
    this.sameCollectionErr = false;
    this.privateCollectionConfig.forEach(element => {
      if (element.name == this.collectionForm.value.collectionName) {
        this.sameCollectionErr = true;
      }
    });
  }


  saveCollection() {
    // this.sameCollectionErr = false;
    for (const control of Object.keys(this.collectionForm.controls)) {
      this.collectionForm.controls[control].markAsTouched();
    }
    if (this.collectionForm.invalid) {
      return;
    }
    if (this.collectionForm.valid && !this.sameCollectionErr) {
      this.createPvDataConfig(this.collectionForm.value);
      this.hideActivityModel();
    }

  }

  createPvDataConfig(data) {
    // console.log(data);

    let pvDataConfig = {
      "policy": {
        "identities": [],
        "policy": {
          "1-of": []
        }
      },
      "name": data.collectionName,
      "requiredPeerCount": parseInt(data.requiredPeerCount),
      "maxPeerCount": parseInt(data.maxPeerCount),
      "blockToLive": parseInt(data.blockToLive),
      "memberOnlyRead": data.memberOnlyRead == 'true' ? true : false,
      "org": data.organisation
    };

    data.organisation.forEach(element => {
      pvDataConfig.policy.identities.push(
        {
          "role": {
            "name": "member",
            "mspId": element
          }
        }
      )
    });
    for (let index = 0; index < data.organisation.length; index++) {
      pvDataConfig.policy.policy["1-of"].push(
        {
          "signed-by": index
        }
      )
    }


    this.privateCollectionConfig.push(pvDataConfig);
    localStorage.setItem('collectionData', JSON.stringify(this.privateCollectionConfig))
    return this.privateCollectionConfig;
  }


  removeFromPvDataConfig(index) {
    this.privateCollectionConfig.splice(index, 1)
    localStorage.setItem('collectionData', JSON.stringify(this.privateCollectionConfig))
  }

  backClicked() {
  //  this.chainCodeService.setCollectionData(null);
    this.location.back();
  }

  async continue() {
    this.location.back();
    if (this.privateCollectionConfig.length) {

      // await this.getPrivateCollections();
     // await this.chainCodeService.setCollectionData(this.privateCollectionConfig);
    //  this.location.back();
    }
  }

  getPrivateCollections() {
    let newData;
    this.chainCodeService.getInstantiateData().subscribe((data) => {
      // console.log('data', data);
      newData = data;
    });

    if (newData) {
      this.privateCollectionConfig['instantiateData'] = newData;
    }
  }

  getInstantiateData() {
    let newData;
    this.chainCodeService.getInstantiateData().subscribe((data) => {
      if(data){
        localStorage.setItem('setInstantiateDataByCollection','true');
        this.chainCodeService.setInstantiateDataByCollection(data);
      }
    });
  }

  ngOnDestroy() {
    this.chainCodeService.setInstantiateData(null);
  }



}
