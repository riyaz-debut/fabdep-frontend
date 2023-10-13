import { LeadershipComponent } from './inner-sidebar/leadership/leadership.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // this is needed!
import { environment } from './../environments/environment';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { ShowHidePasswordModule } from 'ngx-show-hide-password';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CreateClusterComponent } from './cluster/create-cluster/create-cluster.component';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { EditClusterComponent } from './cluster/edit-cluster/edit-cluster.component';
import { ViewClusterComponent } from './cluster/view-cluster/view-cluster.component';
import { NetworkListComponent } from './network/network-list/network-list.component';
import { CreateNetworkComponent } from './network/create-network/create-network.component';
import { EditNetworkComponent } from './network/edit-network/edit-network.component';
import { ViewNetworkComponent } from './network/view-network/view-network.component';
import { ClusterListComponent } from './cluster/cluster-list/cluster-list.component';
import { CaListComponent } from './inner-sidebar/ca/ca-list/ca-list.component';
import { CreateCaComponent } from './inner-sidebar/ca/create-ca/create-ca.component';
import { ViewCaComponent } from './inner-sidebar/ca/view-ca/view-ca.component';
import { EditCaComponent } from './inner-sidebar/ca/edit-ca/edit-ca.component';
import { OrganisationListComponent } from './inner-sidebar/organisation/organisation-list/organisation-list.component';
import { CreateOrganisationComponent } from './inner-sidebar/organisation/create-organisation/create-organisation.component';
import { ViewOrganisationComponent } from './inner-sidebar/organisation/view-organisation/view-organisation.component';
import { EditOrganisationComponent } from './inner-sidebar/organisation/edit-organisation/edit-organisation.component';
import { OrganisationDashboardComponent } from './inner-sidebar/organisation-dashboard.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PeerListComponent } from './inner-sidebar/peer/peer-list/peer-list.component';
import { CreatePeerComponent } from './inner-sidebar/peer/create-peer/create-peer.component';
import { OrderingListComponent } from './inner-sidebar/ordering-service/ordering-list/ordering-list.component';
import { CreateOrderingComponent } from './inner-sidebar/ordering-service/create-ordering/create-ordering.component';
import { ViewOrderingComponent } from './inner-sidebar/ordering-service/view-ordering/view-ordering.component';
import { EditOrderingComponent } from './inner-sidebar/ordering-service/edit-ordering/edit-ordering.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { CreateOrdererOrganisationComponent } from './inner-sidebar/orderer-organisation/create-orderer-organisation/create-orderer-organisation.component';
import { ListOrdererOrganisationComponent } from './inner-sidebar/orderer-organisation/list-orderer-organisation/list-orderer-organisation.component';
import { ViewOrdererOrganisationComponent } from './inner-sidebar/orderer-organisation/view-orderer-organisation/view-orderer-organisation.component';
import { EditOrdererOrganisationComponent } from './inner-sidebar/orderer-organisation/edit-orderer-organisation/edit-orderer-organisation.component';
import { ListChannelComponent } from './inner-sidebar/channel/list-channel/list-channel.component';
import { CreateChannelComponent } from './inner-sidebar/channel/create-channel/create-channel.component';
import { CreateChaincodeComponent } from './inner-sidebar/chaincode/create-chaincode/create-chaincode.component';
import { ChainCodeListComponent } from './inner-sidebar/chaincode/chain-code-list/chain-code-list.component';
import { InstantiateComponent } from './inner-sidebar/chaincode/instantiate/instantiate.component';
import { NetworkClusterListComponent } from './inner-sidebar/network-cluster-list/network-cluster-list.component';
import { ViewChaincodeComponent } from './inner-sidebar/chaincode/view-chaincode/view-chaincode.component';
import { ViewPeerComponent } from './inner-sidebar/peer/view-peer/view-peer.component';
import { ViewChannelComponent } from './inner-sidebar/channel/view-channel/view-channel.component';
import { APIKeyComponent } from './api-key/api-key.component';
import { FabdepInterceptor } from './fabdep-interceptor';
import { AuthGuardService } from './AuthGuardService';
import { SplashScreereenComponent } from './splash-screereen/splash-screereen.component';
import { WalletListComponent } from './inner-sidebar/wallet/wallet-list/wallet-list.component';
import { ViewWalletComponent } from './inner-sidebar/wallet/view-wallet/view-wallet.component';
import { PrivateDataCollectionComponent } from './inner-sidebar/chaincode/private-data-collection/private-data-collection.component';


@NgModule({
  declarations: [
    AppComponent,
    CreateClusterComponent,
    HeaderComponent,
    SidebarComponent,
    EditClusterComponent,
    ViewClusterComponent,
    NetworkListComponent,
    CreateNetworkComponent,
    EditNetworkComponent,
    ViewNetworkComponent,
    ClusterListComponent,
    CaListComponent,
    CreateCaComponent,
    ViewCaComponent,
    EditCaComponent,
    OrganisationListComponent,
    CreateOrganisationComponent,
    ViewOrganisationComponent,
    EditOrganisationComponent,
    OrganisationDashboardComponent,
    PageNotFoundComponent,
    PeerListComponent,
    CreatePeerComponent,
    OrderingListComponent,
    CreateOrderingComponent,
    ViewOrderingComponent,
    EditOrderingComponent,
    LeadershipComponent,
    CreateOrdererOrganisationComponent,
    ListOrdererOrganisationComponent,
    ViewOrdererOrganisationComponent,
    EditOrdererOrganisationComponent,
    ListChannelComponent,
    CreateChannelComponent,
    CreateChaincodeComponent,
    ChainCodeListComponent,
    InstantiateComponent,
    NetworkClusterListComponent,
    ViewChaincodeComponent,
    ViewPeerComponent,
    ViewChannelComponent,
    APIKeyComponent,
    SplashScreereenComponent,
    WalletListComponent,
    ViewWalletComponent,
    PrivateDataCollectionComponent,

  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule, // required for ng2-tag-input
    NgbModule,
    AppRoutingModule,
    ShowHidePasswordModule,
    FormsModule, ReactiveFormsModule,
    ToastrModule.forRoot(), // ToastrModule added
    NgxPaginationModule
  ],
  providers: [
    { provide: 'apiBase', useValue: environment.apiBase },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: FabdepInterceptor,
      multi: true
    }, AuthGuardService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
