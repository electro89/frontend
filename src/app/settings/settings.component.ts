import { Component, OnInit } from "@angular/core";
import { GlobalVarsService } from "../global-vars.service";
import { BackendApiService } from "../backend-api.service";
import { CountryISO } from "ngx-intl-tel-input";
import { Title } from "@angular/platform-browser";
import { ThemeService } from "../theme/theme.service";

@Component({
  selector: "settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent implements OnInit {
  loading = false;
  countryISO = CountryISO;
  emailAddress = "";
  invalidEmailEntered = false;
  updatingSettings = false;
  showSuccessMessage = false;
  successMessageTimeout: any;

  constructor(
    public globalVars: GlobalVarsService,
    private backendApi: BackendApiService,
    private titleService: Title,
    public themeService: ThemeService
  ) {}
  selectedTheme: string = "";

  filterNewAccountStatus:string=localStorage.getItem("filterNewAccountStatus"); 
  filterLowCoinStatus:string=localStorage.getItem("filterLowCoinStatus");

  hideLowCoinHolders(){
    if(this.filterLowCoinStatus===null){
      this.filterLowCoinStatus="off";
    }
    this.filterLowCoinStatus = (this.filterLowCoinStatus=="off") ? "on":"off";
    localStorage.setItem("filterLowCoinStatus",this.filterLowCoinStatus);
  }
  hideNewAccounts(){
    if(this.filterNewAccountStatus===null){
      this.filterNewAccountStatus="off";
    }
    this.filterNewAccountStatus = (this.filterNewAccountStatus=="off") ? "on":"off";
    localStorage.setItem("filterNewAccountStatus",this.filterNewAccountStatus);
  }

  selectChangeHandler(event: any) {
    //update the ui
    const selectedTheme = event.target.value;

    this.themeService.setTheme(selectedTheme);
    localStorage.setItem("theme", selectedTheme);
  }

  ngOnInit() {
    this._getUserMetadata();
    this.titleService.setTitle("Settings - BitClout");

    this.filterNewAccountStatus=localStorage.getItem("filterNewAccountStatus"); 
    this.filterLowCoinStatus=localStorage.getItem("filterLowCoinStatus");
    let refresh_needed=false;
    if(this.filterNewAccountStatus===null){
      localStorage.setItem("filterNewAccountStatus","off"); 
      refresh_needed=true;
    }

    if(this.filterLowCoinStatus===null){
      localStorage.setItem("filterLowCoinStatus","off");
      refresh_needed=true;
    }
    if(refresh_needed){
      window.location.reload()
    }
  }

  _getUserMetadata() {
    this.loading = true;
    this.backendApi
      .GetUserGlobalMetadata(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check /*UpdaterPublicKeyBase58Check*/
      )
      .subscribe(
        (res) => {
          this.emailAddress = res.Email;
        },
        (err) => {
          console.log(err);
        }
      )
      .add(() => {
        this.loading = false;
      });
  }

  _validateEmail(email) {
    if (email === "" || this.globalVars.emailRegExp.test(email)) {
      this.invalidEmailEntered = false;
    } else {
      this.invalidEmailEntered = true;
    }
  }

  _updateSettings() {
    if (this.showSuccessMessage) {
      this.showSuccessMessage = false;
      clearTimeout(this.successMessageTimeout);
    }

    this.updatingSettings = true;
    this.backendApi
      .UpdateUserGlobalMetadata(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check /*UpdaterPublicKeyBase58Check*/,
        this.emailAddress /*EmailAddress*/,
        null /*MessageReadStateUpdatesByContact*/
      )
      .subscribe(
        (res) => {},
        (err) => {
          console.log(err);
        }
      )
      .add(() => {
        this.showSuccessMessage = true;
        this.updatingSettings = false;
        this.successMessageTimeout = setTimeout(() => {
          this.showSuccessMessage = false;
        }, 500);
      });
  }
}
