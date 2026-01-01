import { Directive, ElementRef, OnInit, inject } from '@angular/core';

@Directive({
  selector: '[qAutoSelect]',
  standalone: false,
})
export class AutoSelectDirective implements OnInit {
  private elRef = inject<ElementRef<HTMLInputElement>>(ElementRef);


  ngOnInit(): void {
    this.elRef.nativeElement.addEventListener('focus', () => {
      this.elRef.nativeElement.select();
    });
  }
}
