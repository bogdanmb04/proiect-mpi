import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostStream } from './post-stream';

describe('PostStream', () => {
  let component: PostStream;
  let fixture: ComponentFixture<PostStream>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostStream]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostStream);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
