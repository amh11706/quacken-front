import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

@Directive({
  selector: '[qZoom]',
  exportAs: 'qZoom',
  standalone: false,
})
export class QzoomDirective implements OnInit, OnDestroy {
  @Input() qZoom?: HTMLElement | '';
  @Input() ctrlZoom = false;
  private _zoom = 1;
  @Input() set zoom(value: number) {
    this.updateZoom(value, false);
  }

  @Output() zoomChange = new EventEmitter<number>();
  @Input() minZoom = 0.1;
  @Input() maxZoom = 10;
  @Input() zoomStep = 0.1;

  constructor(private el: ElementRef) { }

  ngOnInit(): void {
    if (!this.qZoom) this.qZoom = this.el.nativeElement;
    if (!this.qZoom) return;

    this.qZoom?.addEventListener('wheel', this.onScroll);
    this.qZoom?.addEventListener('touchstart', this.onTouchStart);
  }

  ngOnDestroy(): void {
    if (!this.qZoom) return;
    this.qZoom?.removeEventListener('wheel', this.onScroll);
    this.qZoom?.removeEventListener('touchstart', this.onTouchStart);
  }

  private onScroll = (event: WheelEvent) => {
    if (this.ctrlZoom && !event.ctrlKey) return;
    event.preventDefault();
    if (event.deltaY < 0) this.updateZoom(this._zoom + this.zoomStep);
    else this.updateZoom(this._zoom - this.zoomStep);
  };

  private onTouchStart = (event: TouchEvent) => {
    if (event.touches.length !== 2) return;
    event.preventDefault();
    const [a, b] = Array.from(event.touches);
    if (!a || !b) return;
    let startDistance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

    const onMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length !== 2) return;
      moveEvent.preventDefault();
      const [c, d] = Array.from(moveEvent.touches);
      if (!c || !d) return;
      const distance = Math.hypot(c.clientX - d.clientX, c.clientY - d.clientY);
      if (distance > startDistance + 10) {
        this.updateZoom(this._zoom + this.zoomStep);
        startDistance = distance;
      } else if (distance < startDistance - 10) {
        this.updateZoom(this._zoom - this.zoomStep);
        startDistance = distance;
      }
    };

    const onEnd = () => {
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    };
    document.addEventListener('touchmove', onMove);
    document.addEventListener('touchend', onEnd);
  };

  private updateZoom(value: number, emit = true): void {
    this._zoom = Math.max(this.minZoom, Math.min(this.maxZoom, value));
    this.el.nativeElement.style.transform = `scale(${this._zoom})`;
    if (emit) this.zoomChange.emit(this._zoom);
  }
}
