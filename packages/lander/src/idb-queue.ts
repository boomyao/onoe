import { type IDBPDatabase, openDB } from 'idb';
import { type Task, TaskQueue, TaskStatus } from './task-queue';

export class IDBTaskQueue extends TaskQueue {
    private dbName = 'idb-task-queue-db'
    private storeName = 'tasks'
    private db: IDBPDatabase | null = null;
    private interval = 100;
    private timer?: number;
    private isExecuting = false;
    constructor() {
        super();
    }

    async start(): Promise<void> {
        await this.initializeDB()
        await this.startExecution()
    }

    stop(): void {
        clearInterval(this.timer)
    }

    async initializeDB() {
        this.db = await openDB(this.dbName, 1, {
            upgrade(db) {
                db.createObjectStore(this.storeName, { autoIncrement: true });
            },
        });
    }

    private startExecution() {
        if (this.timer) return;

        this.timer = setInterval(() => {
            this.executeTask();
        }, this.interval);
    }

    async executeTask() {
        if (this.isExecuting) return;

        this.isExecuting = true;

        const tasks = await this.getTasks();

        if (tasks.length > 0) {
            const task = tasks[0];

            // The callback executes the task, and receives the taskKey as a second argument
            if (this.taskCallback) {
                await this.taskCallback(task, task.id);
            }

            // Once the task is done, mark it as complete
            await this.completeTask(task.id);
        }

        this.isExecuting = false;
    }

    async addTask(task: { name: string; data: any; }) {
        if (!this.db) await this.initializeDB();

        const newTask: Task = {
            ...task,
            // random id
            id: Math.random().toString(36).substring(7),
            status: TaskStatus.QUEUED,
            timestamp: Date.now(),
        }

        const key = await this.db!.add(this.storeName, newTask) as string;

        return key
    }

    async getTasks() {
        if (!this.db) await this.initializeDB();

        return await this.db!.getAll(this.storeName) as Task[];
    }

    async completeTask(taskKey) {
        if (!this.db) await this.initializeDB();

        await this.db!.delete(this.storeName, taskKey);
    }
}

export default TaskQueue;
