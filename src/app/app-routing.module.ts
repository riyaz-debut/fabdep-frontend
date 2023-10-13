import { LeadershipComponent } from './inner-sidebar/leadership/leadership.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreatePeerComponent } from './inner-sidebar/peer/create-peer/create-peer.component';
import { PeerListComponent } from './inner-sidebar/peer/peer-list/peer-list.component';
import { ViewOrderingComponent } from './inner-sidebar/ordering-service/view-ordering/view-ordering.component';
import { CreateOrderingComponent } from './inner-sidebar/ordering-service/create-ordering/create-ordering.component';
import { OrderingListComponent } from './inner-sidebar/ordering-service/ordering-list/ordering-list.component';
import { EditOrderingComponent } from './inner-sidebar/ordering-service/edit-ordering/edit-ordering.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { NetworkListComponent } from './network/network-list/network-list.component';
import { CreateClusterComponent } from './cluster/create-cluster/create-cluster.component';
import { EditClusterComponent } from './cluster/edit-cluster/edit-cluster.component';
import { ViewClusterComponent } from './cluster/view-cluster/view-cluster.component';
import { ClusterListComponent } from './cluster/cluster-list/cluster-list.component';
import { CreateNetworkComponent } from './network/create-network/create-network.component';
import { EditNetworkComponent } from './network/edit-network/edit-network.component';
import { ViewNetworkComponent } from './network/view-network/view-network.component';
import { OrganisationDashboardComponent } from './inner-sidebar/organisation-dashboard.component';
import { OrganisationListComponent } from './inner-sidebar/organisation/organisation-list/organisation-list.component';
import { ViewOrganisationComponent } from './inner-sidebar/organisation/view-organisation/view-organisation.component';
import { EditOrganisationComponent } from './inner-sidebar/organisation/edit-organisation/edit-organisation.component';
import { CreateOrganisationComponent } from './inner-sidebar/organisation/create-organisation/create-organisation.component';
import { CreateOrdererOrganisationComponent } from './inner-sidebar/orderer-organisation/create-orderer-organisation/create-orderer-organisation.component';
import { ListOrdererOrganisationComponent } from './inner-sidebar/orderer-organisation/list-orderer-organisation/list-orderer-organisation.component';
import { ViewOrdererOrganisationComponent } from './inner-sidebar/orderer-organisation/view-orderer-organisation/view-orderer-organisation.component';
import { EditOrdererOrganisationComponent } from './inner-sidebar/orderer-organisation/edit-orderer-organisation/edit-orderer-organisation.component';
import { CreateCaComponent } from './inner-sidebar/ca/create-ca/create-ca.component';
import { CaListComponent } from './inner-sidebar/ca/ca-list/ca-list.component';
import { ViewCaComponent } from './inner-sidebar/ca/view-ca/view-ca.component';
import { EditCaComponent } from './inner-sidebar/ca/edit-ca/edit-ca.component';
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
import { AuthGuardService } from './AuthGuardService';
import { SplashScreereenComponent } from './splash-screereen/splash-screereen.component';
import { WalletListComponent } from './inner-sidebar/wallet/wallet-list/wallet-list.component';
import { ViewWalletComponent } from './inner-sidebar/wallet/view-wallet/view-wallet.component';
import { PrivateDataCollectionComponent } from './inner-sidebar/chaincode/private-data-collection/private-data-collection.component';

const routes: Routes = [
  {
    path: 'splash', component: SplashScreereenComponent
  },

  {
    path: '', redirectTo: '/cluster', pathMatch: 'full'
  },

  {
    path: 'registration-key', component: APIKeyComponent
  },

  {
    path: 'cluster', canActivate: [AuthGuardService], children: [
      { path: 'create-cluster', component: CreateClusterComponent, canActivate: [AuthGuardService] },
      { path: 'edit-cluster/:id', component: EditClusterComponent, canActivate: [AuthGuardService] },
      { path: 'view-cluster', component: ViewClusterComponent, canActivate: [AuthGuardService] },
      { path: '', component: ClusterListComponent, canActivate: [AuthGuardService] },
    ]
  },

  {
    path: 'network', children: [
      { path: 'create-network', component: CreateNetworkComponent, canActivate: [AuthGuardService] },
      // { path: 'edit-network', component: EditNetworkComponent },
      // { path: 'view-network', component: ViewNetworkComponent },
      { path: '', component: NetworkListComponent, canActivate: [AuthGuardService] },
    ]
  },


  {
    path: 'inner-sidebar', component: OrganisationDashboardComponent, children: [

      {
        path: 'ca', children: [
          { path: 'create-ca', component: CreateCaComponent, canActivate: [AuthGuardService] },
          { path: 'view-ca/:id', component: ViewCaComponent, canActivate: [AuthGuardService] },
          { path: 'edit-ca/:id', component: EditCaComponent, canActivate: [AuthGuardService] },
          { path: '', component: CaListComponent, canActivate: [AuthGuardService] },
          { path: 'create-ca/:id', component: CreateCaComponent, canActivate: [AuthGuardService] },
        ]
      },
      {
        path: 'cluster-list', children: [
          // { path: 'create-ca', component: CreateCaComponent },
          // { path: 'view-ca/:id', component: ViewCaComponent },
          // { path: 'edit-ca/:id', component: EditCaComponent },
          { path: '', component: NetworkClusterListComponent, canActivate: [AuthGuardService] },
          // { path: 'create-ca/:id', component: CreateCaComponent },
        ]
      },
      // {
      //   path: 'organisation', children: [
      //     { path: 'create', component: CreateOrganisationComponent },
      //     { path: 'view/:id', component: ViewOrganisationComponent },
      //     { path: '', component: OrganisationListComponent },
      //   ]
      // },
      {
        path: 'consortium-member', children: [
          { path: 'create', component: CreateOrganisationComponent, canActivate: [AuthGuardService] },
          { path: 'view/:id', component: ViewOrganisationComponent, canActivate: [AuthGuardService] },
          { path: 'edit/:id', component: EditOrganisationComponent, canActivate: [AuthGuardService] },
          { path: '', component: OrganisationListComponent, canActivate: [AuthGuardService] },
        ]
      },
      {
        path: 'orderer', children: [
          { path: 'create', component: CreateOrdererOrganisationComponent, canActivate: [AuthGuardService] },
          { path: 'view/:id', component: ViewOrdererOrganisationComponent, canActivate: [AuthGuardService] },
          { path: 'edit/:id', component: EditOrdererOrganisationComponent, canActivate: [AuthGuardService] },
          { path: '', component: ListOrdererOrganisationComponent, canActivate: [AuthGuardService] },
        ]
      },
      {
        path: 'order-service', children: [
          { path: 'create', component: CreateOrderingComponent, canActivate: [AuthGuardService] },
          { path: 'view/:id', component: ViewOrderingComponent, canActivate: [AuthGuardService] },
          { path: 'edit/:id', component: EditOrderingComponent, canActivate: [AuthGuardService] },
          { path: '', component: OrderingListComponent, canActivate: [AuthGuardService] },
        ]
      },
      {
        path: 'peer', children: [
          { path: 'create', component: CreatePeerComponent, canActivate: [AuthGuardService] },
          { path: '', component: PeerListComponent, canActivate: [AuthGuardService] },
          { path: 'view/:id', component: ViewPeerComponent, canActivate: [AuthGuardService] },
        ]
      },
      {
        path: 'channel', children: [
          { path: 'create', component: CreateChannelComponent },
          { path: '', component: ListChannelComponent },
          { path: 'view/:id', component: ViewChannelComponent },
        ]
      },
      {
        path: 'chaincode', children: [
          { path: 'create', component: CreateChaincodeComponent, canActivate: [AuthGuardService] },
          { path: 'instantiate', component: InstantiateComponent, canActivate: [AuthGuardService] },
          { path: 'private-data-collection', component: PrivateDataCollectionComponent, canActivate: [AuthGuardService] },
          { path: 'view/:id', component: ViewChaincodeComponent, canActivate: [AuthGuardService] },
          { path: '', component: ChainCodeListComponent, canActivate: [AuthGuardService] },

        ]
      },

      {
        path: '', component: OrganisationListComponent, canActivate: [AuthGuardService]
      },
      {
        path: 'wallet', children: [
          { path: '', component: WalletListComponent, canActivate: [AuthGuardService] },
          { path: 'view/:id', component: ViewWalletComponent, canActivate: [AuthGuardService] },

        ]
      },
    ]
  },

  // { path: 'leadership', component: LeadershipComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
