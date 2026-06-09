import {
  OAUTH_MESSAGE_TYPE,
  type OAuthCallbackMessage,
} from "./oauth";

const POPUP_FEATURES = "width=520,height=720,left=200,top=100,scrollbars=yes,resizable=yes";

export function openMarketplaceOAuthPopup(url: string): Promise<Record<string, string>> {
  return new Promise((resolve, reject) => {
    const popup = window.open(url, "commerceone_marketplace_oauth", POPUP_FEATURES);

    if (!popup) {
      reject(new Error("Popup blocked. Allow popups for this site to authorize with the marketplace."));
      return;
    }

    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      clearInterval(closedCheck);
    };

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as OAuthCallbackMessage;
      if (data?.type !== OAUTH_MESSAGE_TYPE) return;

      cleanup();
      try {
        popup.close();
      } catch {
        /* popup may already be closed */
      }

      if (data.success && data.tokens) {
        resolve(data.tokens);
      } else {
        reject(new Error(data.error ?? "Authorization was not completed."));
      }
    };

    window.addEventListener("message", onMessage);

    const closedCheck = setInterval(() => {
      if (popup.closed) {
        cleanup();
        reject(new Error("Authorization window was closed before completing sign-in."));
      }
    }, 500);
  });
}
