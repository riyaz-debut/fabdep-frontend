import { Component, OnInit } from '@angular/core';
import { NetworkService } from 'src/app/network/network.service';
declare var bootbox: any;

@Component({
  selector: 'app-leadership',
  templateUrl: './leadership.component.html',
  styleUrls: ['./leadership.component.scss']
})
export class LeadershipComponent implements OnInit {

  constructor(private networkListService: NetworkService) { }

  records = [];

  ngOnInit() {
		this.networkList();
	}

	networkList() {
		let app = this;
		this.networkListService.getNetworks().subscribe(res => {
      this.records = res.data;
		});
	}

}
