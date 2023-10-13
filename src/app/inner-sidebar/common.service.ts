import { Injectable, EventEmitter } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class CommonService {

  public networkChanged$: EventEmitter<string>;

  constructor() {
    this.networkChanged$ = new EventEmitter()
  }

  public networkChanged() {
    this.networkChanged$.emit();
  }
}
