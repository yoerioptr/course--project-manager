import { autobind } from "../decorator/autobind.js";
import { Component } from "./base.js";
import { projectState } from "../state/project.js";
import * as Validation from "../util/validation.js";

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        super('project-input', 'app', 'user-input');

        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

        this.configure();
    }

    configure(): void {
        this.element.addEventListener('submit', this.submitHandler)
    }

    renderContent(): void {
    }

    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const titleValidatable: Validation.Validatable = {
            value: enteredTitle,
            required: true
        };

        const enteredDescription = this.descriptionInputElement.value;
        const descriptionValidatable: Validation.Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        };

        const enteredPeople = this.peopleInputElement.value;
        const peopleValidatable: Validation.Validatable = {
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

    private clearInputs(): void {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }

    @autobind
    private submitHandler(event: Event): void {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            projectState.addProject(title, description, people);
            this.clearInputs();
        }
    }
}
