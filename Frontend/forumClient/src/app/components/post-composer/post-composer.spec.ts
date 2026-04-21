import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { PostComposer } from './post-composer';
import { PostsService } from '../../services/posts-service';
import { AuthenticationService } from '../../services/authentication-service';
import { Category } from '../../models/category.model';

describe('PostComposer', () => {
  let component: PostComposer;
  let fixture: ComponentFixture<PostComposer>;
  let postsServiceSpy: jasmine.SpyObj<PostsService>;
  let authServiceStub: { user: { id: number; role: string } | null };

  const unsortedCategories: Category[] = [
    { categoryId: 3, name: 'Tech' },
    { categoryId: 1, name: 'Art' },
    { categoryId: 2, name: 'General' }
  ];

  beforeEach(async () => {
    postsServiceSpy = jasmine.createSpyObj<PostsService>('PostsService', [
      'getCategoriesFull',
      'createPost'
    ]);
    postsServiceSpy.getCategoriesFull.and.returnValue(of([...unsortedCategories]));
    postsServiceSpy.createPost.and.returnValue(of(new HttpResponse<string>({ status: 201, body: 'created' })));

    authServiceStub = {
      user: { id: 1, role: 'USER' }
    };

    await TestBed.configureTestingModule({
      imports: [PostComposer],
      providers: [
        provideZonelessChangeDetection(),
        { provide: PostsService, useValue: postsServiceSpy },
        { provide: AuthenticationService, useValue: authServiceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PostComposer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load and sort categories on init', () => {
    expect(postsServiceSpy.getCategoriesFull).toHaveBeenCalled();
    expect(component.categories().map(c => c.name)).toEqual(['Art', 'General', 'Tech']);
  });

  it('should remove image by index', () => {
    const fileA = {} as File;
    const fileB = {} as File;
    component.images.set([
      { image: fileA, base64: 'a' },
      { image: fileB, base64: 'b' }
    ]);

    component.removeImage(0);

    expect(component.images()).toEqual([{ image: fileB, base64: 'b' }]);
  });

  it('should not submit when user is not logged in', () => {
    spyOn(window, 'alert');
    authServiceStub.user = null;

    component.submitPost();

    expect(window.alert).toHaveBeenCalledWith('You must be logged in to post.');
    expect(postsServiceSpy.createPost).not.toHaveBeenCalled();
  });

  it('should validate required title and body before submit', () => {
    spyOn(window, 'alert');
    component.selectedCategoryId.set(2);
    component.title.set('   ');
    component.body.set('body');

    component.submitPost();
    expect(window.alert).toHaveBeenCalledWith('Title is required.');

    component.title.set('title');
    component.body.set('   ');
    component.submitPost();
    expect(window.alert).toHaveBeenCalledWith('Body/content is required.');
    expect(postsServiceSpy.createPost).not.toHaveBeenCalled();
  });

  it('should submit post with trimmed fields and mapped images', () => {
    component.selectedCategoryId.set(2);
    component.title.set('  New title  ');
    component.body.set('  New body  ');
    component.images.set([{ image: {} as File, base64: 'img-base64' }]);

    component.submitPost();

    expect(postsServiceSpy.createPost).toHaveBeenCalledWith({
      userId: 1,
      categoryId: 2,
      title: 'New title',
      body: 'New body',
      images: ['img-base64']
    });
  });

  it('should use -1 category when no category selected', () => {
    component.selectedCategoryId.set(null);
    component.title.set('Title');
    component.body.set('Body');

    component.submitPost();

    expect(postsServiceSpy.createPost).toHaveBeenCalledWith({
      userId: 1,
      categoryId: -1,
      title: 'Title',
      body: 'Body',
      images: undefined
    });
  });

  it('should reset form fields after successful submit', () => {
    component.selectedCategoryId.set(2);
    component.title.set('Title');
    component.body.set('Body');
    component.images.set([{ image: {} as File, base64: 'img-base64' }]);

    component.submitPost();

    expect(component.title()).toBe('');
    expect(component.body()).toBe('');
    expect(component.selectedCategoryId()).toBeNull();
    expect(component.images()).toEqual([]);
  });

  it('should show alert on submit failure', () => {
    spyOn(window, 'alert');
    postsServiceSpy.createPost.and.returnValue(
      throwError(() => ({ status: 401, message: 'Unauthorized', error: { detail: 'No token' } }))
    );
    component.selectedCategoryId.set(2);
    component.title.set('Title');
    component.body.set('Body');

    component.submitPost();

    expect(window.alert).toHaveBeenCalledWith(
      'Failed to create post: 401 - Check if you\'re logged in and the accessToken cookie exists. See console for details.'
    );
  });

  it('should read selected image files and ignore non-images', () => {
    const readAsDataURL = jasmine.createSpy('readAsDataURL').and.callFake(function (this: FileReader) {
      Object.defineProperty(this, 'result', {
        configurable: true,
        get: () => 'data:image/png;base64,mocked'
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
    expect(component.images()[0].base64).toBe('mocked');
    expect(fakeInput.value).toBe('');

    (window as unknown as { FileReader: typeof FileReader }).FileReader = originalFileReader;
  });
});
