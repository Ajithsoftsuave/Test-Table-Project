export class Task{
    taskID: number;
    taskName: string;
    resourceCount: number;
    team: string;
    progress: number;
    duration: number;
    priority: string;
    approved: boolean;
    subtasks ?: Task[];
    isSubtask: boolean;
}
