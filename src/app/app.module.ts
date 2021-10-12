import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { GridAllModule } from '@syncfusion/ej2-angular-grids';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TableComponent } from './components/table/table.component';
import { TreeGridModule } from '@syncfusion/ej2-angular-treegrid';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClipboardModule } from 'ngx-clipboard';
import { DropDownListAllModule } from '@syncfusion/ej2-angular-dropdowns';

@NgModule({
  declarations: [
    AppComponent,
    TableComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GridAllModule,
    TreeGridModule,
    BrowserAnimationsModule,
    ClipboardModule,
    DropDownListAllModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
