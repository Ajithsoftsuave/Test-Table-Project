import { ChangeEventArgs } from '@syncfusion/ej2-dropdowns';

export class Task{
    key ?: any;
    id: string;
    taskName: string;
    resourceCount: number;
    team: string;
    progress: number;
    duration: number;
    priority: string;
    approved: boolean;
    subtasks: any[];
    isSubtask: boolean;
    sortId ?: number;
}

export interface TableActions{
    makeTreeGrid(): void;
    appendSubTasks(parentTask: Task): Task;
    getItemById(id: string): Task;
    getRowIndexById(iid: string, data: Task[]): number;
    openContextMenu(): void;
    ngAfterViewInit(): void;
    addnext(data: any): void;
    addchild(args: any): void;
    editRecord(data: any): void;
    pasteNextRecords(tasks: any, data): void;
    pasteChildRecords(tasks: any, parentTaskId: string, key: string): void;
    editRow(task: any, key: string): void;
    onFormSubmit(): void;
    onChange(e: ChangeEventArgs): any;
    addTask(): any;
    getCheckboxData(event: any, type: string): void;
    getChildsIndex(data, obj): void;
}
