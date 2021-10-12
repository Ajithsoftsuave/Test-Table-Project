import { Component, OnInit, ViewChild } from '@angular/core';
import { sampleData } from './jsontreegriddata';
import {
  SortService,
  ResizeService,
  PageService,
  EditService,
  ContextMenuService,
  TreeGridComponent,
} from '@syncfusion/ej2-angular-treegrid';
import { EditSettingsModel, ToolbarItems  } from '@syncfusion/ej2-treegrid';
import { MenuEventArgs } from '@syncfusion/ej2-navigations';
import { ClipboardService } from 'ngx-clipboard';
import { SelectionSettingsModel } from '@syncfusion/ej2-angular-treegrid';
import { ChangeEventArgs } from '@syncfusion/ej2-angular-dropdowns';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  providers: [
    SortService,
    ResizeService,
    PageService,
    EditService,
    ContextMenuService,
  ],
})
export class TableComponent implements OnInit {
  // tslint:disable-next-line: ban-types
  public data: Object[] = [];
  // tslint:disable-next-line: ban-types
  public pageSettings: Object;
  public editing: EditSettingsModel;
  // tslint:disable-next-line: ban-types
  public editparams: Object;
  // tslint:disable-next-line: ban-types
  public contextMenuItems: Object[];
  @ViewChild('treegrid')
  public treeGridObj: TreeGridComponent;

  @ViewChild(TreeGridComponent, { static: false }) treegrid: TreeGridComponent;

  public copiedRow: any;

  // tslint:disable-next-line: ban-types
  public dropData: Object[];
  // tslint:disable-next-line: ban-types
  public fields: Object;
  public selectionOptions: SelectionSettingsModel;
  public toolbar: ToolbarItems[];
  public selectedIndex = -1;
  gridInstance: any;

  constructor(private clipboardService: ClipboardService) {}

  ngOnInit(): void {
    this.data = sampleData;

    // items should be in context menu. type string are default, type object are custom options
    this.contextMenuItems = [
      { text: 'Add Next', target: '.e-content', id: 'addnext' },
      { text: 'Add Child', target: '.e-content', id: 'addchild' },
      'Delete',
      'Edit',
      'Copy',
      { text: 'Cut', target: '.e-content', id: 'cut' },
      { text: 'Paste', target: '.e-content', id: 'paste' },
      { text: 'Style', target: '.e-gridheader', id: 'paste', items : [{ text: 'Data-Type', id: 'datatype' }, { text: 'Default-Value', id: 'defaultvalue' },
       { text: 'Minimum-Column-Width', id: 'minwidth' }, { text: 'Font-size', id: 'fontsize' }, { text: 'Font-color', id: 'fontcolor' },
       { text: 'Background-color', id: 'bgcolr' }, { text: 'Alignment', id: 'alignment' } , { text: 'Text-wrap', id: 'textwrap' }] },
      { text: 'New', target: '.e-gridheader', id: 'new' },
      { text: 'Delete', target: '.e-gridheader', id: 'delete' },
      { text: 'Edit', target: '.e-gridheader', id: 'edit' },
      { text: 'Freeze', target: '.e-gridheader', id: 'paste' },
      { text: 'Filter', target: '.e-gridheader', id: 'paste' },
      { text: 'Multisort', target: '.e-gridheader', id: 'paste' },
      'Save',
      'Cancel',
      'FirstPage',
      'PrevPage',
      'LastPage',
      'NextPage'
    ];

    this.editing = { allowDeleting: true, allowEditing: true, mode: 'Row' };
    this.pageSettings = { pageSize: 20 };
    this.editparams = { params: { format: 'n' } };

    this.dropData = [
      { id: 'Parent', mode: 'Parent' },
      { id: 'Child', mode: 'Child' },
      { id: 'Both', mode: 'Both' },
      { id: 'None', mode: 'None' },
    ];
    this.fields = { text: 'mode', value: 'id' };
    this.selectionOptions = { type: 'Multiple' };
    this.toolbar = ['Add', 'Update', 'Cancel'];
  }

  contextMenuClick(args?): void {
    if (args.item.id === 'addnext') {
      //
    } else if (args.item.id === 'addchild') {
        var childRow = {
          name: 'newRow'
        };
        this.treeGridObj.addRecord(childRow, args.index); // call addRecord method with data and index of parent record as parameters
    } else if (args.item.id === 'cut') {
      this.treeGridObj.copy();
      this.treeGridObj.deleteRecord();
    } else if (args.item.id === 'copy') {
      this.treeGridObj.copy();
    } else if (args.item.id === 'paste') {
      // paste
    }
  }


  // on Hierachy mode changes
  onChange(e: ChangeEventArgs): any {
    const mode: any = e.value as string;
    this.treeGridObj.copyHierarchyMode = mode;
}
}
