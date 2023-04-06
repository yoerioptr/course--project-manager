import { Project } from "../model/project.js";
import { Component } from "./base.js";
import { Draggable } from "../interface/drag-drop.js";
import { autobind } from "../decorator/autobind.js";

export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
    private project: Project;

    get persons(): string {
        return this.project.people === 1
            ? '1 Person'
            : `${this.project.people} Perons`;
    }

    constructor(hostId: string, project: Project) {
        super('single-project', hostId, project.id, false);
        this.project = project;

        this.configure();
        this.renderContent();
    }

    configure(): void {
        this.element.addEventListener('dragstart', this.dragStartHandler)
        this.element.addEventListener('dragend', this.dragEndHandler)
    }

    renderContent(): void {
        this.element.querySelector('h2')!.textContent = this.project.title;
        this.element.querySelector('h3')!.textContent = `${this.persons} assigned`;
        this.element.querySelector('p')!.textContent = this.project.description;
    }

    @autobind
    dragStartHandler(event: DragEvent): void {
        event.dataTransfer!.setData('text/plain', this.project.id);
        event.dataTransfer!.effectAllowed = 'move';
    }

    dragEndHandler(_: DragEvent): void {
    }
}
