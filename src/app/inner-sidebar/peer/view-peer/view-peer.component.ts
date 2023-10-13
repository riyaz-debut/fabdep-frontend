import { Component, OnInit } from '@angular/core';
import { PeerService } from './../peer.service'
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-view-peer',
  templateUrl: './view-peer.component.html',
  styleUrls: ['./view-peer.component.scss']
})
export class ViewPeerComponent implements OnInit {

  constructor(private PeerService: PeerService, private route: ActivatedRoute,private toastr: ToastrService,) { }
  peerData: any;
  isloading = false;
  ngOnInit() {
    this.getPeerDetail();
  }

  getPeerDetail() {

    let id = this.route.snapshot.paramMap.get('id');
    this.PeerService.getPeerDetail(id).subscribe((response) => {
      this.peerData = response.data;
      // this.peerData.push({'isPublic':true});
      // this.peerData.isPublic = true;
    },
      error => {
        console.log('error');
      });
  }

  updatePeerCouchService(id, isPublic) {
    this.isloading = true;
    
    this.PeerService.updatePeerCouchService(id,isPublic).subscribe((response) => {
      this.toastr.success('Couch DB access changed successfully.');
      this.getPeerDetail();
      this.isloading = false;
    },
      error => {
        this.toastr.error(error.error.message);
        this.isloading = false;
      });
  }

}
