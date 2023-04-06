import * as ProjectModel from "../model/project";

type Listener<T> = (items: T[]) => void;

class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(listenerFunction: Listener<T>): void {
        this.listeners.push(listenerFunction);
    }
}

export class ProjectState extends State<ProjectModel.Project> {
    private projects: ProjectModel.Project[] = [];
    private static instance: ProjectState;

    private constructor() {
        super();
    }

    static getInstance(): ProjectState {
        this.instance ??= new ProjectState();
        return this.instance;
    }


    addProject(title: string, description: string, numberOfPeople: number): void {
        this.projects.push(new ProjectModel.Project(
            title,
            description,
            numberOfPeople,
            ProjectModel.ProjectStatus.Active
        ));

        this.updateListeners();
    }

    moveProject(projectId: string, newStatus: ProjectModel.ProjectStatus): void {
        const project = this.projects.find(project => projectId === project.id)
        if (project && project.status !== newStatus) {
            project.status = newStatus;
            this.updateListeners();
        }
    }

    private updateListeners(): void {
        for (const listnerFunction of this.listeners) {
            listnerFunction(this.projects.slice());
        }
    }
}

export const projectState = ProjectState.getInstance();
