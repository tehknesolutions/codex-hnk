package com.hnk.keyboard;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.provider.Settings;
import android.view.Gravity;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

public class MainActivity extends Activity {
    private int dp(int value) {
        return (int)(value * getResources().getDisplayMetrics().density);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER_HORIZONTAL);
        root.setPadding(dp(24), dp(36), dp(24), dp(24));
        root.setBackgroundColor(Color.rgb(7,19,28));

        TextView title = new TextView(this);
        title.setText("HENUVOKODAN\nHNK KEYBOARD V0.2");
        title.setGravity(Gravity.CENTER);
        title.setTextSize(28);
        title.setTextColor(Color.rgb(229,196,107));
        root.addView(title);

        TextView body = new TextView(this);
        body.setText(
            "HNK · 40 glifos Sacred 10×4\n\n" +
            "ABC→HNK · composição inteligente\n" +
            "NG SH KH TH TS ZH DH CH DJ GH\n\n" +
            "IPA · referência fonética\n" +
            "123 · símbolos e números\n\n" +
            "Toque curto = PUA\n" +
            "Toque longo = transliteração"
        );
        body.setTextColor(Color.WHITE);
        body.setTextSize(15);
        body.setPadding(0, dp(28), 0, dp(28));
        root.addView(body);

        Button enable = new Button(this);
        enable.setText("1 · ATIVAR HNK KEYBOARD");
        enable.setOnClickListener(v ->
            startActivity(new Intent(Settings.ACTION_INPUT_METHOD_SETTINGS))
        );
        root.addView(enable);

        Button select = new Button(this);
        select.setText("2 · ESCOLHER HNK KEYBOARD");
        select.setOnClickListener(v -> {
            InputMethodManager imm = (InputMethodManager)getSystemService(INPUT_METHOD_SERVICE);
            imm.showInputMethodPicker();
        });
        root.addView(select);

        TextView privacy = new TextView(this);
        privacy.setText("Privacidade: sem Internet, câmera, microfone, contatos, localização, storage, analytics ou telemetria.");
        privacy.setTextColor(Color.LTGRAY);
        privacy.setTextSize(12);
        privacy.setPadding(0,dp(24),0,0);
        root.addView(privacy);

        setContentView(root);
    }
}
