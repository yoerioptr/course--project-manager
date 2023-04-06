var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { autobind } from "../decorator/autobind.js";
import { Component } from "./base.js";
import { projectState } from "../state/project.js";
import * as Validation from "../util/validation.js";
export class ProjectInput extends Component {
    constructor() {
        super('project-input', 'app', 'user-input');
        this.titleInputElement = this.element.querySelector('#title');
        this.descriptionInputElement = this.element.querySelector('#description');
        this.peopleInputElement = this.element.querySelector('#people');
        this.configure();
    }
    configure() {
        this.element.addEventListener('submit', this.submitHandler);
    }
    renderContent() {
    }
    gatherUserInput() {
        const enteredTitle = this.titleInputElement.value;
        const titleValidatable = {
            value: enteredTitle,
            required: true
        };
        const enteredDescription = this.descriptionInputElement.value;
        const descriptionValidatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        };
        const enteredPeople = this.peopleInputElement.value;
        const peopleValidatable = {
            value: enteredPeople,
            required: true,
            min: 1,
            max: 5
        };
        if (Validation.validate(titleValidatable) &&
            Validation.validate(descriptionValidatable) &&
            Validation.validate(peopleValidatable)) {
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
        alert('Invalid input, please try again!');
    }
    clearInputs() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }
    submitHandler(event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            projectState.addProject(title, description, people);
            this.clearInputs();
        }
    }
}
__decorate([
    autobind
], ProjectInput.prototype, "submitHandler", null);
//# sourceMappingURL=project-input.js.map