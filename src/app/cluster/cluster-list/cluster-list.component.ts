import {
  Component,
  OnInit,
  ViewChild,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import { ClusterService } from "./../cluster.service";
import { HttpClient } from "@angular/common/http";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { IpcCommunicationService } from "../../ipc-communication.service";
import { ToastrService } from "ngx-toastr";

declare var bootbox: any;

@Component({
  selector: "app-cluster-list",
  templateUrl: "./cluster-list.component.html",
  styleUrls: ["./cluster-list.component.scss"],
})
export class ClusterListComponent implements OnInit {
  @Input() id: string;
  @Input() maxSize: number;
  @Output() pageChange: EventEmitter<number>;
  @Output() pageBoundsCorrection: EventEmitter<number>;

  records = [];
  dashboardData = [];
  p;
  public loading: boolean = false;

  @ViewChild("content", { static: false }) private content;
  constructor(
    private modalService: NgbModal,
    private clusterService: ClusterService,
    private httpClient: HttpClient,
    private ipcCommunicationService: IpcCommunicationService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.getClusterList();
  }

  //************************************************************************//
  // Get Clusters
  //************************************************************************//

  getClusterList() {
    this.clusterService.getCluster().subscribe((res) => {
      // Order by descending
      //res.sort((a, b) => parseFloat(b.id) - parseFloat(a.id));
      // this.setSShDashboard();
      this.records = res.data;
    });
  }

  reDirect(clusterId: string): void {
    this.loading = true;
    let data = {
      clusterId: clusterId,
    };
    this.clusterService.setSshTunnelDashboard(data).subscribe(
      (res) => {
        this.loading = false;
        if (res.dashboard_url) {
          this.ipcCommunicationService.openUrlInElectron(res.dashboard_url);
        } else {
          this.toastr.error("Kubernates dashboard URL not found");
        }
      },
      (error) => {
        this.loading = false;
        this.toastr.error(error.error.message);
      }
    );
  }

  open(content) {
    this.modalService.open(content, {
      windowClass: "activation-box",
      centered: true,
    });
  }
}
