import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { EmojiSearch, PreviewComponent } from '@ctrl/ngx-emoji-mart';
import { Emoji, EmojiComponent, EmojiData, EmojiService } from '@ctrl/ngx-emoji-mart/ngx-emoji';

const I18N: any = {
  search: 'Search',
  emojilist: 'List of emoji',
  notfound: 'No Emoji Found',
  clear: 'Clear',
  categories: {
    search: 'Search Results',
    recent: 'Frequently Used',
    people: 'Smileys & People',
    nature: 'Animals & Nature',
    foods: 'Food & Drink',
    activity: 'Activity',
    places: 'Travel & Places',
    objects: 'Objects',
    symbols: 'Symbols',
    flags: 'Flags',
    custom: 'Custom',
  },
  skintones: {
    1: 'Default Skin Tone',
    2: 'Light Skin Tone',
    3: 'Medium-Light Skin Tone',
    4: 'Medium Skin Tone',
    5: 'Medium-Dark Skin Tone',
    6: 'Dark Skin Tone',
  },
};

@Component({
    selector: 'q-emoji-search-results',
    imports: [
        CommonModule,
        EmojiComponent,
        MatCardModule,
        PreviewComponent,
    ],
    templateUrl: './emoji-search-results.component.html',
    styleUrl: './emoji-search-results.component.scss'
})
export class EmojiSearchResultsComponent implements OnInit {
  hoveredEmoji: EmojiData | null = null;
  defaultEmoji: EmojiData;
  i18n = I18N;
  NAMESPACE = 'emoji-mart';

  constructor(
    @Inject('overlayData') public data: { skin: Emoji['skin'], searchResults: EmojiData[], onSelect: (d: EmojiData) => void },
    emojiSearch: EmojiSearch,
    private emojiService: EmojiService,
  ) {
    this.defaultEmoji = emojiSearch.emojisList.duck;
  }

  ngOnInit(): void {
    this.data.skin =
      JSON.parse(
        (localStorage.getItem(`${this.NAMESPACE}.skin`)) ||
        'null',
      ) || this.data.skin;
  }

  handleSkinChange(skin: Emoji['skin']) {
    this.data.skin = skin;
    localStorage.setItem(`${this.NAMESPACE}.skin`, String(skin));
  }

  hoverEmoji(emoji: EmojiData): void {
    emoji = this.emojiService.getSanitizedData(emoji, this.data.skin, 'apple') as EmojiData;
    this.hoveredEmoji = emoji;
  }

  onSelect(emoji: EmojiData): void {
    emoji = this.emojiService.getSanitizedData(emoji, this.data.skin, 'apple') as EmojiData;
    this.data.onSelect(emoji);
  }

  onSkinChange(skin: Emoji['skin']): void {
    this.data.skin = skin;
  }
}
