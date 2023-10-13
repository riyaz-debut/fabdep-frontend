import { Component, OnInit } from '@angular/core';
import { OrderingService } from './../ordering.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-ordering',
  templateUrl: './view-ordering.component.html',
  styleUrls: ['./view-ordering.component.scss']
})
export class ViewOrderingComponent implements OnInit {

	records;
	
  	private sub: any;

    constructor(private route: ActivatedRoute, private orderingService: OrderingService, private httpClient: HttpClient ) { }

  	ngOnInit() {
	  	this.getOrderingDetail();
  	}


  	getOrderingDetail(){
  		this.sub = this.route.params.subscribe(params => {
		var data = { "_id": params.id };
		this.orderingService.viewOrdering(data).subscribe(res => {
		this.records = res.data;
			}); 
		});
  	}

}
