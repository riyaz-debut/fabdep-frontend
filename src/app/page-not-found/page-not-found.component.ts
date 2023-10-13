import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RoutesRecognized, NavigationStart, NavigationEnd } from '@angular/router';
import { filter, pairwise, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {Location} from '@angular/common';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent implements OnInit, OnDestroy {

  // rootRoute = '/cluster';
  previousRoute = '';
  sub;
  constructor(private router: Router, private _location: Location) { }

  ngOnInit() {
    // this.previousRoute$.subscribe(url => {
    //   console.log(url);
    //   this.previousRoute = url;
    //   console.log(this.previousRoute);
    // });
  }

  backClicked() {
    this._location.back();
  }

  get previousRoute$(): Observable<string> {
    return this.router.events.pipe(
      filter(e => e instanceof RoutesRecognized),
      pairwise(),
      map((e: [RoutesRecognized, RoutesRecognized]) => e[0].url)
    );
  }

  ngOnDestroy() {
  }

}
