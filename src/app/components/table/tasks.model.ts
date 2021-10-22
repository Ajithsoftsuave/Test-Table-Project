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
