import { Component, OnInit, ViewChild } from '@angular/core';
import {
  SortService,
  ResizeService,
  PageService,
  EditService,
  ContextMenuService,
  TreeGridComponent, ColumnChooserService, ToolbarService,
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
import { element } from 'protractor';
import { FormBuilder, FormGroup, Validator } from '@angular/forms';

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
    ToolbarService,
    ColumnChooserService
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

  private activeContextMenuColumn;

  public contextMenuItems;
  @ViewChild('treegrid')
  public treeGridObj: TreeGridComponent;

  @ViewChild(TreeGridComponent, { static: false }) treegrid: TreeGridComponent;

  public copiedTasks: any;

  // tslint:disable-next-line: ban-types
  public dropData: Object[];
  // tslint:disable-next-line: ban-types
  public fields: Object;
  public selectionOptions: SelectionSettingsModel;
  public toolbar: any;
  public selectedIndex = -1;
  public freezeIndex = 0;
  gridInstance: any;
  public task: Task;
  public childRow: Task;
  public formTask: Task;
  public editKey: any;
  // tslint:disable-next-line: ban-types
  public contextMenuValue: Object;
  treegridColumns: Array<any> = new Array();
  taskForm: FormGroup;
  isEditing = false;

  constructor(
    private fb: FormBuilder,
    private clipboardService: ClipboardService,
    private taskService: TaskService,
    private db: AngularFireDatabase
  ) {
    // this.data = sampleData;
    taskService.getTaskList().subscribe((data) => {
      this.responseData = data;
      this.makeTreeGrid();
    });
  }

  ngOnInit(): void {
    // items should be in context menu. type string are default, type object are custom options
    this.contextMenuItems = [
      { text: 'Add Next', target: '.e-content', id: 'addnext' },
      { text: 'Add Child', target: '.e-content', id: 'addchild' },
      { text: 'Delete', target: '.e-content', id: 'delete' },
      { text: 'Edit', target: '.e-content', id: 'edit' },
      { text: 'Copy', target: '.e-content', id: 'copy' },
      { text: 'Cut', target: '.e-content', id: 'cut' },
      { text: 'Paste Next', target: '.e-content', id: 'pastenext' },
      { text: 'Paste Child', target: '.e-content', id: 'pastechild' },
      {
        text: 'Style',
        target: '.e-headercell',
        id: 'paste',
        items: [
          { text: 'Data-Type', id: 'datatype' },
          { text: 'Default-Value', id: 'defaultvalue' },
          { text: 'Minimum-Column-Width', id: 'minwidth' },
          { text: 'Font-size', id: 'fontsize' },
          { text: 'Font-color', id: 'fontcolor' },
          { text: 'Background-color', id: 'bgcolr' },
          { text: 'Alignment', id: 'alignment' , items: [ { text: 'Right', id: 'al-right' }, { text: 'Left', id: 'al-left' }, { text: 'Center', id: 'al-center' }, { text: 'Justify', id: 'al-justify' }] },
          { text: 'Text-wrap', id: 'textwrap'},
        ],
      },
      { text: 'New', target: '.e-headercell', id: 'new' },
      { text: 'Delete', target: '.e-headercell', id: 'delete' },
      { text: 'Edit', target: '.e-headercell', id: 'edit' },
      { text: 'Freeze', target: '.e-headercell', id: 'freeze' },
      { text: 'Filter', target: '.e-headercell', id: 'paste' },
      { text: 'Multisort', target: '.e-headercell', id: 'paste' },
      'Save',
      'Cancel',
      'FirstPage',
      'PrevPage',
      'LastPage',
      'NextPage',
      { text: 'Insert Column', target: '.e-headercontent', id: 'insert' },
      { text: 'Delete Column', target: '.e-headercontent', id: 'deleteColumn' },
      { text: 'Rename Column', target: '.e-headercontent', id: 'rename' },
    ];

    this.editing = {
      allowDeleting: true,
      allowEditing: true,
      allowAdding: true,
      mode: 'Row',
    };
    this.editparams = { params: { format: 'n' } };

    this.dropData = [
      { id: 'Parent', mode: 'Parent' },
      { id: 'Child', mode: 'Child' },
      { id: 'Both', mode: 'Both' },
      { id: 'None', mode: 'None' },
    ];
    this.fields = { text: 'mode', value: 'id' };
    this.selectionOptions = { type: 'Multiple' };
    this.toolbar = ['ColumnChooser'];
  }

  // Stucture the DB data to treegrid
  // tslint:disable-next-line: typedef
  public makeTreeGrid() {
    this.tableData = [];
    for (const singleRecord of this.responseData) {
      if (!singleRecord.isSubtask) {
        if (singleRecord.subtasks) {
          this.tableData.push(this.appendSubTasks(singleRecord));
        } else {
          this.tableData.push(singleRecord);
        }
      }
    }
  }

  // append subtasks
  public appendSubTasks(parentTask: Task): Task {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < parentTask.subtasks.length; i++) {
      if (this.getItemById(parentTask.subtasks[i])?.subtasks) {
        parentTask.subtasks[i] = this.appendSubTasks(
          this.getItemById(parentTask.subtasks[i])
        );
      } else {
        const fetchedRecord = this.getItemById(parentTask.subtasks[i]);
        if (fetchedRecord) {
          parentTask.subtasks[i] = this.getItemById(parentTask.subtasks[i]);
        } else {
          parentTask.subtasks.splice(i, 1);
        }
      }
    }
    return parentTask;
  }

  // tslint:disable-next-line:typedef
  public openContextMenu(args?) {
    // tslint:disable-next-line:max-line-length
     if (args.rowInfo.target.classList.contains('e-headercell') || args.rowInfo.target.classList.contains('e-headercelldiv') || args.rowInfo.target.classList.contains('e-headertext') ) {
       this.activeContextMenuColumn = args.column;
     }
  }

  // fetching record by Id
  public getItemById(id: string): Task {
    for (const task of this.responseData) {
      if (id === task.id) {
        return task;
      }
    }
    return null;
  }

  getIndexById(id: string): number {
    // tslint:disable-next-line: prefer-for-of
    for (let index = 0; index < this.responseData.length; index++) {
      if (id === this.responseData[index].id) {
        return index;
      }
    }
    return null;
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngAfterViewInit(): void {
    this.treegridColumns = [
      {
        field: 'id',
        headerText: 'ID',
        isPrimaryKey: 'true',
        width: '140',
        textAlign: 'Right',
        editType: 'numericedit',
      },
      { field: 'taskName', headerText: 'Task Name', width: '110' },
      { field: 'resourceCount', headerText: 'Resource Count', width: '90' },
      { field: 'team', headerText: 'Team', width: '70' },
      {
        field: 'duration',
        headerText: 'Duration',
        width: '85',
        textAlign: 'Right',
        editType: 'numericedit',
      },
      {
        field: 'progress',
        headerText: 'Progress',
        width: '90',
        textAlign: 'Right',
        editType: 'numericedit',
      },
      {
        field: 'priority',
        headerText: 'Priority',
        width: '80',
        textAlign: 'Right',
        editType: 'stringedit',
      },
      {
        field: 'approved',
        headerText: 'Approved',
        width: '80',
        textAlign: 'Right',
        editType: 'stringedit',
      },
    ];
  }
  // while clicking options in context menu
  contextMenuClick(args?): void {
    if (args.item.id === 'addnext') {
      this.addnext(args);
    } else if (args.item.id === 'addchild') {
      this.addchild(args);
    } else if (args.item.id === 'delete' && args.item.target === '.e-content') {
      this.taskService.deleteTask(args.rowInfo.rowData.taskData.key);
    } else if (args.item.id === 'cut' && args.item.target === '.e-content') {
      this.copiedTasks = [];
      this.copiedTasks.push(this.getItemById(args.rowInfo.rowData.taskData.id));
      this.taskService.deleteTask(args.rowInfo.rowData.taskData.key);
    } else if (args.item.id === 'copy' && args.item.target === '.e-content') {
      this.copiedTasks = [];
      this.copiedTasks.push(this.getItemById(args.rowInfo.rowData.taskData.id));
    } else if (args.item.id === 'pastenext' && args.item.target === '.e-content') {
      this.pasteNextRecords(this.copiedTasks);
    } else if (args.item.id === 'pastechild' && args.item.target === '.e-content') {
      this.pasteChildRecords(this.copiedTasks, args.rowInfo.rowData.taskData.id, args.rowInfo.rowData.taskData.key);
    } else if (args.item.id === 'edit' && args.item.target === '.e-content') {
      this.editRow(args.rowInfo.rowData.taskData, args.rowInfo.rowData.taskData.key);
    }else if (args.item.id === 'freeze') {
      const treegridtreegridcomp = window.localStorage.getItem('treegridtreegridcomp');
      const treegridtreegridcompJSON = JSON.parse(treegridtreegridcomp);

      if (treegridtreegridcomp) {
       treegridtreegridcompJSON.columns.forEach((column, index, arr) => {
          if (column && column.field === this.activeContextMenuColumn.field ) {
            if ( index + 1 !== arr.length) {
              this.freezeIndex = index + 1;
            }
          }
        });
    }

    }else if (args.item.id === 'insert') {
      const columnName = { field: 'data', width: 100 };
    // this.treegrid.columns.push(columnName); // Insert Columns
      this.treegrid.refreshColumns(); // Refresh Columns
    } else if (args.item.id === 'deleteColumn') {
      const columnName = 2;
      this.treegrid.columns.splice(columnName, 1); // Splice columns
      this.treegrid.refreshColumns(); // Refresh Columns
    } else if (args.item.id === 'rename') {
      const data = args.column.field;
      this.treegrid.getColumnByField(data).headerText = 'Task details'; // Rename column name
      this.treegrid.refreshColumns(); // Refresh Columns
    } else if (args.item.id === 'al-right' || args.item.id === 'al-left' || args.item.id === 'al-center' || args.item.id === 'al-justify') {
      this.treegrid.getColumnByField(this.activeContextMenuColumn.field).textAlign = args.item.text;
      this.treegrid.refreshColumns();
    }
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
      isSubtask: null,
      subtasks: null,
    };
    this.responseData.splice(
      this.getIndexById(data.rowInfo.rowData.taskData.id) + 1,
      0,
      this.childRow
    );
    this.taskService.createTask(this.childRow);
  }

  addchild(args: any): void {
    const newRecordId = uuidv4();
    this.childRow = {
      id: newRecordId,
      taskName: null,
      resourceCount: null,
      team: null,
      progress: null,
      duration: null,
      priority: null,
      approved: null,
      isSubtask: true,
      subtasks: null,
    };
    this.taskService.createTask(this.childRow);
    const recordToUpdate: Task = this.getItemById(
      args.rowInfo.rowData.taskData.id
    );
    if (recordToUpdate.subtasks) {
      for (let index = 0; index < recordToUpdate.subtasks.length; index++) {
        recordToUpdate.subtasks[index] = recordToUpdate.subtasks[index].id;
      }
      recordToUpdate.subtasks.push(newRecordId);
    } else {
      recordToUpdate.subtasks = [newRecordId];
    }
    this.taskService.updateTask(
      args.rowInfo.rowData.taskData.key,
      recordToUpdate
    );
  }
  editRecord(data: any): void {
    this.editing = {
      allowEditing: true,
      allowAdding: true,
      allowDeleting: true,
      mode: 'Row',
      newRowPosition: 'Child',
    };
    const index = data.index;
  }

  pasteNextRecords(tasks: any): void {
    if (!tasks){
      alert('No copied value');
      return;
    }
    for (const task of tasks) {
      task.id = uuidv4();
      this.taskService.createTask(task);
    }
  }

  pasteChildRecords(tasks: any, parentTaskId: string, key: string): void {
    if (!tasks){
      alert('No copied value');
      return;
    }
    for (const task of tasks) {
      if (task.id === parentTaskId){
        alert('can not paste same task as child task to itsekf');
        return;
      }
      task.isSubtask = true;
      task.id = uuidv4();
      this.taskService.createTask(task);
    }
    const recordToUpdate: Task = this.getItemById(
      parentTaskId
    );
    if (recordToUpdate.subtasks) {
      for (let index = 0; index < recordToUpdate.subtasks.length; index++) {
        recordToUpdate.subtasks[index] = recordToUpdate.subtasks[index].id;
      }
      for (const task of tasks){
        recordToUpdate.subtasks.push(task.id);
      }
    } else {
      for (let index = 0; index < tasks.length; index++){
        if (index === 0) {
          recordToUpdate.subtasks = [(tasks[index].id)];
        } else {
          recordToUpdate.subtasks.push(tasks[index].id);
        }
      }
    }
    this.taskService.updateTask(
      key,
      recordToUpdate
    );
  }

  editRow(task: any, key: string): void{
    this.editKey = key;
    this.formTask = task;
    this.isEditing = true;
    this.taskForm = this.fb.group({
      id: [task.id],
      taskName: [task.taskName],
      resourceCount: [task.resourceCount],
      team: [task.team],
      progress: [task.progress],
      duration: [task.duration],
      priority: [task.priority],
      approved: [task.approved],
    });
  }

  onFormSubmit(): void{
    this.formTask.taskName = this.taskForm.get('taskName').value;
    this.formTask.resourceCount = this.taskForm.get('resourceCount').value;
    this.formTask.progress = this.taskForm.get('progress').value;
    this.formTask.duration = this.taskForm.get('duration').value;
    this.formTask.priority = this.taskForm.get('priority').value;
    this.formTask.approved = this.taskForm.get('approved').value;

    this.taskService.updateTask(this.editKey, this.formTask);
    this.isEditing = false
  }

  // on Hierachy mode changes
  onChange(e: ChangeEventArgs): any {
    const mode: any = e.value as string;
    this.treeGridObj.copyHierarchyMode = mode;
  }

  public addTask(): any {
    this.task = {
      id: '63858fa0-fafe-4871-ad8c-6ff9fa9947ff',
      taskName: 'Paren task 3',
      resourceCount: 10,
      team: 'Test team',
      duration: 5,
      progress: 100,
      priority: 'Normal',
      approved: false,
      isSubtask: false,
      subtasks: null,
    };

    this.taskService.createTask(this.task);
  }
}
