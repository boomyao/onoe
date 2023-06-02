type TaskCallback = (task: Task, taskKey: string) => Promise<void>;

export abstract class TaskQueue {
    protected taskCallback?: TaskCallback
    setCallback(callback: TaskCallback) {
        this.taskCallback = callback;
    }

    abstract start(): Promise<void>;

    abstract addTask(task: Partial<Task>): Promise<string>;

    abstract getTasks(): Promise<Task[]>;

    abstract completeTask(taskKey: string): Promise<void>;

    abstract stop(): void;
}

export const enum TaskStatus {
    QUEUED = 'QUEUED',
    RUNNING = 'RUNNING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    ABORTED = 'ABORTED',
}

export interface Task {
    id: string
    name: string
    status: TaskStatus
    data: unknown
    timestamp: number
  }