export interface MakePostDTO {
    userId: number;
    categoryId: number;
    title: string;
    body: string;
    images?: string[];
}
