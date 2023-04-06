export enum ProjectStatus {Active, Finished}

export class Project {
    id: string = Math.random().toString();

    constructor(
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus
    ) {
    }
}
