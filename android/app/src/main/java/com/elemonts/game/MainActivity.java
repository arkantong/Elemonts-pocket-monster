package com.elemonts.game;

import android.webkit.WebView;
import android.net.Uri;
import android.widget.Toast;
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
                verifyLocalBuild(webView);
            }

            @Override
            public void onPageCommitVisible(WebView webView, String url) {
                verifyLocalBuild(webView);
            }

            private void verifyLocalBuild(WebView webView) {
                if (webView.getUrl() == null) return;
                Uri uri = Uri.parse(webView.getUrl());
                if (!"localhost".equals(uri.getHost()) ||
                    !("http".equals(uri.getScheme()) || "https".equals(uri.getScheme()))) return;
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
        try {
            String installed = getPackageManager().getPackageInfo(getPackageName(), 0).versionName;
            android.content.SharedPreferences prefs = getSharedPreferences("elemonts.build-verification", MODE_PRIVATE);
            if (!installed.equals(prefs.getString("last-announced-version", ""))) {
                Toast.makeText(this, "Elemonts " + installed, Toast.LENGTH_LONG).show();
                prefs.edit().putString("last-announced-version", installed).apply();
            }
        } catch (Exception error) {
            android.util.Log.w("ElemontsUpgrade", "Unable to announce installed version", error);
        }
    }
}
