interface Draggable {
    dragStartHandler(event: DragEvent): void;

    dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
    dragOverHandler(event: DragEvent): void;

    dropHandler(event: DragEvent): void;

    dragLeaveHandler(event: DragEvent): void;
}

enum ProjectStatus {Active, Finished}

class Project {
    id: string = Math.random().toString();

    constructor(
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus
    ) {
    }
}

type Listener<T> = (items: T[]) => void;

class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(listenerFunction: Listener<T>) {
        this.listeners.push(listenerFunction);
    }
}

class ProjectState extends State<Project> {
    private projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {
        super();
    }

    static getInstance() {
        this.instance ??= new ProjectState();
        return this.instance;
    }


    addProject(title: string, description: string, numberOfPeople: number) {
        this.projects.push(new Project(
            title,
            description,
            numberOfPeople,
            ProjectStatus.Active
        ));

        this.updateListeners();
    }

    moveProject(projectId: string, newStatus: ProjectStatus) {
        const project = this.projects.find(project => projectId === project.id)
        if (project && project.status !== newStatus) {
            project.status = newStatus;
            this.updateListeners();
        }
    }

    private updateListeners() {
        for (const listnerFunction of this.listeners) {
            listnerFunction(this.projects.slice());
        }
    }
}

const projectState = ProjectState.getInstance();

interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(validatableInput: Validatable): boolean {
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
        validatableInput.value < validatableInput.min
    ) {
        return false;
    }

    if (validatableInput.max != null &&
        typeof validatableInput.value === 'number' &&
        validatableInput.value > validatableInput.max
    ) {
        return false;
    }

    return true;
}

function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjustedDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            return originalMethod.bind(this);
        }
    };

    return adjustedDescriptor;
}

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(templateId: string, hostElementId: string, newElementId?: string, insertAtStart: boolean = true) {
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElementId)! as T;


        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as U;

        if (newElementId) {
            this.element.id = newElementId;
        }

        this.attach(insertAtStart);
    }

    private attach(insertAtStart: boolean) {
        this.hostElement.insertAdjacentElement(insertAtStart ? 'afterbegin' : 'beforeend', this.element);
    }

    abstract configure(): void;

    abstract renderContent(): void;
}

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
    private project: Project;

    get persons() {
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

    configure() {
        this.element.addEventListener('dragstart', this.dragStartHandler)
        this.element.addEventListener('dragend', this.dragEndHandler)
    }

    renderContent() {
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

class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
    assignedProjects: Project[] = [];

    constructor(private type: 'active' | 'finished') {
        super('project-list', 'app', `${type}-projects`, false);
        this.configure();
        this.renderContent();
    }

    renderContent() {
        this.element.querySelector('ul')!.id = `${this.type}-project-list`;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
    }

    configure() {
        this.element.addEventListener('dragover', this.dragOverHandler);
        this.element.addEventListener('dragleave', this.dragLeaveHandler);
        this.element.addEventListener('drop', this.dropHandler);

        projectState.addListener((projects: Project[]) => {
            this.assignedProjects = projects.filter(project => {
                return project.status === (this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);
            });
            this.renderProjects();
        });
    }

    @autobind
    dragOverHandler(event: DragEvent) {
        if (!event.dataTransfer || event.dataTransfer.types[0] !== 'text/plain') {
            return;
        }
        event.preventDefault();
        const listElement = this.element.querySelector('ul')!;
        listElement.classList.add('droppable');
    }

    @autobind
    dropHandler(event: DragEvent) {
        const projectId = event.dataTransfer!.getData('text/plain');
        projectState.moveProject(projectId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);
    }

    @autobind
    dragLeaveHandler(_: DragEvent) {
        const listElement = this.element.querySelector('ul')!;
        listElement.classList.remove('droppable');
    }

    private renderProjects() {
        const listElement = document.getElementById(`${this.type}-project-list`)! as HTMLUListElement;
        listElement.innerHTML = '';
        for (const projectItem of this.assignedProjects) {
            new ProjectItem(this.element.querySelector('ul')!.id, projectItem);
        }
    }
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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

    configure() {
        this.element.addEventListener('submit', this.submitHandler)
    }

    renderContent() {
    }

    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const titleValidatable: Validatable = {
            value: enteredTitle,
            required: true
        };

        const enteredDescription = this.descriptionInputElement.value;
        const descriptionValidatable: Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        };

        const enteredPeople = this.peopleInputElement.value;
        const peopleValidatable: Validatable = {
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

    private clearInputs() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }

    @autobind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            projectState.addProject(title, description, people);
            this.clearInputs();
        }
    }
}

new ProjectInput();
new ProjectList('active');
new ProjectList('finished');