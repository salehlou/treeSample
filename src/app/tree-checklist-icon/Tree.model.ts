export interface TreeModel {
   id: number;
   name: string;
   checked: boolean;
   nodeIcon: string;
   children?: TreeModel[];
}
