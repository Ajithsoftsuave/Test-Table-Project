import { Component, OnInit, ViewChild } from '@angular/core';
import { sampleData } from './jsontreegriddata';
import {
  SortService,
  ResizeService,
  PageService,
  EditService,
  ExcelExportService,
  PdfExportService,
  ContextMenuService,
  TreeGridComponent,
} from '@syncfusion/ej2-angular-treegrid';
import { EditSettingsModel } from '@syncfusion/ej2-treegrid';
import { MenuEventArgs } from '@syncfusion/ej2-navigations';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  providers: [
    SortService,
    ResizeService,
    PageService,
    EditService,
    ExcelExportService,
    PdfExportService,
    ContextMenuService,
  ],
})
export class TableComponent implements OnInit {
  // tslint:disable-next-line: ban-types
  public data: Object[] = [];
  // tslint:disable-next-line: ban-types
  public pageSettings: Object;
  public editing: EditSettingsModel;
  public toolbar: string[];
  // tslint:disable-next-line: ban-types
  public editparams: Object;
  // tslint:disable-next-line: ban-types
  public contextMenuItems: Object[];
  @ViewChild('treegrid')
  public treeGridObj: TreeGridComponent;

  ngOnInit(): void {
    this.data = sampleData;

    // items should be in context menu. type string are default, type object are custom options
    this.contextMenuItems = [
      { text: 'Add Next', target: '.e-content', id: 'addnext' },
      { text: 'Add Child', target: '.e-content', id: 'addchild' },
      'Delete',
      'Edit',
      { text: 'Cut', target: '.e-content', id: 'cut' },
      { text: 'Copy', target: '.e-content', id: 'copy' },
      { text: 'Paste', target: '.e-content', id: 'paste' },
      'AutoFit',
      'AutoFitAll',
      'SortAscending',
      'SortDescending',
      'Save',
      'Cancel',
      'FirstPage',
      'PrevPage',
      'LastPage',
      'NextPage',
    ];

    this.editing = { allowDeleting: true, allowEditing: true, mode: 'Row' };
    this.pageSettings = { pageSize: 20 };
    this.editparams = { params: { format: 'n' } };
  }

  contextMenuClick(args?): void {
    if (args.item.id === 'addnext') {
      //
    } else if (args.item.id === 'addchild') {
      //
    } else if (args.item.id === 'cut') {
      // cut
    } else if (args.item.id === 'copy') {
      console.log("row", args.rowInfo.rowData);
      // this.clipboardApi.copyFromContent(args.rowInfo.rowData)
    } else if (args.item.id === 'paste') {
      // paste
    }
  }
}
