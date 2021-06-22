import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[qAutoSelect]',
})
export class AutoSelectDirective implements OnInit {
  constructor(
    private elRef: ElementRef<HTMLInputElement>,
  ) { }

  ngOnInit(): void {
    this.elRef.nativeElement.addEventListener('focus', () => {
      this.elRef.nativeElement.select();
    });
  }
}
