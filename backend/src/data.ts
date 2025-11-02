export type Role = 'student' | 'department_head' | 'lecturer';

export interface Question {
  id: string;
  topic: string;
  marks: number;
  blooms: 'Recall' | 'Comprehension' | 'Application' | 'Analysis' | 'Evaluation' | 'Creation';
  knowledge: { core: boolean; methods: boolean; problemSolving: boolean };
}

export interface Test {
  id: string;
  title: string;
  nqfLevel?: number;
  moduleId: string;
  questions: Question[];
}

export interface Module {
  id: string;
  code: string;
  title: string;
  nqfLevel: number;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: Role;
}

export const users: User[] = [
  { id: 'u1', username: 'depthead', password: 'password', role: 'department_head' },
  { id: 'u2', username: 'lecturer', password: 'password', role: 'lecturer' },
  { id: 'u3', username: 'student', password: 'password', role: 'student' }
];

export const modules: Module[] = [
  { id: 'm1', code: 'CS101', title: 'Intro to Computing', nqfLevel: 5 },
  { id: 'm2', code: 'CS201', title: 'Data Structures', nqfLevel: 6 }
];

export const tests: Test[] = [
  {
    id: 't1',
    title: 'Midterm 1',
    moduleId: 'm1',
    questions: [
      { id: 'q1', topic: 'Variables', marks: 5, blooms: 'Recall', knowledge: { core: true, methods: false, problemSolving: false } },
      { id: 'q2', topic: 'Loops', marks: 10, blooms: 'Application', knowledge: { core: false, methods: true, problemSolving: true } }
    ]
  },
  {
    id: 't2',
    title: 'Final Exam',
    moduleId: 'm1',
    questions: [
      { id: 'q3', topic: 'Functions', marks: 15, blooms: 'Analysis', knowledge: { core: true, methods: true, problemSolving: true } }
    ]
  }
];
