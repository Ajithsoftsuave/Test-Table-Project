export class Task{
    taskID: number;
    taskName: string;
    startDate: object;
    endDate: object;
    progress: number;
    duration: number;
    priority: string;
    approved: boolean;
    subtasks ?: Task[];
    isSubtask: boolean;
}
