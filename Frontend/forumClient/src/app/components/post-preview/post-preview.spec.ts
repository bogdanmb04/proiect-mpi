import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostPreview } from './post-preview';

describe('PostPreview', () => {
  let component: PostPreview;
  let fixture: ComponentFixture<PostPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostPreview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostPreview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
