package com.elemonts.game;

import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import org.json.JSONObject;

public class MainActivity extends BridgeActivity {
    @Override
    protected void load() {
        // This hook lives in the APK, so stale cached JavaScript cannot bypass recovery.
        bridgeBuilder.addWebViewListener(new WebViewListener() {
            @Override
            public void onPageLoaded(WebView webView) {
                if (webView.getUrl() == null || !webView.getUrl().startsWith("http://localhost/")) return;
                try (InputStream stream = getAssets().open("native-upgrade.js")) {
                    ByteArrayOutputStream buffer = new ByteArrayOutputStream();
                    byte[] bytes = new byte[4096];
                    int count;
                    while ((count = stream.read(bytes)) != -1) buffer.write(bytes, 0, count);
                    String version = getPackageManager().getPackageInfo(getPackageName(), 0).versionName;
                    String script = "window.__elemontsNativeVersion=" + JSONObject.quote(version) + ";\n" +
                        new String(buffer.toByteArray(), StandardCharsets.UTF_8);
                    webView.evaluateJavascript(script, null);
                } catch (Exception error) {
                    android.util.Log.e("ElemontsUpgrade", "Unable to retire legacy web cache", error);
                }
            }
        });
        super.load();
        // Invalidate WebView HTTP resources, preserving all storage and cookies.
        bridge.getWebView().clearCache(true);
    }
}
