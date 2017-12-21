import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpModule } from "@angular/http";

import { AppComponent } from "./app.component";

import { HeaderComponent } from "./header.component";



@NgModule({
    declarations: [
        AppComponent,
     
        HeaderComponent,
      
    ],
    imports: [
        BrowserModule,
      
     
        HttpModule
    ],
    providers:[],
    bootstrap: [AppComponent]
})
export class AppModule {

}