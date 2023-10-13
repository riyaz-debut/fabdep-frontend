import { Component, OnInit } from '@angular/core';
import { OrganisationService } from './../organisation.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from "rxjs";

@Component({
	selector: 'app-view-organisation',
	templateUrl: './view-organisation.component.html',
	styleUrls: ['./view-organisation.component.scss']
})
export class ViewOrganisationComponent implements OnInit {

	records;

	private sub: any;
	private setting = {
		element: {
			dynamicDownload: null as HTMLElement
		}
	};
	// data = {
	// 	"message": "Success",
	// 	"status": 1,
	// 	"data": {
	// 		"name": "manufacturer",
	// 		"mspId": "manufacturerMSP",
	// 		"type": 2,
	// 		"peer_enroll_id": "unit-1-manufacturer",
	// 		"peerport": 31000,
	// 		"tlsCacerts": "-----BEGIN CERTIFICATE-----\nMIICFTCCAbygAwIBAgIULhjMXXWYJJLumndjIwbIbrwwruEwCgYIKoZIzj0EAwIw\nXzELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMRQwEgYDVQQK\nEwtIeXBlcmxlZGdlcjEPMA0GA1UECxMGRmFicmljMRAwDgYDVQQDEwdyb290LWNh\nMB4XDTIwMDUyNzA0NDkwMFoXDTQwMDUyMjA0NDkwMFowXzELMAkGA1UEBhMCVVMx\nFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMRQwEgYDVQQKEwtIeXBlcmxlZGdlcjEP\nMA0GA1UECxMGRmFicmljMRAwDgYDVQQDEwdyb290LWNhMFkwEwYHKoZIzj0CAQYI\nKoZIzj0DAQcDQgAEReyAGRIunxe/FwoG+jwo1T5AbZPSFta7n19WXqg/WMaWzf6J\nSfVsY6fhKBjaLRSx/zVKWMv4sH0BbUuFHDlnZqNWMFQwDgYDVR0PAQH/BAQDAgEG\nMBIGA1UdEwEB/wQIMAYBAf8CAQEwHQYDVR0OBBYEFKAePmhi6QE/cCo0/XB5Vr9F\n+2JeMA8GA1UdEQQIMAaHBAAAAAAwCgYIKoZIzj0EAwIDRwAwRAIgBTW3b1LBxhO3\nP+hkXPum/H10K6sq5mIXRW/z95DxR9UCIAchhYVyfCtLmYb+yF8XzdCQzUwfHEs3\nwgMNZRtckUPq\n-----END CERTIFICATE-----\n",
	// 		"cacets": "-----BEGIN CERTIFICATE-----\nMIICFTCCAbygAwIBAgIULhjMXXWYJJLumndjIwbIbrwwruEwCgYIKoZIzj0EAwIw\nXzELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMRQwEgYDVQQK\nEwtIeXBlcmxlZGdlcjEPMA0GA1UECxMGRmFicmljMRAwDgYDVQQDEwdyb290LWNh\nMB4XDTIwMDUyNzA0NDkwMFoXDTQwMDUyMjA0NDkwMFowXzELMAkGA1UEBhMCVVMx\nFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMRQwEgYDVQQKEwtIeXBlcmxlZGdlcjEP\nMA0GA1UECxMGRmFicmljMRAwDgYDVQQDEwdyb290LWNhMFkwEwYHKoZIzj0CAQYI\nKoZIzj0DAQcDQgAEReyAGRIunxe/FwoG+jwo1T5AbZPSFta7n19WXqg/WMaWzf6J\nSfVsY6fhKBjaLRSx/zVKWMv4sH0BbUuFHDlnZqNWMFQwDgYDVR0PAQH/BAQDAgEG\nMBIGA1UdEwEB/wQIMAYBAf8CAQEwHQYDVR0OBBYEFKAePmhi6QE/cCo0/XB5Vr9F\n+2JeMA8GA1UdEQQIMAaHBAAAAAAwCgYIKoZIzj0EAwIDRwAwRAIgBTW3b1LBxhO3\nP+hkXPum/H10K6sq5mIXRW/z95DxR9UCIAchhYVyfCtLmYb+yF8XzdCQzUwfHEs3\nwgMNZRtckUPq\n-----END CERTIFICATE-----\n",
	// 		"admincerts": "-----BEGIN CERTIFICATE-----\nMIICTTCCAfSgAwIBAgIUUeb47wttFLwOW5YXJlGAj/nYboswCgYIKoZIzj0EAwIw\nXzELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMRQwEgYDVQQK\nEwtIeXBlcmxlZGdlcjEPMA0GA1UECxMGRmFicmljMRAwDgYDVQQDEwdyb290LWNh\nMB4XDTIwMDUyNzA0NTEwMFoXDTMwMDUyNTA0NTYwMFowKTEPMA0GA1UECxMGY2xp\nZW50MRYwFAYDVQQDEw1yb290LWNhLWFkbWluMFkwEwYHKoZIzj0CAQYIKoZIzj0D\nAQcDQgAEmA8EfcK5zLRIaxYJQ3+rqAI8bzhprFbhKqnYcX9awxJV/uDsAuzBMnXm\noL+LEir+jWlzn2W5vNkCQEjE18lRrqOBwzCBwDAOBgNVHQ8BAf8EBAMCB4AwDAYD\nVR0TAQH/BAIwADAdBgNVHQ4EFgQU5pjziJESXVWdcpEu/aPnz4fJCs0wHwYDVR0j\nBBgwFoAUoB4+aGLpAT9wKjT9cHlWv0X7Yl4wYAYIKgMEBQYHCAEEVHsiYXR0cnMi\nOnsiaGYuQWZmaWxpYXRpb24iOiIiLCJoZi5FbnJvbGxtZW50SUQiOiJyb290LWNh\nLWFkbWluIiwiaGYuVHlwZSI6ImNsaWVudCJ9fTAKBggqhkjOPQQDAgNHADBEAiAQ\nrJLhO9pZP8dotOgMHY4t4FcnVX1Qios/3lb0RjOBjwIgY9Gepy5S8FcgxJQ2Sbqx\n+tZdSZh5l9upm0k5ECnWsPQ=\n-----END CERTIFICATE-----\n"
	// 	}
	// }

	data;

	file: any;
	constructor(private route: ActivatedRoute, private organisationService: OrganisationService, private httpClient: HttpClient) { }

	ngOnInit() {

		this.getOrganisationDetail();
	}


	getOrganisationDetail() {
		this.sub = this.route.params.subscribe(params => {
			// var data = { "_id": params.id };
			this.data = { "_id": params.id };
			this.organisationService.viewOrganisation(this.data).subscribe(res => {
				this.records = res.data;
			});
		});
	}




	fakeValidateUserData() {
		// return of(this.data)
		return of(this.data)
	}

	//


	dynamicDownloadTxt() {
		this.fakeValidateUserData().subscribe((res) => {
			this.dyanmicDownloadByHtmlTag({
				fileName: 'my-custom-file',
				text: JSON.stringify(res)
			});
		});

	}

	dynamicDownloadJson() {
		// this.fakeValidateUserData().subscribe((res) => {
		// 	this.dyanmicDownloadByHtmlTag({
		// 		fileName: res.data.name+'.json',
		// 		text: JSON.stringify(res.data)
		// 	});
		// });
		this.organisationService.exportOrganisation(this.data).subscribe((res) => {
			this.dyanmicDownloadByHtmlTag({
				fileName: res.data.name + '.json',
				text: JSON.stringify(res.data)
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

	// fileChanged(e) {
	// 	this.file = e.target.files[0];
	// 	if (this.file.type != 'application/json') {
	// 		this.file = '';
	// 	}
	// }

	// uploadDocument() {
	// 	if (this.file) {
	// 		let fileReader = new FileReader();
	// 		fileReader.onload = (e) => {
	// 			// let importData = fileReader.result;
	// 			let newData = (fileReader.result as string).split('{').join(`{"networkId":"${localStorage.getItem("netWorkId")}",`);
	// 			console.log(newData);

	// 		}
	// 		fileReader.readAsText(this.file);
	// 	}

	// }

	onFileChanged(event) {
		// this.selectedFile = event.target.files[0];
		// const fileReader = new FileReader();
		// fileReader.readAsText(this.selectedFile, "UTF-8");
		// fileReader.onload = () => {
		// 	console.log(JSON.parse(fileReader.result));
		// }
		// fileReader.onerror = (error) => {
		// 	console.log(error);
		//}
	}

}
