window.VUI_BROWSER_COMPAT = {
  "generatedAt": "2026-03-18T07:05:22.476Z",
  "sourceVersion": "1.0.30001778",
  "sourceName": "caniuse-lite",
  "components": {
    "modal": {
      "rows": [
        {
          "feature": "<dialog> element",
          "mdnUrl": "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/dialog",
          "browsers": {
            "chrome": "37+",
            "edge": "79+",
            "firefox": "98+",
            "safari": "15.4+"
          },
          "note": "Native modal and non-modal dialog support."
        },
        {
          "feature": "command + commandfor",
          "mdnUrl": "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/button",
          "browsers": {
            "chrome": "135+",
            "edge": "135+",
            "firefox": "144+",
            "safari": "26.2+"
          },
          "note": "Declarative dialog invocation is newer than the dialog element itself."
        }
      ]
    },
    "accordion": {
      "rows": [
        {
          "feature": "<details> and <summary>",
          "mdnUrl": "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/details",
          "browsers": {
            "chrome": "12+",
            "edge": "79+",
            "firefox": "49+",
            "safari": "6+"
          },
          "note": "Native disclosure support for the component structure."
        },
        {
          "feature": "details[name]",
          "mdnUrl": "https://developer.mozilla.org/docs/Web/API/HTMLDetailsElement/name",
          "browsers": {
            "chrome": "120+",
            "edge": "120+",
            "firefox": "130+",
            "safari": "17.2+"
          },
          "note": "Enables exclusive accordion groups without JavaScript."
        }
      ]
    },
    "dropdown": {
      "rows": [
        {
          "feature": "Popover API",
          "mdnUrl": "https://developer.mozilla.org/docs/Web/API/Popover_API",
          "browsers": {
            "chrome": "114+",
            "edge": "114+",
            "firefox": "125+",
            "safari": "17+"
          },
          "note": "Baseline 2025 feature for native, non-modal popup surfaces."
        },
        {
          "feature": "CSS anchor positioning",
          "mdnUrl": "https://developer.mozilla.org/docs/Web/CSS/Reference/Properties/position-anchor",
          "browsers": {
            "chrome": "125+",
            "edge": "125+",
            "firefox": "147+",
            "safari": "26.0+"
          },
          "note": "Used as a progressive enhancement for precise trigger-relative placement."
        }
      ]
    },
    "tooltip": {
      "rows": [
        {
          "feature": "Popover API",
          "mdnUrl": "https://developer.mozilla.org/docs/Web/API/Popover_API",
          "browsers": {
            "chrome": "114+",
            "edge": "114+",
            "firefox": "125+",
            "safari": "17+"
          },
          "note": "Provides the declarative tooltip surface and toggle behavior."
        },
        {
          "feature": "CSS anchor positioning",
          "mdnUrl": "https://developer.mozilla.org/docs/Web/CSS/Reference/Properties/position-anchor",
          "browsers": {
            "chrome": "125+",
            "edge": "125+",
            "firefox": "147+",
            "safari": "26.0+"
          },
          "note": "Improves placement in newer engines while older browsers use a fallback."
        },
        {
          "feature": "interestfor",
          "mdnUrl": "https://developer.mozilla.org/docs/Web/API/Popover_API",
          "browsers": {
            "chrome": "142+",
            "edge": "142+",
            "firefox": "No",
            "safari": "No"
          },
          "note": "Hover and focus tooltip invocation remains too new for the current support target."
        }
      ]
    },
    "form": {
      "rows": [
        {
          "feature": "Constraint validation",
          "mdnUrl": "https://developer.mozilla.org/docs/Learn_web_development/Extensions/Forms/Form_validation",
          "browsers": {
            "chrome": "15+",
            "edge": "12+",
            "firefox": "4+",
            "safari": "5.1+"
          },
          "note": "Covers built-in validation UI and submit blocking for native form controls."
        }
      ]
    }
  }
};
