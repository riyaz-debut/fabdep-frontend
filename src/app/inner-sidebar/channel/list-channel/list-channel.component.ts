import { Component, OnInit, ViewChild, Input, Output, AfterViewInit, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { ChannelService } from './../channel.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-list-channel',
  templateUrl: './list-channel.component.html',
  styleUrls: ['./list-channel.component.scss']
})
export class ListChannelComponent implements OnInit {

  records = [];
  modellref;
  networkId;
  activityLogsModal;
  deleteModalBox;
  failApi = false;
  closeAble = false;
  success = false;
  logsmsg = [];
  p;
  deleteId;
  importFormModal;
  file: any;
  fileName;
  noFile = false;
  noFileType = false;
  private setting = {
    element: {
      dynamicDownload: null as HTMLElement
    }
  };

  @Input() id: string;
  @Input() maxSize: number;
  @Output() pageChange: EventEmitter<number>;
  @Output() pageBoundsCorrection: EventEmitter<number>;

  @ViewChild('content', { static: false }) private content;
  @ViewChild('deleteModel', { static: false }) private deleteModel;
  @ViewChild('activityLogs', { static: false }) private activityLogs;
  @ViewChild('importDialog', { static: false }) private importDialog;

  constructor(
    private channelService: ChannelService,
    private httpClient: HttpClient,
    private Router: Router,
    private toastr: ToastrService,
    private modalService: NgbModal) { }

  ngOnInit() {
    this.networkId = localStorage.getItem("netWorkId");
    if (this.networkId) {
      this.getChannelList();
    }


  }

  deleteModelPopUp() {
    this.deleteModalBox = this.modalService.open(this.deleteModel,
      {
        windowClass: 'activation-box invalid-access-box animated zoomIn faster', centered: true, backdrop: 'static',
        keyboard: false
      });
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

  hideActivityModel() {
    this.closeAble = false;
    this.activityLogsModal.close()
    //this.Router.navigate(['/inner-sidebar/peer']);
  }


  goToNetworkList() {
    this.modellref.close()
    this.Router.navigate(['/network']);
  }

  getChannelList() {
    this.channelService.getChannelList(this.networkId).subscribe(res => {
      this.records = res.data;
    }, err => {
      //this.toastr.error(err.error.message);
    });
  }

  exportChannel(id) {
    let data = { 'channelId': id };
    this.channelService.exportChannel(data).subscribe((res) => {
      this.dyanmicDownloadByHtmlTag({
        fileName: res.message.channelName + '.json',
        text: JSON.stringify(res.message)
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
          this.channelService.importChannel(newData).subscribe((res) => {
            this.closeImportModal();
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


  //Delete Record
  deleteRecord(id) {
    // alert(id);
    this.logsmsg = [];
    this.closeAble = false;
    this.failApi = false;
    this.success = false;
  }

}
