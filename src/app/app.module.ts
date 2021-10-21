import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { GridAllModule } from '@syncfusion/ej2-angular-grids';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TableComponent } from './components/table/table.component';
import {FreezeService, TreeGridModule} from '@syncfusion/ej2-angular-treegrid';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClipboardModule } from 'ngx-clipboard';
import { DropDownListAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { ReorderService} from '@syncfusion/ej2-angular-treegrid';
import { ResizeService } from '@syncfusion/ej2-angular-treegrid';
import { environment } from 'src/environments/environment';
import {SortService } from '@syncfusion/ej2-angular-treegrid';
import {FilterService} from '@syncfusion/ej2-angular-treegrid';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireStorageModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    ReorderService,
    ResizeService,
    FreezeService,
    SortService,
    FilterService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
