import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Task } from './tasks.model';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TaskService {
    tasksRef: AngularFireList<Task> = null;

    constructor( private db: AngularFireDatabase ){
        this.tasksRef = db.list('/tasks');
    }

    getTaskList(): any{
        return this.db.list('tasks').valueChanges();
    }

    createTask(task: Task): void {
        this.tasksRef.push(task);
    }

    updateTask(key: string, value: any): Promise<void> {
        return this.tasksRef.update(key, value);
    }

    deleteCustomer(key: string): Promise<void> {
        return this.tasksRef.remove(key);
    }
}
