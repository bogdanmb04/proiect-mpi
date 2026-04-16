import { Component, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-carousel',
  imports: [CommonModule],
  templateUrl: './image-carousel.html',
  styleUrl: './image-carousel.scss',
})
export class ImageCarousel {
  images = input<string[]>();
  filteredImages = computed(() => (this.images() ?? []).filter(img => !!img && img.trim() !== ''));
  currentIndex = signal(0);

  next() {
    const imgs = this.filteredImages() ?? [];
    if (!imgs.length) return;
    this.currentIndex.set((this.currentIndex() + 1) % imgs.length);
  }

  prev() {
    const imgs = this.filteredImages() ?? [];
    if (!imgs.length) return;
    this.currentIndex.set((this.currentIndex() - 1 + imgs.length) % imgs.length);
  }

  goTo(index: number) {
    const imgs = this.filteredImages() ?? [];
    if (index < 0 || index >= imgs.length) return;
    this.currentIndex.set(index);
  }

  onKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowRight') { this.next(); }
    if (e.key === 'ArrowLeft') { this.prev(); }
  }

  private touchStartX = 0;
  onTouchStart(e: TouchEvent) {
    this.touchStartX = e.changedTouches[0].clientX;
  }
  onTouchEnd(e: TouchEvent) {
    const dx = e.changedTouches[0].clientX - this.touchStartX;
    if (Math.abs(dx) > 30) {
      dx < 0 ? this.next() : this.prev();
    }
  }

  getImageDataUrl(base64: string): string {
    return `data:image/png;base64,${base64}`;
  }
}
