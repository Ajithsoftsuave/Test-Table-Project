import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Task } from './tasks.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TaskService {
    private dbPath = '/tasks';
    tasksRef: AngularFireList<Task> = null;
    tasks: Observable<any>;

    constructor( private db: AngularFireDatabase, private firestore: AngularFirestore ){
        this.tasksRef = db.list(this.dbPath);
    }

    getTaskList(): any{
        return this.firestore.collection('tasks').valueChanges();
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
