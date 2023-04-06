import * as ProjectModel from "../model/project";
import { Component } from "./base";
import { DragTarget } from "../interface/drag-drop";
import { autobind } from "../decorator/autobind";
import { projectState } from "../state/project";
import { ProjectItem } from "./project-item";

export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
    assignedProjects: ProjectModel.Project[] = [];

    constructor(private type: 'active' | 'finished') {
        super('project-list', 'app', `${type}-projects`, false);
        this.configure();
        this.renderContent();
    }

    renderContent(): void {
        this.element.querySelector('ul')!.id = `${this.type}-project-list`;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
    }

    configure(): void {
        this.element.addEventListener('dragover', this.dragOverHandler);
        this.element.addEventListener('dragleave', this.dragLeaveHandler);
        this.element.addEventListener('drop', this.dropHandler);

        projectState.addListener((projects: ProjectModel.Project[]) => {
            this.assignedProjects = projects.filter(project => {
                return project.status === (
                    this.type === 'active'
                        ? ProjectModel.ProjectStatus.Active
                        : ProjectModel.ProjectStatus.Finished
                );
            });
            this.renderProjects();
        });
    }

    @autobind
    dragOverHandler(event: DragEvent): void {
        if (!event.dataTransfer || event.dataTransfer.types[0] !== 'text/plain') {
            return;
        }

        event.preventDefault();
        const listElement = this.element.querySelector('ul')!;
        listElement.classList.add('droppable');
    }

    @autobind
    dropHandler(event: DragEvent): void {
        const projectId = event.dataTransfer!.getData('text/plain');
        projectState.moveProject(projectId, this.type === 'active'
            ? ProjectModel.ProjectStatus.Active
            : ProjectModel.ProjectStatus.Finished
        );
    }

    @autobind
    dragLeaveHandler(_: DragEvent): void {
        const listElement = this.element.querySelector('ul')!;
        listElement.classList.remove('droppable');
    }

    private renderProjects(): void {
        const listElement = document.getElementById(`${this.type}-project-list`)! as HTMLUListElement;
        listElement.innerHTML = '';
        for (const projectItem of this.assignedProjects) {
            new ProjectItem(this.element.querySelector('ul')!.id, projectItem);
        }
    }
}
