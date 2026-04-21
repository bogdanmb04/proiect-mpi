import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ImageCarousel } from './image-carousel';

describe('ImageCarousel', () => {
  let component: ImageCarousel;
  let fixture: ComponentFixture<ImageCarousel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageCarousel],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageCarousel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter out empty or blank images', () => {
    fixture.componentRef.setInput('images', ['a', '', '   ', 'b']);
    fixture.detectChanges();

    expect(component.filteredImages()).toEqual(['a', 'b']);
  });

  it('should move to next image and wrap around', () => {
    fixture.componentRef.setInput('images', ['a', 'b', 'c']);
    fixture.detectChanges();

    component.currentIndex.set(2);
    component.next();

    expect(component.currentIndex()).toBe(0);
  });

  it('should move to previous image and wrap around', () => {
    fixture.componentRef.setInput('images', ['a', 'b', 'c']);
    fixture.detectChanges();

    component.currentIndex.set(0);
    component.prev();

    expect(component.currentIndex()).toBe(2);
  });

  it('should not change index on next/prev when there are no images', () => {
    fixture.componentRef.setInput('images', []);
    fixture.detectChanges();

    component.currentIndex.set(0);
    component.next();
    expect(component.currentIndex()).toBe(0);

    component.prev();
    expect(component.currentIndex()).toBe(0);
  });

  it('should goTo valid index and ignore invalid index', () => {
    fixture.componentRef.setInput('images', ['a', 'b']);
    fixture.detectChanges();

    component.goTo(1);
    expect(component.currentIndex()).toBe(1);

    component.goTo(-1);
    expect(component.currentIndex()).toBe(1);

    component.goTo(2);
    expect(component.currentIndex()).toBe(1);
  });

  it('should react to keyboard arrows', () => {
    fixture.componentRef.setInput('images', ['a', 'b', 'c']);
    fixture.detectChanges();

    component.currentIndex.set(1);
    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(component.currentIndex()).toBe(2);

    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(component.currentIndex()).toBe(1);
  });

  it('should react to touch swipe beyond threshold', () => {
    fixture.componentRef.setInput('images', ['a', 'b', 'c']);
    fixture.detectChanges();
    component.currentIndex.set(1);

    component.onTouchStart({
      changedTouches: [{ clientX: 100 }]
    } as unknown as TouchEvent);

    component.onTouchEnd({
      changedTouches: [{ clientX: 40 }]
    } as unknown as TouchEvent);
    expect(component.currentIndex()).toBe(2);

    component.onTouchStart({
      changedTouches: [{ clientX: 40 }]
    } as unknown as TouchEvent);

    component.onTouchEnd({
      changedTouches: [{ clientX: 90 }]
    } as unknown as TouchEvent);
    expect(component.currentIndex()).toBe(1);
  });

  it('should ignore touch swipe under threshold', () => {
    fixture.componentRef.setInput('images', ['a', 'b', 'c']);
    fixture.detectChanges();
    component.currentIndex.set(1);

    component.onTouchStart({
      changedTouches: [{ clientX: 100 }]
    } as unknown as TouchEvent);

    component.onTouchEnd({
      changedTouches: [{ clientX: 80 }]
    } as unknown as TouchEvent);

    expect(component.currentIndex()).toBe(1);
  });

  it('should return data url for base64 image', () => {
    expect(component.getImageDataUrl('abc123')).toBe('data:image/png;base64,abc123');
  });
});
