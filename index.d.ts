export type ImagesToTiffOptions = {
    readonly littleEndian?: boolean;
};
export declare function imagesToTiffWithCompression(images: ArrayLike<ImageData>, compress: (imageData: ImageData) => readonly [number, ArrayBufferLike] | Promise<readonly [number, ArrayBufferLike]>, options?: ImagesToTiffOptions): Promise<ArrayBuffer>;
export declare const imagesToUncompressedTiff: (images: ArrayLike<ImageData>, options?: ImagesToTiffOptions) => Promise<ArrayBuffer>;
export declare const imagesToZlibTiff: (images: ArrayLike<ImageData>, options?: ImagesToTiffOptions) => Promise<ArrayBuffer>;
export declare const imagesToDeflateTiff: (images: ArrayLike<ImageData>, options?: ImagesToTiffOptions) => Promise<ArrayBuffer>;
