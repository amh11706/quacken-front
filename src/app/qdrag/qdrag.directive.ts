import { Directive, ElementRef, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';

@Directive({
    selector: '[qDrag]',
    exportAs: 'qDrag',
    standalone: false
})
export class QdragDirective implements OnInit, OnDestroy {
  @Input() qDrag?: HTMLElement;
  @Input() bindToWindow?: boolean;
  @Input() transform = '';
  @Input() scale = 1;
  private _offset = { x: 0, y: 0 };
  get offset() { return this._offset; }
  @Input() set offset(value: { x: number, y: number }) {
    this._offset = typeof value === 'object' ? value || this._offset : this._offset;
    this.updateTransform(false);
    setTimeout(() => this.bindToWindow && this.bindWindow(false, false), 0);
  }

  @Output() offsetChange = new EventEmitter<{ x: number, y: number }>();

  private rightGap?: number;
  private startX = 0;
  private startY = 0;

  constructor(private el: ElementRef) { }

  ngOnInit(): void {
    this._offset.x = +this._offset.x;
    this._offset.y = +this._offset.y;
    this.updateTransform(false);

    if (!this.qDrag) this.qDrag = this.el.nativeElement;
    if (!this.qDrag) return;
    this.qDrag.addEventListener('dblclick', e => {
      if (e.button !== 0) return;
      this._offset.x = 0;
      this._offset.y = 0;
      this.updateTransform();
    });
    this.qDrag.addEventListener('mousedown', this.onDown);
    this.qDrag.addEventListener('touchstart', this.touchStart);
    if (this.bindToWindow !== undefined) window.addEventListener('resize', this.offsetToRightGap);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.offsetToRightGap);
  }

  private updateTransform(emit = true) {
    this.el.nativeElement.style.transform = `translate(${this._offset.x}px, ${this._offset.y}px) ${this.transform}`;
    if (emit) this.offsetChange.emit(this._offset);
  }

  private offsetToRightGap = () => {
    if (!this.qDrag) return;
    if (this.rightGap !== undefined) {
      const box = this.qDrag.getBoundingClientRect();
      this._offset.x += window.innerWidth - box.right - this.rightGap;
      this.bindWindow(true);
    } else this.bindWindow();
  };

  private bindWindow(skipRight = false, emit = true) {
    if (!this.qDrag) return;
    const box = this.qDrag.getBoundingClientRect();
    if (box.right < 30) {
      this._offset.x += 30 - box.right;
    } else if (!skipRight && box.left > window.innerWidth - 30) {
      this._offset.x += window.innerWidth - 30 - box.left;
    }
    if (box.bottom < 45) {
      this._offset.y += 45 - box.bottom;
    } else if (box.top > window.innerHeight - 30) {
      this._offset.y += window.innerHeight - 30 - box.top;
    }

    if (!skipRight) {
      if (box.right < window.innerWidth / 2) delete this.rightGap;
      else this.rightGap = window.innerWidth - box.right;
    }
    this.updateTransform(emit);
  }

  private onDown = (event: MouseEvent) => {
    if (event.ctrlKey) return;

    this.startX = event.screenX;
    this.startY = event.screenY;
    document.addEventListener('mousemove', this.onMove);
    document.addEventListener('mouseup', this.onUp);
    event.preventDefault();
    const active = document.activeElement;
    if (active instanceof HTMLElement && active.id !== 'textinput') active.blur();
  };

  private touchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    // prevent double tap resetting the offset
    event.preventDefault();
    this.startX = touch.screenX;
    this.startY = touch.screenY;
    document.addEventListener('touchmove', this.touchMove);
    document.addEventListener('touchcancel', this.touchEnd);
    document.addEventListener('touchend', this.touchEnd);
  };

  private onMove = (event: MouseEvent) => {
    this._offset.x += (event.screenX - this.startX) / this.scale;
    this._offset.y += (event.screenY - this.startY) / this.scale;
    this.startX = event.screenX;
    this.startY = event.screenY;
    this.updateTransform();
  };

  private touchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    this._offset.x += (touch.screenX - this.startX) / this.scale;
    this._offset.y += (touch.screenY - this.startY) / this.scale;
    this.startX = touch.screenX;
    this.startY = touch.screenY;
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
