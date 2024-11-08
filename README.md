# images-to-deflate-tiff

Generate a deflate-compressed tiff file from one or more images.

[Demo](https://luncheon.github.io/images-to-deflate-tiff/)

## Installation

```sh
npm i luncheon/images-to-deflate-tiff
```

## Usage

```ts
import { imagesToDeflateTiff, imagesToZlibTiff, imagesToUncompressedTiff } from "images-to-deflate-tiff";

const images = [document.querySelector("canvas").getContext("2d").getImageData(0, 0, canvas.width, canvas.height)];

// Compression: 1 (No compression)
const uncompressedTiffArrayBuffer = await imagesToUncompressedTiff(images);

// Compression: 32946 (Deflate)
const deflateTiffArrayBuffer = await imagesToDeflateTiff(images);

// Compression: 8 (Zlib = Deflate)
const zlibTiffArrayBuffer = await imagesToZlibTiff(images);
```

The argument is an array of `ImageData` (or object with `data`, `width`, `height` and `colorSpace: "srgb"` properties).

See https://developer.mozilla.org/docs/Web/API/ImageData

```ts
import { imagesToZlibTiff } from "images-to-deflate-tiff";

async function imageDataFromImageFile(file: File): Promise<ImageData> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d");
  context.drawImage(bitmap, 0, 0);
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  bitmap.close();
  return image;
}

async function tiffFileFromImageFiles(files: FileList): Promise<File> {
  const images = await Promise.all(Array.from(files, imageDataFromImageFile));
  const tiffArrayBuffer = await imagesToZlibTiff(images);
  return new File([tiffArrayBuffer], "file.tiff", { type: "image/tiff" });
}
```