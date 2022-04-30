import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private loaded = new Map<string, HTMLImageElement>();

  load(url: string): HTMLImageElement {
    let image = this.loaded.get(url);
    if (image) return image;
    image = new Image();
    image.src = url;
    this.loaded.set(url, image);
    return image;
  }
}
