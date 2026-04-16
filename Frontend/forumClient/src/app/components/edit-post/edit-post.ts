import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PostsService } from '../../services/posts-service';
import { AuthenticationService } from '../../services/authentication-service';
import { Category } from '../../models/category.model';
import { Image } from '../../models/image.model';
import { MakePostDTO } from '../../models/make-post.model';
import { PostDTO } from '../../models/post.model';

@Component({
  selector: 'app-edit-post',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-post.html',
  styleUrl: './edit-post.scss',
})
export class EditPost implements OnInit {
  postsService = inject(PostsService);
  auth = inject(AuthenticationService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  postId = signal<number | null>(null);
  categories = signal<Category[]>([]);
  selectedCategoryId = signal<number | null>(null);
  title = signal('');
  body = signal('');
  images = signal<Image[]>([]);
  existingImages = signal<string[]>([]);
  isLoading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.postId.set(Number(id));
        this.loadPost(Number(id));
      }
    });
    this.loadCategories();
  }

  loadPost(id: number) {
    this.postsService.getPost(id).subscribe({
      next: (post: PostDTO) => {
        // Check if user can edit
        if (!this.canEdit(post)) {
          this.error.set('You do not have permission to edit this post.');
          this.isLoading.set(false);
          return;
        }

        this.title.set(post.title);
        this.body.set(post.body);
        this.selectedCategoryId.set(post.categoryId);
        this.existingImages.set(post.images || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load post:', err);
        this.error.set('Failed to load post.');
        this.isLoading.set(false);
      }
    });
  }

  canEdit(post: PostDTO): boolean {
    const user = this.auth.user;
    if (!user) return false;
    return post.userId === user.id || user.role === 'ADMIN';
  }

  loadCategories() {
    this.postsService.getCategoriesFull().subscribe(list => {
      list.sort((a, b) => a.name.localeCompare(b.name));
      this.categories.set(list);
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const files = Array.from(input.files);

    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        this.images.update(images => [...images, { image: file, base64 }]);
      };
      reader.readAsDataURL(file);
    }

    input.value = '';
  }

  removeNewImage(index: number) {
    this.images.update(images => {
      const updated = [...images];
      updated.splice(index, 1);
      return updated;
    });
  }

  removeExistingImage(index: number) {
    this.existingImages.update(images => {
      const updated = [...images];
      updated.splice(index, 1);
      return updated;
    });
  }

  getImageDataUrl(base64: string): string {
    return `data:image/png;base64,${base64}`;
  }

  submitUpdate() {
    if (!this.auth.user) {
      alert('You must be logged in to edit posts.');
      return;
    }

    const titleTrimmed = this.title().trim();
    const bodyTrimmed = this.body().trim();

    if (!titleTrimmed) {
      alert('Title is required.');
      return;
    }

    if (!bodyTrimmed) {
      alert('Body/content is required.');
      return;
    }

    const categoryId: number = this.selectedCategoryId() ? this.selectedCategoryId()! : -1;

    // Combine existing and new images
    const allImages = [
      ...this.existingImages(),
      ...this.images().map(i => i.base64)
    ];

    const dto: MakePostDTO = {
      userId: this.auth.user.id,
      categoryId: categoryId,
      title: titleTrimmed,
      body: bodyTrimmed,
      images: allImages.length > 0 ? allImages : undefined,
    };

    const id = this.postId();
    if (!id) return;

    this.postsService.updatePost(id, dto).subscribe({
      next: () => {
        // Navigate back to the post
        this.router.navigate(['/post', id]);
      },
      error: (err) => {
        console.error('Failed to update post:', err);
        alert(`Failed to update post: ${err.status} - ${err.message}`);
      }
    });
  }

  cancel() {
    const id = this.postId();
    if (id) {
      this.router.navigate(['/post', id]);
    } else {
      this.router.navigate(['/']);
    }
  }
}
