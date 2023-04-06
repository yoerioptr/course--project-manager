var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import * as ProjectModel from "../model/project.js";
import { Component } from "./base.js";
import { autobind } from "../decorator/autobind.js";
import { projectState } from "../state/project.js";
import { ProjectItem } from "./project-item.js";
export class ProjectList extends Component {
    constructor(type) {
        super('project-list', 'app', `${type}-projects`, false);
        this.type = type;
        this.assignedProjects = [];
        this.configure();
        this.renderContent();
    }
    renderContent() {
        this.element.querySelector('ul').id = `${this.type}-project-list`;
        this.element.querySelector('h2').textContent = this.type.toUpperCase() + ' PROJECTS';
    }
    configure() {
        this.element.addEventListener('dragover', this.dragOverHandler);
        this.element.addEventListener('dragleave', this.dragLeaveHandler);
        this.element.addEventListener('drop', this.dropHandler);
        projectState.addListener((projects) => {
            this.assignedProjects = projects.filter(project => {
                return project.status === (this.type === 'active'
                    ? ProjectModel.ProjectStatus.Active
                    : ProjectModel.ProjectStatus.Finished);
            });
            this.renderProjects();
        });
    }
    dragOverHandler(event) {
        if (!event.dataTransfer || event.dataTransfer.types[0] !== 'text/plain') {
            return;
        }
        event.preventDefault();
        const listElement = this.element.querySelector('ul');
        listElement.classList.add('droppable');
    }
    dropHandler(event) {
        const projectId = event.dataTransfer.getData('text/plain');
        projectState.moveProject(projectId, this.type === 'active'
            ? ProjectModel.ProjectStatus.Active
            : ProjectModel.ProjectStatus.Finished);
    }
    dragLeaveHandler(_) {
        const listElement = this.element.querySelector('ul');
        listElement.classList.remove('droppable');
    }
    renderProjects() {
        const listElement = document.getElementById(`${this.type}-project-list`);
        listElement.innerHTML = '';
        for (const projectItem of this.assignedProjects) {
            new ProjectItem(this.element.querySelector('ul').id, projectItem);
        }
    }
}
__decorate([
    autobind
], ProjectList.prototype, "dragOverHandler", null);
__decorate([
    autobind
], ProjectList.prototype, "dropHandler", null);
__decorate([
    autobind
], ProjectList.prototype, "dragLeaveHandler", null);
//# sourceMappingURL=project-list.js.map