export interface ITask {
    _id: Object;
    complete: boolean;
    status: boolean;
    title: string;
    user: string;
    dueDate?: number;
}