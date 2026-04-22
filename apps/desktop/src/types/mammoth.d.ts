declare module 'mammoth' {
  export type MammothMessage = {
    message: string;
    type: 'error' | 'warning';
  };

  export type ConvertToHtmlInput = {
    arrayBuffer: ArrayBuffer;
  };

  export type ConvertToHtmlOptions = {
    convertImage?: unknown;
  };

  export type ConvertToHtmlResult = {
    messages: readonly MammothMessage[];
    value: string;
  };

  export type MammothImages = {
    dataUri: unknown;
  };

  export type MammothModule = {
    convertToHtml(
      input: ConvertToHtmlInput,
      options?: ConvertToHtmlOptions,
    ): Promise<ConvertToHtmlResult>;
    images: MammothImages;
  };

  const mammoth: MammothModule;

  export default mammoth;
}
