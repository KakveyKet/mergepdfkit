/**
 * PDFEasy Adsterra banner configuration
 *
 * Supported code format: Adsterra JS ASYNC
 *
 * IMPORTANT:
 * Copy key, scriptUrl and containerId from
 * each banner's own GET CODE window.
 *
 * The numeric Ad Unit ID shown in the dashboard
 * is not the same as the JavaScript key.
 */

export const adsterraConfig = {
  enabled: false,
  desktop: {
    type: "iframe",
    key: "ee49ebed2697ae5a0bf1cc465a5ebc34",
    scriptUrl: "https://bauval.org/22/ee49ebed2697ae5a0bf1cc465a5ebc34",
    width: 728,
    height: 90,
    params: {},
  },

  mobile: {
    type: "iframe",
    key: "bef3532f3515f3aac77d1e9253e40b3d",
    scriptUrl: "https://bauval.org/22/bef3532f3515f3aac77d1e9253e40b3d",
    width: 320,
    height: 50,
    params: {},
  },

  rectangle: {
    type: "iframe",
    key: "821f667fe4e637b4e2b749546ffe6b2b",
    scriptUrl: "https://bauval.org/22/821f667fe4e637b4e2b749546ffe6b2b",
    width: 300,
    height: 250,
    params: {},
  },
};
