export class Task{
    id: string;
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
