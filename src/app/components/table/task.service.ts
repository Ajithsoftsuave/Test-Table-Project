import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Task } from './tasks.model';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class TaskService {

    tasksRef: AngularFireList<any> = null;

    constructor( private db: AngularFireDatabase ){
        this.tasksRef = db.list('/tasks');
    }

    getTaskList(): any{
        return this.db.list('/tasks').snapshotChanges().pipe(
            map((products: any[]) => products.map(prod => {
              const payload = prod.payload.val();
              const key = prod.key;
              return <any>{ key, ...payload };
            })),
          );
        // return this.db.list('tasks').valueChanges();
    }

    createTask(task: Task): void {
        this.tasksRef.push(task);
    }

    updateTask(key: string, value: any): Promise<void> {
        return this.tasksRef.update(key, value);
    }

    deleteTask(id: string): Promise<void> {
        return this.tasksRef.remove(id);
    }
}
