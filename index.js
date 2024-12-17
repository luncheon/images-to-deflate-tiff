function writeValues(view, offset, type, values, littleEndian) {
    if (type === 3) {
        for (const value of values) {
            view.setUint16(offset, value, littleEndian);
            offset += 2;
        }
    }
    else {
        for (const value of values) {
            view.setUint32(offset, value, littleEndian);
            offset += 4;
        }
    }
}
const typeByteCounts = [0, 1, 1, 2, 4, 4, 1, 1, 2, 4, 4, 4, 8, 4];
function createIfdBuffer(tags, imageBuffer, hasNext, offset, littleEndian) {
    const ifdByteCount = 2 + tags.length * 12 + 4;
    const valuesOver4ByteCount = tags.reduce((total, ifd) => {
        const byteCount = typeByteCounts[ifd[1]] * ifd[2].length;
        return byteCount > 4 ? byteCount + total : total;
    }, 0);
    const ifdBuffer = new ArrayBuffer(ifdByteCount + valuesOver4ByteCount);
    const view = new DataView(ifdBuffer);
    view.setUint16(0, tags.length, littleEndian);
    let writeOffset = 2;
    let writeValuesOver4BytesOffset = 0;
    for (const [tagId, type, values] of tags) {
        view.setUint16(writeOffset, tagId, littleEndian);
        view.setUint16((writeOffset += 2), type, littleEndian);
        view.setUint32((writeOffset += 2), values.length, littleEndian);
        writeOffset += 4;
        const byteCount = typeByteCounts[type] * values.length;
        if (tagId === 273) {
            view.setUint32(writeOffset, offset + ifdBuffer.byteLength, littleEndian);
        }
        else if (byteCount > 4) {
            view.setUint32(writeOffset, offset + ifdByteCount + writeValuesOver4BytesOffset, littleEndian);
            writeValues(view, ifdByteCount + writeValuesOver4BytesOffset, type, values, littleEndian);
            writeValuesOver4BytesOffset += byteCount;
        }
        else {
            writeValues(view, writeOffset, type, values, littleEndian);
        }
        writeOffset += 4;
    }
    hasNext && view.setUint32(writeOffset, offset + ifdBuffer.byteLength + imageBuffer.byteLength, littleEndian);
    return ifdBuffer;
}
export async function imagesToTiffWithCompression(images, compress, options) {
    const littleEndian = options?.littleEndian ?? true;
    const stream = new TransformStream();
    const arrayBuffer$ = new Response(stream.readable).arrayBuffer();
    const writer = stream.writable.getWriter();
    await writer.ready;
    await writer.write(new Uint8Array(littleEndian ? [73, 73, 42, 0, 8, 0, 0, 0] : [77, 77, 0, 42, 0, 0, 0, 8]));
    for (let i = 0, offset = 8; i < images.length; i++) {
        const sourceImage = images[i];
        if (sourceImage.colorSpace !== "srgb") {
            throw new Error(`images-to-deflate-tiff: unsupported colorSpace: "${sourceImage.colorSpace}"`);
        }
        const [compressionTagValue, imageBuffer] = await compress(sourceImage);
        const bitsPerSample = [8, 8, 8, 8];
        const ifdBuffer = createIfdBuffer(
        // see https://www.itu.int/itudoc/itu-t/com16/tiff-fx/docs/tiff6.pdf p.24 Required Fields for RGB Images
        [
            [256, 4, [sourceImage.width]], // ImageWidth
            [257, 4, [sourceImage.height]], // ImageLength
            [258, 3, bitsPerSample], // BitsPerSample
            [259, 3, [compressionTagValue]], // Compression
            [262, 3, [2]], // PhotometricInterpretation,
            [273, 4, []], // StripOffsets
            [277, 3, [bitsPerSample.length]], // SamplesPerPixel,
            [278, 4, [sourceImage.height]], // RowsPerStrip
            [279, 4, [imageBuffer.byteLength]], // StripByteCounts
            [282, 5, [1, 1]], // XResolution
            [283, 5, [1, 1]], // YResolution
            [296, 3, [1]], // ResolutionUnit
            [338, 3, [1]], // ExtraSamples
        ], imageBuffer, i + 1 < images.length, offset, littleEndian);
        await writer.write(new Uint8Array(ifdBuffer));
        await writer.write(new Uint8Array(imageBuffer));
        offset += ifdBuffer.byteLength + imageBuffer.byteLength;
    }
    await writer.close();
    return arrayBuffer$;
}
async function compress(data, format) {
    const stream = new CompressionStream(format);
    const buffer$ = new Response(stream.readable).arrayBuffer();
    const writer = stream.writable.getWriter();
    await writer.ready;
    await writer.write(data);
    await writer.close();
    return buffer$;
}
export const imagesToUncompressedTiff = (images, options) => imagesToTiffWithCompression(images, image => [1, image.data.buffer], options);
export const imagesToZlibTiff = (images, options) => imagesToTiffWithCompression(images, async (image) => [8, await compress(image.data, "deflate")], options);
export const imagesToDeflateTiff = (images, options) => imagesToTiffWithCompression(images, async (image) => [32946, await compress(image.data, "deflate")], options);
