"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
    ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
})(ProjectStatus || (ProjectStatus = {}));
class Project {
    constructor(title, description, people, status) {
        this.title = title;
        this.description = description;
        this.people = people;
        this.status = status;
        this.id = Math.random().toString();
    }
}
class State {
    constructor() {
        this.listeners = [];
    }
    addListener(listenerFunction) {
        this.listeners.push(listenerFunction);
    }
}
class ProjectState extends State {
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
        this.projects.push(new Project(title, description, numberOfPeople, ProjectStatus.Active));
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
const projectState = ProjectState.getInstance();
function validate(validatableInput) {
    if (validatableInput.required && validatableInput.value.toString().trim().length === 0) {
        return false;
    }
    if (validatableInput.minLength != null &&
        typeof validatableInput.value === 'string' &&
        validatableInput.value.length < validatableInput.minLength) {
        return false;
    }
    if (validatableInput.maxLength != null &&
        typeof validatableInput.value === 'string' &&
        validatableInput.value.length > validatableInput.maxLength) {
        return false;
    }
    if (validatableInput.min != null &&
        typeof validatableInput.value === 'number' &&
        validatableInput.value < validatableInput.min) {
        return false;
    }
    if (validatableInput.max != null &&
        typeof validatableInput.value === 'number' &&
        validatableInput.value > validatableInput.max) {
        return false;
    }
    return true;
}
function autobind(_, _2, descriptor) {
    const originalMethod = descriptor.value;
    const adjustedDescriptor = {
        configurable: true,
        get() {
            return originalMethod.bind(this);
        }
    };
    return adjustedDescriptor;
}
class Component {
    constructor(templateId, hostElementId, newElementId, insertAtStart = true) {
        this.templateElement = document.getElementById(templateId);
        this.hostElement = document.getElementById(hostElementId);
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        if (newElementId) {
            this.element.id = newElementId;
        }
        this.attach(insertAtStart);
    }
    attach(insertAtStart) {
        this.hostElement.insertAdjacentElement(insertAtStart ? 'afterbegin' : 'beforeend', this.element);
    }
}
class ProjectItem extends Component {
    get persons() {
        return this.project.people === 1
            ? '1 Person'
            : `${this.project.people} Perons`;
    }
    constructor(hostId, project) {
        super('single-project', hostId, project.id, false);
        this.project = project;
        this.configure();
        this.renderContent();
    }
    configure() {
        this.element.addEventListener('dragstart', this.dragStartHandler);
        this.element.addEventListener('dragend', this.dragEndHandler);
    }
    renderContent() {
        this.element.querySelector('h2').textContent = this.project.title;
        this.element.querySelector('h3').textContent = `${this.persons} assigned`;
        this.element.querySelector('p').textContent = this.project.description;
    }
    dragStartHandler(event) {
        event.dataTransfer.setData('text/plain', this.project.id);
        event.dataTransfer.effectAllowed = 'move';
    }
    dragEndHandler(_) {
    }
}
__decorate([
    autobind
], ProjectItem.prototype, "dragStartHandler", null);
class ProjectList extends Component {
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
                return project.status === (this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);
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
        projectState.moveProject(projectId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);
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
class ProjectInput extends Component {
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
        if (validate(titleValidatable) && validate(descriptionValidatable) && validate(peopleValidatable)) {
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
        alert('Invalid input, please try again!');
        return;
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
new ProjectInput();
new ProjectList('active');
new ProjectList('finished');
//# sourceMappingURL=app.js.map