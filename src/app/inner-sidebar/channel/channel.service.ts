import { Injectable, Inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { HttpHeaders } from "@angular/common/http";
@Injectable({
  providedIn: "root",
})
export class ChannelService {
  constructor(
    private http: HttpClient,
    @Inject("apiBase") private _apiBase: string
  ) {}

  // getChannelList() {
  //   return this.http.get<any>(this._apiBase + 'channel');
  // }

  getChannelList(networkId) {
    return this.http.get<any>(
      this._apiBase + "channel/listChannelsByNetwork?networkId=" + networkId
    );
  }

  listOrdererConsortium(id) {
    return this.http.post<any>(
      this._apiBase + "channel/listOrderingServiceConsortium",
      { _id: id }
    );
  }

  saveChannelInfo(data) {
    return this.http
      .post<any>(this._apiBase + "channel/saveChannelInfo", data)
      .toPromise();
  }

  createChannelTx(channelId) {
    return this.http
      .post<any>(this._apiBase + "channel/createChannelTx", {
        channelId: channelId,
      })
      .toPromise();
  }

  createChannel(channelId) {
    return this.http
      .post<any>(this._apiBase + "channel/createChannel", {
        channelId: channelId,
      })
      .toPromise();
  }

  getChannelConfig(channelId) {
    return this.http
      .post<any>(this._apiBase + "channel/getChannelConfig", {
        channelId: channelId,
      })
      .toPromise();
  }

  deleteChannelConfig(channelId) {
    return this.http.post<any>(this._apiBase + "channel/getChannelConfig", {
      channelId: channelId,
    });
  }

  updateChannel(data) {
    return this.http
      .post<any>(this._apiBase + "channel/updateChannelPolicy", data)
      .toPromise();
  }

  removeOrgOrAdminFromChannel(data) {
    return this.http
      .post<any>(this._apiBase + "channel/removeOrgOrAdminFromChannel", data)
      .toPromise();
  }

  createOrgConfigtx(channelId, anchorpeerId) {
    return this.http.post<any>(this._apiBase + "channel/createOrgConfigtx", {
      channelId: channelId,
      anchorpeerId: anchorpeerId,
    });
  }

  addOrgToChannelConfig(channelId, anchorpeerId) {
    return this.http.post<any>(
      this._apiBase + "channel/addOrgToChannelConfig",
      { channelId: channelId, anchorpeerId: anchorpeerId }
    );
  }

  joinChannel(channelId, peerId) {
    return this.http
      .post<any>(this._apiBase + "channel/joinChannel", {
        channelId: channelId,
        peerIds: peerId,
      })
      .toPromise();
  }

  getUpdateAliasList(channelId) {
    return this.http
      .post<any>(this._apiBase + "channel/getUpdateAliasList", {
        channelId: channelId,
      })
      .toPromise();
  }

  updateOrdererHost(channelId, orderernodeId) {
    return this.http
      .post<any>(this._apiBase + "channel/updateOrdererHost", {
        channelId: channelId,
        orderernodeId: orderernodeId,
      })
      .toPromise();
  }

  updatePeerHosts(channelId, peerId) {
    return this.http
      .post<any>(this._apiBase + "channel/updatePeerHosts", {
        channelId: channelId,
        peerId: peerId,
      })
      .toPromise();
  }

  signConfigUpdateChannel(channelId, anchorpeerId) {
    return this.http.post<any>(this._apiBase + "channel/", {
      channelId: channelId,
      anchorpeerId: anchorpeerId,
    });
  }

  getChannelDetail(id) {
    return this.http.get<any>(
      this._apiBase + "channel/channel?channelId=" + id
    );
  }

  fetchChannel(channelId) {
    return this.http
      .post<any>(this._apiBase + "channel/getChannelConfig", {
        channelId: channelId,
      })
      .toPromise();
  }

  createOrg(data) {
    return this.http
      .post<any>(this._apiBase + "channel/createOrgConfigtx", data)
      .toPromise();
  }

  orgToChannel(data) {
    return this.http
      .post<any>(this._apiBase + "channel/addOrgToChannelConfig", data)
      .toPromise();
  }

  peerToChannel(data) {
    return this.http
      .post<any>(this._apiBase + "channel/updateChannel", data)
      .toPromise();
  }

  addOrgAsAdmin(data) {
    return this.http
      .post<any>(this._apiBase + "channel/addOrgAsChannelOperator", data)
      .toPromise();
  }

  policy(data) {
    return this.http
      .post<any>(this._apiBase + "channel/updateChannelPolicy", data)
      .toPromise();
  }

  exportChannel(data) {
    return this.http.post<any>(this._apiBase + "channel/exportChannel", data);
  }

  importChannel(data) {
    return this.http.post<any>(
      this._apiBase + "channel/importChannelDetail",
      data
    );
  }
}
