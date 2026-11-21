package io.github.insta.focus;

import android.webkit.WebView;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;
import com.getcapacitor.Logger;
import com.getcapacitor.Plugin;
import com.getcapacitor.WebViewListener;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Set;

/**
 * Injects public/inject.js (built from src/focus.js) into every instagram.com page.
 * load() runs before the WebView loads its first page, so the script is in place from the start.
 */
@CapacitorPlugin(name = "Focus")
public class FocusPlugin extends Plugin {

    @Override
    public void load() {
        final String script = readAsset("public/inject.js");
        if (script == null) return;
        WebView webView = getBridge().getWebView();

        if (WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) {
            Set<String> origins = new HashSet<>();
            origins.add("https://www.instagram.com");
            origins.add("https://instagram.com");
            WebViewCompat.addDocumentStartJavaScript(webView, script, origins);
        } else {
            // Older WebView: inject once each page has loaded. The script guards against running twice.
            getBridge().addWebViewListener(new WebViewListener() {
                @Override
                public void onPageLoaded(WebView view) {
                    view.evaluateJavascript(script, null);
                }
            });
        }
    }

    private String readAsset(String path) {
        try (InputStream in = getContext().getAssets().open(path)) {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buffer = new byte[8192];
            int n;
            while ((n = in.read(buffer)) != -1) out.write(buffer, 0, n);
            return out.toString(StandardCharsets.UTF_8.name());
        } catch (Exception e) {
            Logger.error("Focus", "Could not read " + path, e);
            return null;
        }
    }
}
