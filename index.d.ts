export type ImagesToTiffOptions = {
    readonly littleEndian?: boolean;
    readonly alpha?: boolean;
    readonly xResolution?: number;
    readonly yResolution?: number;
    readonly resolutionUnit?: 1 | 2 | 3;
};
export declare function imagesToTiffWithCompression(images: ArrayLike<ImageData>, compress: (imageData: Uint8ClampedArray) => readonly [number, ArrayBufferLike] | Promise<readonly [number, ArrayBufferLike]>, options?: ImagesToTiffOptions): Promise<ArrayBuffer>;
export declare const imagesToUncompressedTiff: (images: ArrayLike<ImageData>, options?: ImagesToTiffOptions) => Promise<ArrayBuffer>;
export declare const imagesToZlibTiff: (images: ArrayLike<ImageData>, options?: ImagesToTiffOptions) => Promise<ArrayBuffer>;
export declare const imagesToDeflateTiff: (images: ArrayLike<ImageData>, options?: ImagesToTiffOptions) => Promise<ArrayBuffer>;
