import { Component, OnInit } from '@angular/core';
import { OrganisationService } from './../../organisation/organisation.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-orderer-organisation',
  templateUrl: './view-orderer-organisation.component.html',
  styleUrls: ['./view-orderer-organisation.component.scss']
})
export class ViewOrdererOrganisationComponent implements OnInit {
  records;
	
  private sub: any;

  constructor(private route: ActivatedRoute, private organisationService: OrganisationService, private httpClient: HttpClient ) { }

  ngOnInit() {

    this.getOrganisationDetail();
  }


  getOrganisationDetail(){
    this.sub = this.route.params.subscribe(params => {
         var data = { "_id": params.id };
    this.organisationService.viewOrganisation(data).subscribe(res => {
        this.records = res.data;
    }); 
    });
  }

}
