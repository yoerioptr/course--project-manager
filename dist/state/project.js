import * as ProjectModel from "../model/project.js";
class State {
    constructor() {
        this.listeners = [];
    }
    addListener(listenerFunction) {
        this.listeners.push(listenerFunction);
    }
}
export class ProjectState extends State {
    constructor() {
        super();
        this.projects = [];
    }
    static getInstance() {
        var _a;
        (_a = this.instance) !== null && _a !== void 0 ? _a : (this.instance = new ProjectState());
        return this.instance;
    }
    addProject(title, description, numberOfPeople) {
        this.projects.push(new ProjectModel.Project(title, description, numberOfPeople, ProjectModel.ProjectStatus.Active));
        this.updateListeners();
    }
    moveProject(projectId, newStatus) {
        const project = this.projects.find(project => projectId === project.id);
        if (project && project.status !== newStatus) {
            project.status = newStatus;
            this.updateListeners();
        }
    }
    updateListeners() {
        for (const listnerFunction of this.listeners) {
            listnerFunction(this.projects.slice());
        }
    }
}
export const projectState = ProjectState.getInstance();
//# sourceMappingURL=project.js.map