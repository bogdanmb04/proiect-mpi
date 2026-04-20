import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { EditPost } from './edit-post';
import { PostsService } from '../../services/posts-service';
import { AuthenticationService } from '../../services/authentication-service';
import { PostDTO } from '../../models/post.model';
import { Category } from '../../models/category.model';

describe('EditPost', () => {
  let component: EditPost;
  let fixture: ComponentFixture<EditPost>;

  let postsServiceSpy: jasmine.SpyObj<PostsService>;
  let authServiceStub: { user: { id: number; role: string } | null };
  let routerSpy: jasmine.SpyObj<Router>;

  const mockPost: PostDTO = {
    userId: 1,
    userIcon: 'icon',
    username: 'user',
    postId: 15,
    title: 'Initial title',
    date: '2026-04-16',
    body: 'Initial body',
    categoryId: 2,
    category: 'General',
    images: ['base64-1'],
    likeNo: 0,
    commentNo: 0
  };

  const unsortedCategories: Category[] = [
    { categoryId: 3, name: 'Tech' },
    { categoryId: 1, name: 'Art' },
    { categoryId: 2, name: 'General' }
  ];

  beforeEach(async () => {
    postsServiceSpy = jasmine.createSpyObj<PostsService>('PostsService', [
      'getPost',
      'getCategoriesFull',
      'updatePost'
    ]);
    postsServiceSpy.getPost.and.returnValue(of(mockPost));
    postsServiceSpy.getCategoriesFull.and.returnValue(of([...unsortedCategories]));
    postsServiceSpy.updatePost.and.returnValue(of(new HttpResponse<object>({ status: 200 })));

    authServiceStub = {
      user: { id: 1, role: 'USER' }
    };
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [EditPost],
      providers: [
        provideZonelessChangeDetection(),
        { provide: PostsService, useValue: postsServiceSpy },
        { provide: AuthenticationService, useValue: authServiceStub },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '15' }))
          }
        },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditPost);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load post/categories on init', () => {
    expect(component).toBeTruthy();
    expect(postsServiceSpy.getPost).toHaveBeenCalledWith(15);
    expect(postsServiceSpy.getCategoriesFull).toHaveBeenCalled();
    expect(component.postId()).toBe(15);
    expect(component.isLoading()).toBeFalse();
  });

  it('should set post fields when loadPost succeeds', () => {
    expect(component.title()).toBe(mockPost.title);
    expect(component.body()).toBe(mockPost.body);
    expect(component.selectedCategoryId()).toBe(mockPost.categoryId);
    expect(component.existingImages()).toEqual(mockPost.images);
  });

  it('should reject editing when user lacks permission', () => {
    const otherUserPost: PostDTO = { ...mockPost, userId: 999 };
    postsServiceSpy.getPost.and.returnValue(of(otherUserPost));

    component.loadPost(15);

    expect(component.error()).toBe('You do not have permission to edit this post.');
    expect(component.isLoading()).toBeFalse();
  });

  it('should sort categories alphabetically', () => {
    expect(component.categories().map(c => c.name)).toEqual(['Art', 'General', 'Tech']);
  });

  it('should remove selected images', () => {
    const firstFile = {} as File;
    const secondFile = {} as File;
    component.images.set([
      { image: firstFile, base64: 'first' },
      { image: secondFile, base64: 'second' }
    ]);
    component.existingImages.set(['one', 'two']);

    component.removeNewImage(0);
    component.removeExistingImage(1);

    expect(component.images()).toEqual([{ image: secondFile, base64: 'second' }]);
    expect(component.existingImages()).toEqual(['one']);
  });

  it('should return png data url from base64', () => {
    expect(component.getImageDataUrl('abc123')).toBe('data:image/png;base64,abc123');
  });

  it('should not submit when user is not logged in', () => {
    spyOn(window, 'alert');
    authServiceStub.user = null;

    component.submitUpdate();

    expect(window.alert).toHaveBeenCalledWith('You must be logged in to edit posts.');
    expect(postsServiceSpy.updatePost).not.toHaveBeenCalled();
  });

  it('should submit update with merged images and navigate', () => {
    component.postId.set(15);
    component.title.set('  Updated title  ');
    component.body.set('  Updated body  ');
    component.selectedCategoryId.set(2);
    component.existingImages.set(['persisted-image']);
    component.images.set([{ image: {} as File, base64: 'new-image' }]);

    component.submitUpdate();

    expect(postsServiceSpy.updatePost).toHaveBeenCalledWith(15, {
      userId: 1,
      categoryId: 2,
      title: 'Updated title',
      body: 'Updated body',
      images: ['persisted-image', 'new-image']
    });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/post', 15]);
  });

  it('should validate required title/body before submit', () => {
    spyOn(window, 'alert');
    component.postId.set(15);
    component.selectedCategoryId.set(1);
    component.title.set('   ');
    component.body.set('body');

    component.submitUpdate();
    expect(window.alert).toHaveBeenCalledWith('Title is required.');

    component.title.set('title');
    component.body.set('   ');
    component.submitUpdate();
    expect(window.alert).toHaveBeenCalledWith('Body/content is required.');
    expect(postsServiceSpy.updatePost).not.toHaveBeenCalled();
  });

  it('should show error when loadPost fails', () => {
    postsServiceSpy.getPost.and.returnValue(throwError(() => new Error('boom')));

    component.loadPost(15);

    expect(component.error()).toBe('Failed to load post.');
    expect(component.isLoading()).toBeFalse();
  });

  it('should read selected image files and ignore non-images', () => {
    const readAsDataURL = jasmine.createSpy('readAsDataURL').and.callFake(function (this: FileReader) {
      Object.defineProperty(this, 'result', {
        configurable: true,
        get: () => 'data:image/png;base64,mocked-base64'
      });
      if (this.onload) {
        this.onload(new ProgressEvent('load') as ProgressEvent<FileReader>);
      }
    });

    class MockFileReader {
      onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null;
      result: string | ArrayBuffer | null = null;
      readAsDataURL = readAsDataURL;
    }

    const originalFileReader = window.FileReader;
    (window as unknown as { FileReader: typeof FileReader }).FileReader = MockFileReader as unknown as typeof FileReader;

    const imageFile = new File(['img'], 'photo.png', { type: 'image/png' });
    const textFile = new File(['txt'], 'note.txt', { type: 'text/plain' });
    const fakeInput = {
      files: [imageFile, textFile],
      value: 'something'
    } as unknown as HTMLInputElement;

    component.onFileSelected({ target: fakeInput } as unknown as Event);

    expect(readAsDataURL).toHaveBeenCalledTimes(1);
    expect(component.images().length).toBe(1);
    expect(component.images()[0].base64).toBe('mocked-base64');
    expect(fakeInput.value).toBe('');

    (window as unknown as { FileReader: typeof FileReader }).FileReader = originalFileReader;
  });

  it('should navigate based on post id when cancel is called', () => {
    component.postId.set(22);
    component.cancel();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/post', 22]);

    routerSpy.navigate.calls.reset();
    component.postId.set(null);
    component.cancel();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });
});
