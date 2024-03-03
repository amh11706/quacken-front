import { Directive, ElementRef, HostListener, Injector, OnInit, Optional } from '@angular/core';
import { EmojiFrequentlyService, EmojiSearch } from '@ctrl/ngx-emoji-mart';
import { NgModel } from '@angular/forms';
import { Emoji, EmojiData, EmojiService } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { FlexibleConnectedPositionStrategy, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { CustomEmojis } from '../../settings/account/account.component';
import { EmojiSearchResultsComponent } from '../emoji-search-results/emoji-search-results.component';

@Directive({
  selector: 'input[qEmojiInput]',
  standalone: true,
})
export class EmojiInputDirective implements OnInit {
  private overlayRef?: OverlayRef;
  private componentPortal?: ComponentPortal<EmojiSearchResultsComponent>;
  private overlayContext = {
    skin: 1 as Emoji['skin'],
    searchResults: [] as EmojiData[],
    onSelect: (emoji: EmojiData) => this.onSelect(emoji),
  };

  private cursorWordStart = 0;
  private cursorWordEnd = 0;

  constructor(
    private ref: ElementRef<HTMLInputElement>,
    private emojiSearch: EmojiSearch,
    @Optional() private model: NgModel,
    private overlay: Overlay,
    private injector: Injector,
    private frequent: EmojiFrequentlyService,
    private emojiService: EmojiService,
  ) {
    emojiSearch.addCustomToPool(CustomEmojis, emojiSearch.originalPool);

    model.valueChanges?.subscribe(_value => {
      this.onInput({} as InputEvent);
    });
  }

  ngOnInit(): void {
    const positionStrategy = this.getPositionStrategy(0);
    const overlayConfig = new OverlayConfig({
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    });

    this.overlayRef = this.overlay.create(overlayConfig);

    const customInjector = this.createInjector(this.overlayContext);
    this.componentPortal = new ComponentPortal(EmojiSearchResultsComponent, null, customInjector);
    this.overlayRef.backdropClick().subscribe(() => this.overlayRef?.detach());
  }

  private static lastValue = '';
  @HostListener('input', ['$event'])
  private onInput(_event: InputEvent) {
    const input = this.ref.nativeElement;
    if (input.value === EmojiInputDirective.lastValue) return;
    EmojiInputDirective.lastValue = input.value;

    const { start, end, word } = this.getCursorWord();
    this.cursorWordStart = start;
    this.cursorWordEnd = end;
    this.overlayContext.searchResults = [];
    if (word[0] !== ':') return this.overlayRef?.detach();

    this.overlayContext.searchResults = word.length > 1
      ? this.getSearchResults(word)
      : this.getFrequent();

    const finished = word.length > 1 && word[word.length - 1] === ':';
    if (finished) {
      this.overlayRef?.detach();
    } else if (!this.overlayRef?.hasAttached()) {
      this.overlayRef?.updatePositionStrategy(this.getPositionStrategy(this.cursorWordStart));
      this.overlayRef?.attach(this.componentPortal);
    }
  }

  @HostListener('keydown.escape', ['$event'])
  onEscape(event: KeyboardEvent) {
    event.preventDefault();
    this.overlayRef?.detach();
  }

  @HostListener('keydown.tab', ['$event'])
  onTab(event: KeyboardEvent) {
    const first = this.overlayContext.searchResults[0];
    if (!first) return;
    event.preventDefault();
    this.onSelect(this.emojiService.getSanitizedData(first, this.overlayContext.skin, 'apple'));
  }

  private createInjector(data: any): Injector {
    return Injector.create({
      parent: this.injector,
      providers: [
        { provide: 'overlayData', useValue: data },
      ],
    });
  }

  private getPositionStrategy(cursorIndex: number): FlexibleConnectedPositionStrategy {
    return this.overlay.position()
      .flexibleConnectedTo(this.ref)
      .withPositions([
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
          offsetX: this.getPixelLength(cursorIndex) + 10,
        },
      ]);
  }

  getFrequent(): EmojiData[] {
    const frequent = this.frequent.get(9, 5);
    if (!frequent) return [];
    const results = [];
    for (const name of frequent) {
      const emoji = this.emojiSearch.emojisList[name];
      if (emoji?.native) results.push(emoji);
    }
    return results;
  }

  getCursorWord(): {start: number, end: number, word: string} {
    const input = this.ref.nativeElement;
    const cursor = input.selectionStart;
    if (!cursor) return { start: 0, end: 0, word: '' };
    const value = input.value;
    const before = value.substring(0, cursor);
    const lastSpace = before.lastIndexOf(' ');

    const start = lastSpace + 1;
    let end = value.indexOf(' ', cursor);
    if (end === -1) end = value.length;
    const word = value.substring(start, end);
    return { start, end, word };
  }

  private getSearchResults(word: string): EmojiData[] {
    this.overlayContext.searchResults = [];
    const searchResults = this.emojiSearch.search(word.replaceAll(':', ''), undefined, 45) || [];
    const finished = word[word.length - 1] === ':';

    const results = [];
    for (const emoji of searchResults) {
      if (!emoji.native) continue;
      results.push(emoji);
      if (!finished || emoji.colons !== word) continue;

      this.onSelect(emoji);
      return [];
    }
    return results;
  }

  private onSelect(emoji: EmojiData) {
    if (!emoji.native) return;
    const input = this.ref.nativeElement;
    const value = input.value;
    const newValue = value.substring(0, this.cursorWordStart) + emoji.native + ' ' + value.substring(this.cursorWordEnd);
    input.selectionStart = this.cursorWordStart + emoji.native.length;
    input.selectionEnd = input.selectionStart;
    this.setValue(newValue);
    input.focus();
    this.overlayRef?.detach();
  }

  private setValue(value: string) {
    if (this.model) this.model.control.setValue(value);
    else this.ref.nativeElement.value = value;
  }

  private getPixelLength(index: number): number {
    const input = this.ref.nativeElement;
    const value = input.value;
    const before = value.substring(0, index);
    const text = document.createTextNode(before);
    const div = document.createElement('div');
    div.style.display = 'inline-block';
    div.style.visibility = 'hidden';
    div.style.width = 'auto';
    div.style.height = 'auto';
    div.style.whiteSpace = 'nowrap';
    div.style.font = window.getComputedStyle(input).font;

    div.appendChild(text);
    document.body.appendChild(div);
    const width = div.clientWidth;
    document.body.removeChild(div);
    return width;
  }
}
