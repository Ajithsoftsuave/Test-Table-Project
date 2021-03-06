import { Component, OnInit, ViewChild } from '@angular/core';
import {
  SortService,
  ResizeService,
  PageService,
  EditService,
  ContextMenuService,
  TreeGridComponent, ColumnChooserService, ToolbarService, Column,
} from '@syncfusion/ej2-angular-treegrid';
import { EditSettingsModel, SelectionSettingsModel } from '@syncfusion/ej2-treegrid';
import { ChangeEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { TableActions, Task } from './tasks.model';
import { TaskService } from './task.service';
import { v4 as uuidv4 } from 'uuid';
import { FormBuilder, FormGroup,FormControl,Validators  } from '@angular/forms';


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
export class TableComponent implements OnInit, TableActions{
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
  public selectionOptions: SelectionSettingsModel = {
    persistSelection: true
  };
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
  editcolumn = false;
  isCut = false;
  parentTasks: Task[];
  multipleSelectId: any[] = [];
  newcolumn: boolean;
  editForm = new FormGroup({
    datatype: new FormControl(''),
    Defaultvalue: new FormControl(''),
    ColumnWidth: new FormControl(''),
      fontsize: new FormControl(''),
      Fontcolor: new FormControl(''),
      Backgroundcolor: new FormControl(''),
      Alignment: new FormControl(''),
      textwrap: new FormControl(''),
    
  })
  columnForm = new FormGroup({
    Columnname: new FormControl('', [Validators.required]),
  })

  public constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
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
      { text: 'Add Next', target: '.e-content', id: 'addnext', enabled : true},
      { text: 'Add Child', target: '.e-content', id: 'addchild', enabled : true },
      { text: 'Delete', target: '.e-content', id: 'delete' },
      { text: 'Edit', target: '.e-content', id: 'edit', enabled : true },
      { text: 'Copy Rows', target: '.e-content', id: 'copy' },
      { text: 'Cut Rows', target: '.e-content', id: 'cut' },
      { text: 'Paste Next', target: '.e-content', id: 'pastenext', enabled : true },
      { text: 'Paste Child', target: '.e-content', id: 'pastechild', enabled : true },
      {
        text: 'Edit col',
        target: '.e-headercell',
        id: 'editcol',
        // items: [
        //   { text: 'Data-Type', id: 'datatype', items: [ { text: 'Text', id: 'dt-text'} , { text: 'Num', id: 'dt-num'} , { text: 'Date', id: 'dt-date'} , { text: 'Boolean', id: 'dt-bool'}, { text: 'Drop Down', id: 'dt-dropdown'}] },
        //   { text: 'Default-Value', id: 'defaultvalue' , items: [ { text: 'Text', id: 'dt-text'} , { text: 'Num', id: 'dt-num'} , { text: 'Date', id: 'dt-date'} , { text: 'Boolean', id: 'dt-bool'}, { text: 'Drop Down', id: 'dt-dropdown'}] },
        //   // tslint:disable-next-line:max-line-length
        //   { text: 'Minimum-Column-Width', id: 'minwidth' , items: [ { text: 'No', id: 'min-width-no' , wid: 0}, { text: 'Yes (Default: 100)', id: 'min-width-yes' , wid: 100} ] },
        //   { text: 'Font-size', id: 'fontsize' , items: [ { text: '10px', id: 'fs-10' }, { text: '13px', id: 'fs-13' }, { text: '20px', id: 'fs-20' }] },
        //   { text: 'Font-color', id: 'fontcolor', items: [ { text: 'white', id: 'cl-white' }, { text: 'black', id: 'cl-black' }]},
        //   { text: 'Background-color', id: 'bgcolr' , items: [ { text: 'red', id: 'bg-red' }, { text: 'blue', id: 'bg-blue' }, { text: 'white', id: 'bg-white' }] },
        //   { text: 'Alignment', id: 'alignment' , items: [ { text: 'Right', id: 'al-right' }, { text: 'Left', id: 'al-left' }, { text: 'Center', id: 'al-center' }, { text: 'Justify', id: 'al-justify' }] },
        //   { text: 'Text-wrap', id: 'textwrap' , items: [ { text: 'Clip', id: 'tw-clip' }, { text: 'EllipsisWithTooltip', id: 'tw-ellipsis-tooltip' }, { text: 'Ellipsis', id: 'tw-ellipsis' }] },
        // ],
      },
      { text: 'Freeze', target: '.e-headercell', id: 'freeze' },
      { text: 'Multisort', target: '.e-headercell', id: 'paste' },
      'Save',
      'Cancel',
      'FirstPage',
      'PrevPage',
      'LastPage',
      'NextPage',
      { text: 'Insert Column', target: '.e-headercontent', id: 'insert' },
      { text: 'Delete Column', target: '.e-headercontent', id: 'deleteColumn' },
      { text: 'Rename Column', target: '.e-headercontent', id: 'renameColumn' },
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
    this.tableData = this.tableData.sort((prevRecord, nextRecord): any => {
      if (prevRecord.sortId > nextRecord.sortId) {
        return 1;
      }

      if (prevRecord.sortId < nextRecord.sortId) {
        return -1;
      }

      return 0;
    });
  }

  // append subtasks
  public appendSubTasks(parentTask: Task): Task {
    // tslint:disable-next-line: prefer-for-of
    let i = 0;
    while (i < parentTask.subtasks.length){
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
      const prevElement = parentTask.subtasks[i];
      if (typeof prevElement !== 'string'){
        i = i + 1;
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

  public getRowIndexById(id: string, data: Task[]): number {
    // tslint:disable-next-line: prefer-for-of
    for (let index = 0; index < data.length; index++) {
      if (id === data[index].id) {
        return index;
      }
    }
    return null;
  }

  // tslint:disable-next-line: use-lifecycle-interface
  public ngAfterViewInit(): void {
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
  width = [
    {value:''},
    {value:'No',wid : 0},
    {value:'Yes (Default: 100)',wid : 100},
  ];
  alignment = [
    {value:''},
    {value:'Left'},
    {value:'Right'},
    {value:'Center'},
  {value:'Justify'}
];
  // while clicking options in context menu
  public contextMenuClick(args?): void {
    if (args.item.id === 'addnext') {
      this.addnext(args);
    } else if (args.item.id === 'addchild') {
      this.addchild(args);
    } else if (args.item.id === 'delete' && args.item.target === '.e-content') {
      this.deleteRow(args);
    } else if (args.item.id === 'cut' && args.item.target === '.e-content') {
      this.cutRow(args);
    } else if (args.item.id === 'copy' && args.item.target === '.e-content') {
      this.copyRow(args);
    } else if (args.item.id === 'pastenext' && args.item.target === '.e-content') {
      this.pasteNextRecords(this.copiedTasks, args);
    } else if (args.item.id === 'pastechild' && args.item.target === '.e-content') {
      this.pasteChildRecords(this.copiedTasks, args.rowInfo.rowData.taskData.id, args.rowInfo.rowData.taskData.key);
    } else if (args.item.id === 'edit' && args.item.target === '.e-content') {
      this.editRow(args.rowInfo.rowData.taskData, args.rowInfo.rowData.taskData.key);
    }else if (args.item.id === 'editcol') {
      this.editColumn();
    }else if (args.item.id === 'freeze') {
      this.freezeColumn();
    }else if (args.item.id === 'insert') {
     this.insertColumn();
    } else if (args.item.id === 'deleteColumn') {
      this.deleteColumn();
    } else if (args.item.id === 'renameColumn') {
      this.renameColumn();
    } else if (args.item.id === 'min-width-no' || args.item.id === 'min-width-yes') {
      this.setProperty('minWidth', args.item.wid);
      // this.treegrid.getColumnByField(this.activeContextMenuColumn.field).minWidth = args.item.wid;
      // this.treegrid.refreshColumns();
    // } else if (args.item.id === 'al-right' || args.item.id === 'al-left' || args.item.id === 'al-center' || args.item.id === 'al-justify') {
    //   this.setProperty('textAlign', args.item.text);
      // this.treegrid.getColumnByField(this.activeContextMenuColumn.field).textAlign = args.item.text;
      // this.treegrid.refreshColumns();
    }else if (args.item.id === 'tw-clip' || args.item.id === 'tw-ellipsis-tooltip' || args.item.id === 'tw-ellipsis') {
      this.setProperty('clipMode', args.item.text);
      // this.treegrid.getColumnByField(this.activeContextMenuColumn.field).clipMode = args.item.text;
      // this.treegrid.refreshColumns();
    }else if (args.item.id === 'bg-red' || args.item.id === 'bg-blue' ||  args.item.id === 'bg-white' ) {
       this.setBackGround();
    }else if (args.item.id === 'cl-white' || args.item.id === 'cl-black' ) {
      this.setBackGroundBlackAndWhite();
    }else if (args.item.id === 'fs-10' || args.item.id === 'fs-13' || args.item.id === 'fs-20' ) {
      this.setFontSize();
    }
  }

  private setProperty(name, value): void{
    this.treegrid.getColumnByField(this.activeContextMenuColumn.field)[name] = value;
    this.treegrid.refreshColumns();
  }

  public setBackGround(): void {
    let bgindex = -1;
       // @ts-ignore
    this.treegrid.getColumnByField(this.activeContextMenuColumn.field).customAttributes.class.forEach((a, index) => {
         if (a.includes('bg')) {
           bgindex = index;
         }
       });

    if (bgindex !== -1) {
         // @ts-ignore
         this.treegrid.getColumnByField(this.activeContextMenuColumn.field).customAttributes.class.splice(bgindex, 1);
       }

      // @ts-ignore
    this.treegrid.getColumnByField(this.activeContextMenuColumn.field).customAttributes.class.push(args.item.id);
    this.treegrid.refreshColumns();
  }

  public setBackGroundBlackAndWhite(): void {
    let clindex = -1;
      // @ts-ignore
    this.treegrid.getColumnByField(this.activeContextMenuColumn.field).customAttributes.class.forEach((a, index) => {
        if (a.includes('cl')) {
          clindex = index;
        }
      });

    if (clindex !== -1) {
        // @ts-ignore
        this.treegrid.getColumnByField(this.activeContextMenuColumn.field).customAttributes.class.splice(clindex, 1);
      }

      // @ts-ignore
    this.treegrid.getColumnByField(this.activeContextMenuColumn.field).customAttributes.class.push(args.item.id);
    this.treegrid.refreshColumns();
  }

  public setFontSize(): void {
    let fsindex = -1;
      // @ts-ignore
    this.treegrid.getColumnByField(this.activeContextMenuColumn.field).customAttributes.class.forEach((a, index) => {
        if (a.includes('fs')) {
          fsindex = index;
        }
      });

    if (fsindex !== -1) {
        // @ts-ignore
        this.treegrid.getColumnByField(this.activeContextMenuColumn.field).customAttributes.class.splice(fsindex, 1);
      }

      // @ts-ignore
    this.treegrid.getColumnByField(this.activeContextMenuColumn.field).customAttributes.class.push(args.item.id);
    this.treegrid.refreshColumns();
  }

  public deleteRow(args: any): void{
    if (
        confirm('Are you sure you want to delete selected items permanently?')
      ) {
        if (this.multipleSelectId.length > 1) {
          for (const selectId of this.multipleSelectId) {
            const data = this.getItemById(selectId);
            this.taskService.deleteTask(data.key);
            this.multipleSelectId = [];
          }
        } else {
          this.taskService.deleteTask(args.rowInfo.rowData.taskData.key);
          this.multipleSelectId = [];
        }
      } else {
        return;
      }
  }

  public cutRow(args: any): void {
    this.isCut = true;
    this.copiedTasks = [];
    if (this.multipleSelectId.length > 1) {
      for (const selectId of this.multipleSelectId) {
        this.copiedTasks.push(this.getItemById(selectId));
      }
    } else {
      this.copiedTasks.push(this.getItemById(args.rowInfo.rowData.taskData.id));
    }
      // this.taskService.deleteTask(args.rowInfo.rowData.taskData.key);
  }

  public copyRow(args: any): void {
    this.isCut = false;
    this.copiedTasks = [];
    if (this.multipleSelectId.length > 1) {
        for (const selectId of this.multipleSelectId) {
          this.copiedTasks.push(this.getItemById(selectId));
        }
      } else {
        this.copiedTasks.push(
          this.getItemById(args.rowInfo.rowData.taskData.id)
        );
      }
  }

  public editColumn(){
    this.editcolumn = true;
    this.newcolumn = false;
    
  }

  public freezeColumn(): void {
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
  }

  public closepopup(){
    this.editcolumn = false;
  }

  public insertColumn(): void{
    this.newcolumn = true; 


    
  }

  public deleteColumn(): void {
    let columnIndex;
    this.treegrid.columns.forEach((col, index) => {
        if ( col.field === this.activeContextMenuColumn.field ) {
          columnIndex = index;
        }
      });

    this.treegrid.columns.splice(columnIndex, 1); // Splice columns
    this.treegrid.refreshColumns(); // Refresh Columns
  }

  public renameColumn(): void {
    const data = this.activeContextMenuColumn.field;
    const headerTxt = prompt('Enter the header name');
    this.treegrid.getColumnByField(data).headerText = headerTxt;
    this.treegrid.refreshColumns();
  }
  // tslint:disable-next-line: typedef
  public addnext(data: any) {
    const newRecordId = uuidv4();
    this.childRow = {
      id: newRecordId,
      taskName: 'New Record',
      resourceCount: null,
      team: null,
      progress: null,
      duration: null,
      priority: null,
      approved: null,
      isSubtask: null,
      subtasks: null,
    };
    if (data.rowInfo.rowData.taskData.isSubtask){
      this.childRow.isSubtask = true;
      let recordToUpdate: Task;
      for (const task of this.responseData){
        if (task.subtasks){
          for (let index = 0; index < task.subtasks.length; index++){
            task.subtasks[index] = task.subtasks[index].id;
          }
          if (task.subtasks[0] && task.subtasks.includes(data.rowInfo.rowData.taskData.id)){
          task.subtasks.splice(task.subtasks.indexOf(data.rowInfo.rowData.taskData.id) + 1, 0, newRecordId);
          recordToUpdate = task;
        }}
      }
      this.taskService.createTask(this.childRow);
      this.taskService.updateTask(recordToUpdate.key , recordToUpdate);

    } else{
      this.childRow.isSubtask = false;
      const prevIndex = this.getRowIndexById(data.rowInfo.rowData.taskData.id , this.tableData);
      if (prevIndex !== this.tableData.length - 1){
      this.childRow.sortId = (this.tableData[prevIndex].sortId + this.tableData[prevIndex + 1].sortId) / 2;
      } else {
      this.childRow.sortId = this.tableData[prevIndex].sortId + 1;
      }
      this.taskService.createTask(this.childRow);
    }
  }

  public addchild(args: any): void {
    const newRecordId = uuidv4();
    this.childRow = {
      id: newRecordId,
      taskName: 'New Record',
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
  public editRecord(data: any): void {
    this.editing = {
      allowEditing: true,
      allowAdding: true,
      allowDeleting: true,
      mode: 'Row',
      newRowPosition: 'Child',
    };
    const index = data.index;
  }

  public pasteNextRecords(tasksList: any, data: any): void {
    const tasks = [...tasksList];
    if (!tasks){
      alert('No copied value');
      return;
    }
    if (this.isCut){
      for (const task of tasksList) {
        if (task.key){
          this.taskService.deleteTask(task.key);
        }
      }
      this.isCut = false;
    }
    const newRecordId = uuidv4();
    if (tasks.length) {
      for (const taskRow of tasks) {
        delete taskRow.key;
        this.childRow = taskRow;
        if (data.rowInfo.rowData.taskData.isSubtask){
          this.childRow.isSubtask = true;
          let recordToUpdate: Task;
          for (const task of this.responseData){
            if (task.subtasks){
              for (let index = 0; index < task.subtasks.length; index++){
                task.subtasks[index] = task.subtasks[index].id;
              }
              if (task.subtasks[0] && task.subtasks.includes(data.rowInfo.rowData.taskData.id)){
                task.subtasks.splice(task.subtasks.indexOf(data.rowInfo.rowData.taskData.id) + 1, 0, newRecordId);
                recordToUpdate = task;
              }}
          }
          this.childRow.id = newRecordId;
          this.taskService.createTask(this.childRow);
          this.taskService.updateTask(recordToUpdate.key , recordToUpdate);

        } else{
          this.childRow.isSubtask = false;
          const prevIndex = this.getRowIndexById(data.rowInfo.rowData.taskData.id , this.tableData);
          if (prevIndex !== this.tableData.length - 1){
            this.childRow.sortId = (this.tableData[prevIndex].sortId + this.tableData[prevIndex + 1].sortId) / 2;
          } else {
            this.childRow.sortId = this.tableData[prevIndex].sortId + 1;
          }
          this.childRow.id = newRecordId;
          this.taskService.createTask(this.childRow);
        }
      }
    }

  }

  public pasteChildRecords(tasksList: any, parentTaskId: string, key: string): void {
    const tasks = [...tasksList];
    if (!tasks){
      alert('No copied value');
      return;
    }
    if (this.isCut){
      for (const task of tasksList) {
        this.taskService.deleteTask(task.key);
      }
      this.isCut = false;
    }
    for (const task of tasks) {
      if (task.id === parentTaskId){
        alert('can not paste same task as child task to itsekf');
        return;
      }
      task.isSubtask = true;
      task.id = uuidv4();
      delete task.key;
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

  public editRow(task: any, key: string): void{
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
    if (this.formTask.subtasks){
      for (let index = 0; index < this.formTask.subtasks.length; index++){
        this.formTask.subtasks[index] = this.formTask.subtasks[index].id;
      }
    }
  }
  public onEditformSubmit() {    
    if(this.editForm.get('Alignment').value.value){
    this.setProperty('textAlign',this.editForm.get('Alignment').value.value );
    }
    if(this.editForm.get('ColumnWidth').value.value){
      this.setProperty('minWidth',this.editForm.get('ColumnWidth').value.wid);
    }
    this.editcolumn = false;
  }

  public onSubmit(){    
      const headertxt =  this.columnForm.get('Columnname').value;
        // tslint:disable-next-line: prefer-const
      let c = <Column[]>
          // tslint:disable-next-line: quotemark
          // tslint:disable-next-line: max-line-length
          [  { field: headertxt.replace(/\s/g, ''), headerText: headertxt, width: 130, format: 'yMd', textAlign: 'Right' ,allowReordering: true },
          ];
        // tslint:disable-next-line: align
        // tslint:disable-next-line: prefer-for-of
      for ( let i = 0; i < c.length; i++ ) {
          (this.treegrid.columns as Column[]).push(c[i]);
          this.treegrid.refreshColumns(); 
      }
     this.newcolumn = false;
  }
  public closecolumn(){
    this.newcolumn = false;
  }

  public onFormSubmit(): void{
    this.formTask.taskName = this.taskForm.get('taskName').value;
    this.formTask.resourceCount = this.taskForm.get('resourceCount').value;
    this.formTask.progress = this.taskForm.get('progress').value;
    this.formTask.duration = this.taskForm.get('duration').value;
    this.formTask.priority = this.taskForm.get('priority').value;
    this.formTask.approved = this.taskForm.get('approved').value;

    this.taskService.updateTask(this.editKey, this.formTask);
    this.isEditing = false;
  }


  // on Hierachy mode changes
  public onChange(e: ChangeEventArgs): any {
    const mode: any = e.value as string;
    this.treeGridObj.copyHierarchyMode = mode;
  }

  public addTask(): any {
    let sortId = 1;
    if (this.tableData.length > 0){
      sortId = this.tableData[this.tableData.length - 1].sortId + 1;
    } else {
      sortId = 1;
    }
    this.task = {
      id: uuidv4(),
      taskName: 'New Parent task',
      resourceCount: null,
      team: null,
      duration: null,
      progress: null,
      priority: null,
      approved: null,
      isSubtask: null,
      subtasks: null,
      sortId
    };

    this.taskService.createTask(this.task);
  }

  public getCheckboxData(event: any, type: string): void {
    if (type === 'select') {
      const selectedIndex = {indexs: [], id: []};
      this.getChildsIndex(event.data, selectedIndex);
      this.treegrid.selectCheckboxes(selectedIndex.indexs);
      this.multipleSelectId.push(event.data.id);
      for (const value of selectedIndex.id) {
        this.multipleSelectId.push(value);
      }
      if (this.multipleSelectId.length === 1){
        this.contextMenuItems[0].enabled = true;
        this.contextMenuItems[1].enabled = true;
        this.contextMenuItems[3].enabled = true;
        this.contextMenuItems[6].enabled = true;
        this.contextMenuItems[7].enabled = true;
        const temp = [...this.contextMenuItems];
        this.contextMenuItems = [...temp];
      } else {
        this.contextMenuItems[0].enabled = false;
        this.contextMenuItems[1].enabled = false;
        this.contextMenuItems[3].enabled = false;
        this.contextMenuItems[6].enabled = false;
        this.contextMenuItems[7].enabled = false;
        const temp = [...this.contextMenuItems];
        this.contextMenuItems = [...temp];
      }
    } else {
      if (this.multipleSelectId.length) {
        const index = this.multipleSelectId.indexOf(event.data.id);
        if (index > -1) {
          this.multipleSelectId.splice(index, 1);
        }
        const selectedIndex = {indexs: [], id: []};
        this.getChildsIndex(event.data, selectedIndex);

        for (const [key, element] of selectedIndex.id.entries()) {
          const indexChild = this.multipleSelectId.indexOf(element);
          if (indexChild > -1) {
            this.multipleSelectId.splice(indexChild, 1);
            this.treeGridObj.getRowByIndex(selectedIndex.indexs[key]).getElementsByTagName('span')[0].classList.remove('e-check');
            // tslint:disable-next-line: max-line-length
            this.treeGridObj.getRowByIndex(selectedIndex.indexs[key]).getElementsByClassName('e-gridchkbox')[0].parentElement.classList.remove('e-disable-interaction');
          }
        }
        // this.treegrid.clearSelection();
        // this.treegrid.refreshColumns();
        if (this.multipleSelectId.length) {
          const indexArray = [];
          for (const select of this.multipleSelectId) {
            try{
              indexArray.push(this.getRowIndexById(select.id, this.tableData));
            } catch {
              //
            }
          }
          if (this.multipleSelectId.length === 1){
            this.contextMenuItems[0].enabled = true;
            this.contextMenuItems[1].enabled = true;
            this.contextMenuItems[3].enabled = true;
            this.contextMenuItems[6].enabled = true;
            this.contextMenuItems[7].enabled = true;
            const temp = [...this.contextMenuItems];
            this.contextMenuItems = [...temp];
          } else {
            this.contextMenuItems[0].enabled = false;
            this.contextMenuItems[1].enabled = false;
            this.contextMenuItems[3].enabled = false;
            this.contextMenuItems[6].enabled = false;
            this.contextMenuItems[7].enabled = false;
            const temp = [...this.contextMenuItems];
            this.contextMenuItems = [...temp];
          }
          this.treegrid.selectCheckboxes(indexArray);
        }
      }
    }
  }

  // tslint:disable-next-line: typedef
  public getChildsIndex(data, obj) {
    const childAll = data.childRecords;

    if (childAll && childAll.length) {
      childAll.map((child) => {
        if (child.childRecords) {
          this.getChildsIndex(child, obj);
        }
        this.treeGridObj.getRowByIndex(child.index).getElementsByClassName('e-gridchkbox')[0].parentElement.classList.add('e-disable-interaction');
        obj.indexs.push(child.index);
        obj.id.push(child.id);
      });
    }
  }
}
