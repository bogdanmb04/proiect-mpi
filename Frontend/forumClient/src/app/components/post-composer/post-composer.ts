import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostsService } from '../../services/posts-service';
import { AuthenticationService } from '../../services/authentication-service';
import { Category } from '../../models/category.model';
import { Image } from '../../models/image.model';
import { MakePostDTO } from '../../models/make-post.model';

@Component({
  selector: 'app-post-composer',
  imports: [CommonModule, FormsModule],
  templateUrl: './post-composer.html',
  styleUrl: './post-composer.scss',
})
export class PostComposer implements OnInit {
  postsService = inject(PostsService);
  auth = inject(AuthenticationService);

  categories = signal<Category[]>([]);
  selectedCategoryId = signal<number | null>(null);
  title = signal('');
  body = signal('');
  images = signal<Image[]>([]);

  ngOnInit(): void {
    this.loadCategories();
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

  removeImage(index: number) {
    this.images.update(images => {
      const updated = [...images];
      updated.splice(index, 1);
      return updated;
    });
  }

  submitPost() {
    console.log('Submit post called');
    console.log('Auth user:', this.auth.user);
    console.log('All cookies:', document.cookie);

    if (!this.auth.user) {
      alert('You must be logged in to post.');
      return;
    }

    const titleTrimmed = this.title().trim();
    const bodyTrimmed = this.body().trim();

    // Validate required fields
    if (!titleTrimmed) {
      alert('Title is required.');
      return;
    }

    if (!bodyTrimmed) {
      alert('Body/content is required.');
      return;
    }

    const categoryId: number = this.selectedCategoryId() ? this.selectedCategoryId()! : -1;

    const dto: MakePostDTO = {
      userId: this.auth.user.id,
      categoryId: categoryId,
      title: titleTrimmed,
      body: bodyTrimmed,
      images: this.images().length > 0 ? this.images().map(i => i.base64) : undefined,
    };

    console.log('Submitting DTO:', dto);

    this.postsService.createPost(dto).subscribe({
      next: (response) => {
        this.title.set('');
        this.body.set('');
        this.selectedCategoryId.set(null);
        this.images.set([]);
      },
      error: (err) => {
        console.error('Failed to create post - Full error:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        console.error('Error body:', err.error);
        alert(`Failed to create post: ${err.status} - Check if you're logged in and the accessToken cookie exists. See console for details.`);
      }
    });
  }
}
