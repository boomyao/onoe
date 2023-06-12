export function getObjectSizeInMB(obj: object) {
    const bytes = JSON.stringify(obj).length;
    const kilobytes = bytes / 1024;
    return kilobytes / 1024;
}