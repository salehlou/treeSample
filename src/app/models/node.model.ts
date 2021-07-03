export interface NodeModel {
   id: number;
   name: string;
   checked: boolean;
   nodeIcon: string;
   status: boolean;
   children?: NodeModel[];
}
