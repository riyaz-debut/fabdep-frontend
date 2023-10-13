import { Component, OnInit, ViewChild, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { OrganisationService } from './../organisation.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
//import { Component,Input,Output,EventEmitter } from '@angular/core';

@Component({
  selector: 'app-organisation-list',
  templateUrl: './organisation-list.component.html',
  styleUrls: ['./organisation-list.component.scss']
})
export class OrganisationListComponent implements OnInit, AfterViewInit {

  @Input() id: string;
  @Input() maxSize: number;
  @Output() pageChange: EventEmitter<number>;
  @Output() pageBoundsCorrection: EventEmitter<number>;

  p;
  records = [];
  modellref;
  networkId;
  activityLogsModal;
  deleteModalBox;
  importFormModal;
  file: any;
  fileName;
  noFile = false;
  noFileType = false;
  failApi = false;
  closeAble = false;
  success = false;
  logsmsg = [];
  deleteId;
  private setting = {
    element: {
      dynamicDownload: null as HTMLElement
    }
  };

  @ViewChild('content', { static: false }) private content;
  @ViewChild('deleteModel', { static: false }) private deleteModel;
  @ViewChild('activityLogs', { static: false }) private activityLogs;
  @ViewChild('importDialog', { static: false }) private importDialog;

  constructor(
    private organisationService: OrganisationService,
    private httpClient: HttpClient,
    private Router: Router,
    private toastr: ToastrService,
    private modalService: NgbModal) { }

  ngOnInit() {
    this.networkId = localStorage.getItem("netWorkId");
    this.getOrganisationList(this.networkId);
  }


  ngAfterViewInit() {
    if (this.networkId == null) {
      this.showModal();
    }
  }
  showModal() {
    this.modellref = this.modalService.open(this.content,
      {
        windowClass: 'activation-box invalid-access-box animated zoomIn faster', centered: true, backdrop: 'static',
        keyboard: false
      });
  }

  openImportModal() {
    this.importFormModal = this.modalService.open(this.importDialog,
      {
        windowClass: 'activation-box invalid-access-box animated zoomIn faster', centered: true, backdrop: 'static',
        keyboard: false,
      });
  }
  closeImportModal() {
    this.file = '';
    this.noFileType = false;
    this.noFile = false;
    this.fileName = '';
    this.importFormModal.close()
  }

  fileChanged(e) {
    this.noFileType = false;
    this.noFile = false;
    this.file = e.target.files[0];
    if (this.file) {
      this.fileName = e.target.files[0].name;
      if (this.file.type != 'application/json') {
        this.noFileType = true;
        this.file = '';
      }
    }
    else {
      this.noFile = true;
    }


  }

  uploadDocument() {
    try {
      this.noFile = false;
      if (this.file) {
        let fileReader = new FileReader();
        fileReader.onload = (e) => {
          let importData = fileReader.result;
          let newData = JSON.parse(importData.toString()) ;
          newData["networkId"] = localStorage.getItem("netWorkId");
          this.organisationService.importOrganisation(newData).subscribe((res) => {
            this.closeImportModal();
            this.getOrganisationList(this.networkId);
            this.toastr.success('Import successfuly done');
          }, (err) => {
            console.log(err);
            if(err.status == 422){
              this.toastr.error('There is an issue with file');
            }
            else{
              this.toastr.error(err.error.message);
            }
            
          })
        }
        fileReader.readAsText(this.file, "UTF-8");
      }
      else {
        this.noFile = true;
      }
    }
    catch (err) {
      console.log('error', err);

    }

  }

  hideActivityModel() {
    this.closeAble = false;
    this.activityLogsModal.close()
    //this.Router.navigate(['/inner-sidebar/peer']);
  }

  goToNetworkList() {
    this.modellref.close()
    this.Router.navigate(['/network']);
  }

  deleteOrganisation(id) {
    const bar = new Promise(async (resolve, reject) => {
      await this.organisationService.deleteOrganisationById(id).then(() => {

      }).catch((err) => {

      });
    })
  }

  //Get Organisation List
  getOrganisationList(networkId) {
    this.organisationService.listOrganisationsByNetwork(networkId).subscribe(res => {
      this.records = res.data;
      this.records = this.records.filter(data => data.type === 0 || data.type === 2 );
    });
  }

  deleteModelPopUp() {
    this.deleteModalBox = this.modalService.open(this.deleteModel,
      {
        windowClass: 'activation-box invalid-access-box animated zoomIn faster', centered: true, backdrop: 'static',
        keyboard: false
      });
  }


  deleteOrganisationByIdApi(id) {
    return new Promise(async (resolve, reject) => {
      let deleteOrganisationById = await this.organisationService.deleteOrganisationById(id).catch((err) => {
        this.logsmsg[0].icon = 'refresh.png';
        this.toastr.error(err.error.message);
        this.closeAble = true;
        this.failApi = true;
        throw new Error();
      });
      this.logsmsg[0].icon = 'check.png';
      this.success = true;
      this.closeAble = true;
      this.getOrganisationList(this.networkId);
      setTimeout(() => {
        this.activityLogsModal.close();
      }, 2000);

    })
  }

  rehitApi(id) {
    this.logsmsg[0] = { msg: 'Delete Consortium Member ', icon: 'loader.gif', index: 10, id: id };
    this.deleteOrganisationByIdApi(id);
  }


  async deleteRecord(id) {
    this.logsmsg = [];
    this.closeAble = false;
    this.failApi = false;
    this.success = false;

    this.activityLogsModal = this.modalService.open(this.activityLogs,
      {
        windowClass: 'activation-box invalid-access-box animated zoomIn faster', centered: true, backdrop: 'static',
        keyboard: false
      });

    try {
      this.logsmsg.push({ msg: 'Delete Consortium Member ', icon: 'loader.gif', index: 10, id: id });
      this.deleteOrganisationByIdApi(id);
      // let deleteOrganisationById = await this.organisationService.deleteOrganisationById(id).catch((err) => {
      //   this.logsmsg[0].icon = 'cross.png';
      //   this.toastr.error(err.error.message);
      //   this.closeAble = true;
      //   this.failApi = true;
      //   throw new Error();
      // });
      // this.logsmsg[0].icon = 'check.png';
      // this.success = true;
      // this.closeAble = true;
      // this.getOrganisationList(this.networkId);
      // setTimeout(() => {
      //   this.activityLogsModal.close();
      // }, 2000);

    } catch (err) {
      console.log();

    }
  }

  dynamicDownloadJson(id) {
    let data = { '_id': id };
    this.organisationService.exportOrganisation(data).subscribe((res) => {
      this.dyanmicDownloadByHtmlTag({
        fileName: res.data.name + '.json',
        text: JSON.stringify(res.data)
      });
    });


  }



  private dyanmicDownloadByHtmlTag(arg: {
    fileName: string,
    text: string
  }) {
    if (!this.setting.element.dynamicDownload) {
      this.setting.element.dynamicDownload = document.createElement('a');
    }
    const element = this.setting.element.dynamicDownload;
    const fileType = arg.fileName.indexOf('.json') > -1 ? 'text/json' : 'text/plain';
    element.setAttribute('href', `data:${fileType};charset=utf-8,${encodeURIComponent(arg.text)}`);
    element.setAttribute('download', arg.fileName);

    var event = new MouseEvent("click");
    element.dispatchEvent(event);
  }


}
