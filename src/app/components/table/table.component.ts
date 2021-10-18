import { Component, OnInit, ViewChild } from '@angular/core';
import {
  SortService,
  ResizeService,
  PageService,
  EditService,
  ContextMenuService,
  TreeGridComponent,
} from '@syncfusion/ej2-angular-treegrid';
import { EditSettingsModel, ToolbarItems } from '@syncfusion/ej2-treegrid';
import { MenuEventArgs } from '@syncfusion/ej2-navigations';
import { ClipboardService } from 'ngx-clipboard';
import { SelectionSettingsModel } from '@syncfusion/ej2-angular-treegrid';
import { ChangeEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { Task } from './tasks.model';
import { TaskService } from './task.service';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

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
  public responseData: Task[];
  public tableData: Task[] = [];
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
  public task: Task;
  public childRow: Task;

  constructor(
    private clipboardService: ClipboardService,
    private taskService: TaskService,
    private db: AngularFireDatabase
  ) {
    // this.data = sampleData;
    taskService.getTaskList().subscribe((data) => {
      this.responseData = data;
      for (const singleRecord of data){
        if (!singleRecord.isSubtask){
        if (singleRecord.subtasks){
          this.tableData.push(this.appendSubTasks(singleRecord));
        }else{
          this.tableData.push(singleRecord);
        }
      }}
      console.log(this.tableData);
    });
  }

  ngOnInit(): void {

    // items should be in context menu. type string are default, type object are custom options
    this.contextMenuItems = [
      { text: 'Add Next', target: '.e-content', id: 'addnext' },
      { text: 'Add Child', target: '.e-content', id: 'addchild' },
      { text: 'Delete', target: '.e-content', id: 'delete' },
      'Edit',
      'Copy',
      { text: 'Cut', target: '.e-content', id: 'cut' },
      { text: 'Paste', target: '.e-content', id: 'paste' },
      {
        text: 'Style',
        target: '.e-gridheader',
        id: 'paste',
        items: [
          { text: 'Data-Type', id: 'datatype' },
          { text: 'Default-Value', id: 'defaultvalue' },
          { text: 'Minimum-Column-Width', id: 'minwidth' },
          { text: 'Font-size', id: 'fontsize' },
          { text: 'Font-color', id: 'fontcolor' },
          { text: 'Background-color', id: 'bgcolr' },
          { text: 'Alignment', id: 'alignment' },
          { text: 'Text-wrap', id: 'textwrap' },
        ],
      },
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
      'NextPage',
    ];

    this.editing = { allowDeleting: true, allowEditing: true, allowAdding: true, mode: 'Row' };
    this.editparams = { params: { format: 'n' } };

    this.dropData = [
      { id: 'Parent', mode: 'Parent' },
      { id: 'Child', mode: 'Child' },
      { id: 'Both', mode: 'Both' },
      { id: 'None', mode: 'None' },
    ];
    this.fields = { text: 'mode', value: 'id' };
    this.selectionOptions = { type: 'Multiple' };
    this.toolbar = ['Add', 'Edit', 'Update', 'Cancel'];
  }

  // append subtasks
  public appendSubTasks(parentTask: Task): Task{
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < parentTask.subtasks.length; i++){
      if (this.getItemById(parentTask.subtasks[i])?.subtasks){
        parentTask.subtasks[i] = this.appendSubTasks(parentTask.subtasks[i]);
      } else{
        parentTask.subtasks[i] = this.getItemById(parentTask.subtasks[i]);
      }
    }

    return parentTask;
  }

  // fetching record by Id
  public getItemById(id: string): Task{
    for (const task of this.responseData){
      if ( id === task.id ){
        return task;
      }
    }
  }

  // while clicking options in context menu
  contextMenuClick(args?): void {
    if (args.item.id === 'addnext') {
      this.addnext(args);
    } else if (args.item.id === 'addchild') {
      this.addchild(args);
    } else if (args.item.id === 'delete') {
      this.taskService.deleteTask(args.rowInfo.rowData.taskData.key);
    } else if (args.item.id === 'cut') {
      this.treeGridObj.copy();
      this.treeGridObj.deleteRecord();
    } else if (args.item.id === 'copy') {
      //
    } else if (args.item.id === 'paste') {
      //
    } else if (args.item.text === 'Edit Record'){
      this.editRecord(args);
    }
  }

  addchild(data: any): void {
    this.childRow = {
      id : uuidv4(),
      taskName: null,
      resourceCount: null,
      team: null,
      progress: null,
      duration: null,
      priority: null,
      approved: null,
      isSubtask : true,
      subtasks : null
    };
    this.taskService.createTask(this.childRow);
    this.editing = {
      allowEditing: true,
      allowAdding: true,
      allowDeleting: true,
      mode: 'Row',
      newRowPosition: 'Child',
    };

    const index = data.index;
    this.treeGridObj.selectRow(index); // select the newly added row to scroll to it
  }
  editRecord(data: any): void{
    this.editing = {
      allowEditing: true,
      allowAdding: true,
      allowDeleting: true,
      mode: 'Row',
      newRowPosition: 'Child',
    };
    const index = data.index;
    console.log(index);
  }

  addnext(data: any): void {
    this.childRow = {
      id: uuidv4(),
      taskName: null,
      resourceCount: null,
      team: null,
      progress: null,
      duration: null,
      priority: null,
      approved: null,
      isSubtask : false,
      subtasks : null
    };

    this.taskService.createTask(this.childRow);
  }

  // on Hierachy mode changes
  onChange(e: ChangeEventArgs): any {
    const mode: any = e.value as string;
    this.treeGridObj.copyHierarchyMode = mode;
  }

  public addTask(): any {
    this.task = {
      id: '40858fa0-fafe-4871-ad8c-6ff9fa9947fe',
      taskName: 'Sub task 2',
      resourceCount: 10,
      team: 'Test team',
      duration: 5,
      progress: 100,
      priority: 'Normal',
      approved: false,
      isSubtask: true,
      subtasks: null
    };

    this.taskService.createTask(this.task);
  }
}
