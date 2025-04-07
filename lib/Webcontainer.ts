import { WebContainer } from '@webcontainer/api';

let webcontainerInstance: WebContainer | null = null;
let instancePromise: Promise<WebContainer> | null = null;

export const getWebContainer = async () => {
  if (webcontainerInstance) return webcontainerInstance;
  if (instancePromise) return instancePromise;

  instancePromise = WebContainer.boot();
  webcontainerInstance = await instancePromise;
  return webcontainerInstance;
};

export const teardownWebContainer = async () => {
  if (webcontainerInstance) {
    await webcontainerInstance.teardown();
    webcontainerInstance = null;
    instancePromise = null;
  }
};