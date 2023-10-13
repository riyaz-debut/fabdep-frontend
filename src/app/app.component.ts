import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ApiKeyService } from './api-key/api-key.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { resolve } from 'url';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'fabdep';
  isShowHide   = false;

  constructor(private formBuilder: FormBuilder,
    private apiKeyService: ApiKeyService,
    private toastr: ToastrService,
    private router: Router) { }

  async ngOnInit() {
    try {
      this.router.navigate(['splash']);
      setTimeout(async () => {
        await this.getLatestToken();
      }, 5000);
    } catch (error) {
      this.isShowHide = true;
      this.router.navigate(['']);
    }
  }

  getLatestToken() {
    return new Promise((resolve, reject) => {
      this.apiKeyService.getToken('').then(res => {
        localStorage.setItem("token", res.data.token);
        this.isShowHide = true;
        this.router.navigate(['']);

        resolve();
      }, err => {
        this.isShowHide = true;
        this.router.navigate(['']);
        

        reject();
      });
    })

  }
}
