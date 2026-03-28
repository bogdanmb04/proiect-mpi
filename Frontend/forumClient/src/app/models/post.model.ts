export interface PostDTO {
  userId: number;
  userIcon: string;
  username: string;
  postId: number;
  title: string;
  date: string;
  body: string;
  categoryId: number;
  category: string;
  images: string[];
  likeNo: number;
  commentNo: number;
}
