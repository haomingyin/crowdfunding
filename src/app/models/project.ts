import { Reward } from './reward';
import { Progress } from './progress';
import { Backer } from './backer';
import { User } from './user';

export interface ProjectBrief {
    id: number;
    title: string;
    subtitle: string;
    open: boolean;
    imageUri?: string;
}

export interface Project extends ProjectBrief {
    description: string;
    creationDate: number;
    target: number;
    creators: User[];
    rewards?: Reward[];
    progress: Progress;
    backers: Backer[];
}


