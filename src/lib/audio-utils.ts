
/**
 * Utility to trim silence from the beginning and end of an audio blob.
 * It decodes the audio, finds the first and last samples above a threshold,
 * and re-encodes the trimmed portion as a WAV file.
 */
export async function trimSilence(blob: Blob, threshold = 0.012, paddingSeconds = 0.15): Promise<Blob> {
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    let audioBuffer: AudioBuffer;
    try {
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
        console.warn("Failed to decode audio for trimming, returning original blob.", error);
        return blob;
    } finally {
        audioContext.close();
    }

    const channelData = audioBuffer.getChannelData(0); // Use first channel for analysis
    const sampleRate = audioBuffer.sampleRate;

    let startSample = 0;
    let endSample = channelData.length - 1;

    // Find start: first sample exceeding threshold
    for (let i = 0; i < channelData.length; i++) {
        if (Math.abs(channelData[i]) > threshold) {
            startSample = i;
            break;
        }
    }

    // Find end: last sample exceeding threshold
    for (let i = channelData.length - 1; i >= 0; i--) {
        if (Math.abs(channelData[i]) > threshold) {
            endSample = i;
            break;
        }
    }

    // Add padding
    const paddingSamples = Math.floor(paddingSeconds * sampleRate);
    startSample = Math.max(0, startSample - paddingSamples);
    endSample = Math.min(channelData.length - 1, endSample + paddingSamples);

    // If the trimmed range is invalid or basically the whole file, just return original
    if (startSample >= endSample || (endSample - startSample) > channelData.length * 0.99) {
        return blob;
    }

    // Create trimmed buffer
    const trimmedLength = endSample - startSample + 1;
    const trimmedBuffer = new AudioBuffer({
        numberOfChannels: audioBuffer.numberOfChannels,
        length: trimmedLength,
        sampleRate: audioBuffer.sampleRate,
    });

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const originalData = audioBuffer.getChannelData(channel);
        const trimmedData = trimmedBuffer.getChannelData(channel);
        for (let i = 0; i < trimmedLength; i++) {
            trimmedData[i] = originalData[startSample + i];
        }
    }

    return audioBufferToWav(trimmedBuffer);
}

/**
 * Encodes an AudioBuffer into a WAV Blob.
 */
function audioBufferToWav(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const blockAlign = numChannels * (bitDepth / 8);
    const byteRate = sampleRate * blockAlign;
    const dataSize = buffer.length * blockAlign;
    const bufferLength = 44 + dataSize;
    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);

    // RIFF identifier
    writeString(view, 0, 'RIFF');
    // RIFF chunk length
    view.setUint32(4, 36 + dataSize, true);
    // RIFF type
    writeString(view, 8, 'WAVE');
    // format chunk identifier
    writeString(view, 12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw)
    view.setUint16(20, format, true);
    // channel count
    view.setUint16(22, numChannels, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, byteRate, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, blockAlign, true);
    // bits per sample
    view.setUint16(34, bitDepth, true);
    // data chunk identifier
    writeString(view, 36, 'data');
    // data chunk length
    view.setUint32(40, dataSize, true);

    // Write PCM samples
    const offset = 44;
    for (let i = 0; i < buffer.length; i++) {
        for (let channel = 0; channel < numChannels; channel++) {
            const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
            const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(offset + (i * blockAlign) + (channel * 2), intSample, true);
        }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}
