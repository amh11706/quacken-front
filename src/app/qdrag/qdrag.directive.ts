import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[qDrag]',
  exportAs: 'qDrag',
})
export class QdragDirective implements OnInit, OnDestroy {
  @Input() qDrag?: HTMLElement;
  @Input() bindToWindow?: boolean;
  @Input() offsetX = 0;
  @Input() offsetY = 0;
  @Input() transform = '';
  @Input() scale = 1;

  private rightGap?: number;
  private startX = 0;
  private startY = 0;

  constructor(private el: ElementRef) { }

  ngOnInit(): void {
    this.offsetX = +this.offsetX;
    this.offsetY = +this.offsetY;
    this.updateTransform();

    if (!this.qDrag) this.qDrag = this.el.nativeElement;
    if (!this.qDrag) return;
    this.qDrag.addEventListener('dblclick', () => {
      this.offsetX = 0;
      this.offsetY = 0;
      this.updateTransform();
    });
    this.qDrag.addEventListener('mousedown', this.onDown);
    this.qDrag.addEventListener('touchstart', this.touchStart);
    if (this.bindToWindow !== undefined) window.addEventListener('resize', this.offsetToRightGap);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.offsetToRightGap);
  }

  private updateTransform() {
    this.el.nativeElement.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) ${this.transform}`;
  }

  private offsetToRightGap = () => {
    if (!this.qDrag) return;
    if (this.rightGap !== undefined) {
      const box = this.qDrag.getBoundingClientRect();
      this.offsetX += window.innerWidth - box.right - this.rightGap;
      this.bindWindow(true);
    } else this.bindWindow();
  };

  private bindWindow(skipRight = false) {
    if (!this.qDrag) return;
    const box = this.qDrag.getBoundingClientRect();
    if (box.right < 30) {
      this.offsetX += 30 - box.right;
    } else if (!skipRight && box.left > window.innerWidth - 30) {
      this.offsetX += window.innerWidth - 30 - box.left;
    }
    if (box.bottom < 45) {
      this.offsetY += 45 - box.bottom;
    } else if (box.top > window.innerHeight - 30) {
      this.offsetY += window.innerHeight - 30 - box.top;
    }

    if (!skipRight) {
      if (box.right < window.innerWidth / 2) delete this.rightGap;
      else this.rightGap = window.innerWidth - box.right;
    }
    this.updateTransform();
  }

  private onDown = (event: MouseEvent) => {
    if (event.ctrlKey) return;

    this.startX = event.clientX;
    this.startY = event.clientY;
    document.addEventListener('mousemove', this.onMove);
    document.addEventListener('mouseup', this.onUp);
    event.preventDefault();
    const active = document.activeElement;
    if (active instanceof HTMLElement && active.id !== 'textinput') active.blur();
  };

  private touchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    document.addEventListener('touchmove', this.touchMove);
    document.addEventListener('touchcancel', this.touchEnd);
    document.addEventListener('touchend', this.touchEnd);
  };

  private onMove = (event: MouseEvent) => {
    this.offsetX += (event.clientX - this.startX) / this.scale;
    this.offsetY += (event.clientY - this.startY) / this.scale;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.updateTransform();
  };

  private touchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    this.offsetX += (touch.clientX - this.startX) / this.scale;
    this.offsetY += (touch.clientY - this.startY) / this.scale;
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.updateTransform();
  };

  private onUp = () => {
    document.removeEventListener('mousemove', this.onMove);
    document.removeEventListener('mouseup', this.onUp);
    if (this.bindToWindow !== undefined) this.bindWindow();
  };

  private touchEnd = () => {
    document.removeEventListener('touchmove', this.touchMove);
    document.removeEventListener('touchcancel', this.touchEnd);
    document.removeEventListener('touchend', this.touchEnd);
    if (this.bindToWindow !== undefined) this.bindWindow();
  };
}
