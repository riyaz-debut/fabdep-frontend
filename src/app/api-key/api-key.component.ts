import { Component, OnInit, ViewChild, AfterViewInit, OnChanges } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, Validators, FormControl } from '@angular/forms';
import { ApiKeyService } from './api-key.service'
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { async } from 'q';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-api-key',
    templateUrl: './api-key.component.html',
    styleUrls: ['./api-key.component.scss']
})
export class APIKeyComponent implements OnInit {

    apiKeyForm: FormGroup;

    constructor(private formBuilder: FormBuilder,
        private router: Router,
        private apiKeyService: ApiKeyService,
        private toastr: ToastrService,
        private modalService: NgbModal) { }

    ngOnInit() {
        this.apiKeyFormFeilds()
        
    }

    apiKeyFormFeilds() {
        this.apiKeyForm = this.formBuilder.group({
            clientKey: ['', Validators.required],
            autoUpdateStatus: [false],
        });
    }

    validateMethod() {
        this.apiKeyService.getToken('').then(res => {
            localStorage.setItem("token", res.data.token);
        });
    }
    async saveAPIKey() {
        for (const c of Object.keys(this.apiKeyForm.controls)) {
            this.apiKeyForm.controls[c].markAsTouched();
        }
        if (this.apiKeyForm.invalid) {
            return false;
        }
        // await this.apiKeyService.autoUpdate(this.apiKeyForm.value.autoUpdateStatus).then(res => {
        // }, error => {
        //     this.toastr.error(error.error.message, 'autoUpdateAPI')
        //     console.log(error.error.message);
        // })

        const getToken = await this.apiKeyService.getToken(this.apiKeyForm.value.clientKey).then(res => {
            localStorage.setItem("token", res.data.token);
            this.toastr.success('', 'Registration successfull');
            setTimeout(() => {

                this.router.navigate(['/cluster']);
            }, 2000)


        }, (error) => {

            switch (error.error.status) {
                case 1:
                    this.toastr.error('Request is not authorized');

                    break;
                case 2:
                    this.toastr.error('FabDep is unable to autenticate you. Please provide your Beta Key');
                    this.router.navigate(['/registration-key']);

                    break;
                case 3:
                    this.toastr.error('Request is not authorized');

                    break;
                case 4:
                    this.toastr.error('Request is not authorized');

                    break;
                case 0:
                    // this.toastr.error('Invalid registration Key');
                    this.toastr.error(error.error.message);

                    break;
                case 6:
                    this.toastr.error('You have already used your Beta Key');

                    break;
                // case 7:
                //     this.toastr.error('Your Beta version has been expired.');

                //     break;
                case 8:
                    this.router.navigate(['/registration-key']);
                    break;
                case 9:
                    this.toastr.error('FabDep is unable to autenticate you. Please provide your Beta Key');
                    this.router.navigate(['/registration-key']);

                    break;
                case 10:
                    this.validateMethod();
                    break;
                default:

                    break;
            }

        });

    }

}
