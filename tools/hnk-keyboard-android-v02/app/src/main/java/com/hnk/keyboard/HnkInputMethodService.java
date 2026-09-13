package com.hnk.keyboard;

import android.graphics.Color;
import android.inputmethodservice.InputMethodService;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.GridLayout;
import android.widget.HorizontalScrollView;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class HnkInputMethodService extends InputMethodService {

    private static final int MODE_HNK = 0;
    private static final int MODE_COMPOSE = 1;
    private static final int MODE_IPA = 2;
    private static final int MODE_SYMBOLS = 3;

    private int mode = MODE_HNK;
    private LinearLayout content;
    private TextView modeLabel;
    private TextView infoLabel;
    private final StringBuilder composeBuffer = new StringBuilder();

    private final String[] translitKeys = {
        "A","E","I","O","U","Ë","H","Ḥ",
        "M","N","L","R","Y","W",
        "B","D","G","P","T","K","Q","F","S","V","Z",
        "C","J","’","‘","Ṣ","Ṭ","Ü"
    };

    private final String[] symbols = {
        ".",",",":",";","!","?","-","—",
        "(",")","[","]","{","}","/","\\",
        "\"","'","+","=","@","#","%","&",
        "0","1","2","3","4","5","6","7","8","9"
    };

    private int dp(int value) {
        return (int)(value * getResources().getDisplayMetrics().density);
    }

    @Override
    public View onCreateInputView() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.rgb(7,19,28));
        root.setPadding(dp(5),dp(5),dp(5),dp(5));

        root.addView(buildTopBar());

        infoLabel = new TextView(this);
        infoLabel.setText("Toque = PUA · Segure = transliteração");
        infoLabel.setTextColor(Color.rgb(147,164,173));
        infoLabel.setTextSize(11);
        infoLabel.setGravity(Gravity.CENTER);
        infoLabel.setPadding(dp(4),dp(3),dp(4),dp(3));
        root.addView(infoLabel);

        content = new LinearLayout(this);
        content.setOrientation(LinearLayout.VERTICAL);
        root.addView(content, new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f
        ));

        root.addView(buildBottomBar());
        renderMode();
        return root;
    }

    private View buildTopBar() {
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setGravity(Gravity.CENTER_VERTICAL);

        modeLabel = new TextView(this);
        modeLabel.setText("HNK");
        modeLabel.setTextColor(Color.rgb(229,196,107));
        modeLabel.setTextSize(11);
        modeLabel.setPadding(dp(5),0,dp(5),0);
        row.addView(modeLabel, new LinearLayout.LayoutParams(0,dp(38),1f));

        row.addView(topButton("HNK", () -> { mode=MODE_HNK; renderMode(); }));
        row.addView(topButton("ABC→HNK", () -> { mode=MODE_COMPOSE; renderMode(); }));
        row.addView(topButton("IPA", () -> { mode=MODE_IPA; renderMode(); }));
        row.addView(topButton("123", () -> { mode=MODE_SYMBOLS; renderMode(); }));
        return row;
    }

    private View buildBottomBar() {
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);

        Button back = bottomButton("⌫", () -> {
            if (mode == MODE_COMPOSE && composeBuffer.length() > 0) {
                composeBuffer.deleteCharAt(composeBuffer.length()-1);
                renderMode();
            } else if (getCurrentInputConnection() != null) {
                getCurrentInputConnection().deleteSurroundingText(1,0);
            }
        });
        row.addView(back, new LinearLayout.LayoutParams(0,dp(48),1f));

        Button space = bottomButton("ESPAÇO", () -> {
            if (mode == MODE_COMPOSE) {
                composeBuffer.append(' ');
                renderMode();
            } else if (getCurrentInputConnection() != null) {
                getCurrentInputConnection().commitText(" ",1);
            }
        });
        row.addView(space, new LinearLayout.LayoutParams(0,dp(48),3f));

        Button enter = bottomButton("↵", () -> {
            if (getCurrentInputConnection() != null) {
                getCurrentInputConnection().commitText("\n",1);
            }
        });
        row.addView(enter, new LinearLayout.LayoutParams(0,dp(48),1f));

        Button next = bottomButton("🌐", () -> {
            if (android.os.Build.VERSION.SDK_INT >= 28 && shouldOfferSwitchingToNextInputMethod()) switchToNextInputMethod(false);
        });
        row.addView(next, new LinearLayout.LayoutParams(0,dp(48),1f));
        return row;
    }

    private void renderMode() {
        if (content == null) return;
        content.removeAllViews();

        if (mode == MODE_HNK) {
            modeLabel.setText("HNK · PUA");
            infoLabel.setText("Toque = PUA · Segure = transliteração");
            content.addView(buildSacredGrid(false));
        } else if (mode == MODE_IPA) {
            modeLabel.setText("HNK · IPA");
            infoLabel.setText("Rótulo = IPA · saída = PUA");
            content.addView(buildSacredGrid(true));
        } else if (mode == MODE_COMPOSE) {
            modeLabel.setText("ABC → HNK");
            infoLabel.setText("Maior correspondência · TS = G30");
            content.addView(buildComposePanel());
        } else {
            modeLabel.setText("SÍMBOLOS");
            infoLabel.setText("Unicode normal");
            content.addView(buildSymbolGrid());
        }
    }

    private View buildSacredGrid(boolean ipaMode) {
        GridLayout grid = new GridLayout(this);
        grid.setColumnCount(10);
        grid.setRowCount(4);

        for (GlyphRegistry.Glyph glyph : GlyphRegistry.GLYPHS) {
            View key;
            if (ipaMode) {
                Button b = keyButton(glyph.ipa.substring(1,glyph.ipa.length()-1), () -> commitGlyph(glyph));
                b.setTextSize(10);
                key = b;
            } else {
                ImageButton b = new ImageButton(this);
                b.setImageResource(glyph.drawableRes);
                b.setColorFilter(Color.WHITE);
                b.setBackgroundColor(Color.rgb(10,31,44));
                b.setPadding(dp(6),dp(5),dp(6),dp(5));
                b.setContentDescription(glyph.gid+" "+glyph.transliteration+" "+glyph.ipa);
                b.setOnClickListener(v -> commitGlyph(glyph));
                b.setOnLongClickListener(v -> {
                    if (getCurrentInputConnection()!=null)
                        getCurrentInputConnection().commitText(glyph.transliteration,1);
                    infoLabel.setText(glyph.gid+" · transliteração enviada");
                    return true;
                });
                key = b;
            }

            GridLayout.LayoutParams p = new GridLayout.LayoutParams();
            p.width = 0;
            p.height = 0;
            p.columnSpec = GridLayout.spec(GridLayout.UNDEFINED,1f);
            p.rowSpec = GridLayout.spec(GridLayout.UNDEFINED,1f);
            p.setMargins(dp(1),dp(1),dp(1),dp(1));
            grid.addView(key,p);
        }
        return grid;
    }

    private void commitGlyph(GlyphRegistry.Glyph glyph) {
        if (getCurrentInputConnection()!=null)
            getCurrentInputConnection().commitText(glyph.puaText(),1);
        infoLabel.setText(glyph.gid+" · "+glyph.transliteration+" · "+glyph.ipa);
    }

    private View buildComposePanel() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);

        TextView buffer = new TextView(this);
        buffer.setText(composeBuffer.length()==0 ? "Digite: HENUVOKODAN, SH, TS…" : composeBuffer.toString());
        buffer.setTextColor(composeBuffer.length()==0 ? Color.GRAY : Color.WHITE);
        buffer.setTextSize(17);
        buffer.setPadding(dp(8),dp(5),dp(8),dp(5));
        root.addView(buffer,new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,dp(40)
        ));

        TransliterationComposer.Result result = TransliterationComposer.compose(composeBuffer.toString());

        HorizontalScrollView scroll = new HorizontalScrollView(this);
        LinearLayout preview = new LinearLayout(this);
        preview.setOrientation(LinearLayout.HORIZONTAL);
        preview.setGravity(Gravity.CENTER_VERTICAL);

        for (GlyphRegistry.Glyph glyph : result.glyphs) {
            ImageView image = new ImageView(this);
            image.setImageResource(glyph.drawableRes);
            image.setColorFilter(Color.rgb(229,196,107));
            image.setPadding(dp(5),dp(4),dp(5),dp(4));
            preview.addView(image,new LinearLayout.LayoutParams(dp(46),dp(46)));
        }
        scroll.addView(preview);
        root.addView(scroll,new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,dp(50)
        ));

        if (result.unresolved.length()==0) {
            infoLabel.setText("Reconhecido · "+result.glyphs.size()+" glifo(s)");
        } else {
            infoLabel.setText("Não reconhecido: "+result.unresolved);
        }

        GridLayout grid = new GridLayout(this);
        grid.setColumnCount(8);
        for (String keyText : translitKeys) {
            Button b = keyButton(keyText, () -> {
                composeBuffer.append(keyText);
                renderMode();
            });
            GridLayout.LayoutParams p = new GridLayout.LayoutParams();
            p.width=0; p.height=dp(40);
            p.columnSpec=GridLayout.spec(GridLayout.UNDEFINED,1f);
            p.setMargins(dp(1),dp(1),dp(1),dp(1));
            grid.addView(b,p);
        }
        root.addView(grid,new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,0,1f
        ));

        LinearLayout actions = new LinearLayout(this);
        actions.setOrientation(LinearLayout.HORIZONTAL);
        Button clear = bottomButton("LIMPAR", () -> {
            composeBuffer.setLength(0);
            renderMode();
        });
        actions.addView(clear,new LinearLayout.LayoutParams(0,dp(42),1f));

        Button send = bottomButton("ENVIAR HNK", () -> {
            TransliterationComposer.Result r = TransliterationComposer.compose(composeBuffer.toString());
            if (r.unresolved.length()==0 && r.pua.length()>0 && getCurrentInputConnection()!=null) {
                getCurrentInputConnection().commitText(r.pua,1);
                composeBuffer.setLength(0);
                renderMode();
            } else if (r.unresolved.length()>0) {
                infoLabel.setText("Corrija: "+r.unresolved);
            }
        });
        actions.addView(send,new LinearLayout.LayoutParams(0,dp(42),2f));
        root.addView(actions);
        return root;
    }

    private View buildSymbolGrid() {
        GridLayout grid = new GridLayout(this);
        grid.setColumnCount(8);
        for (String symbol : symbols) {
            Button b = keyButton(symbol, () -> {
                if (getCurrentInputConnection()!=null)
                    getCurrentInputConnection().commitText(symbol,1);
            });
            GridLayout.LayoutParams p = new GridLayout.LayoutParams();
            p.width=0;p.height=dp(44);
            p.columnSpec=GridLayout.spec(GridLayout.UNDEFINED,1f);
            p.setMargins(dp(1),dp(1),dp(1),dp(1));
            grid.addView(b,p);
        }
        return grid;
    }

    private Button topButton(String text, Runnable action) {
        Button b = keyButton(text,action);
        b.setTextSize(9);
        return b;
    }

    private Button bottomButton(String text, Runnable action) {
        Button b = keyButton(text,action);
        b.setTextSize(11);
        return b;
    }

    private Button keyButton(String text, Runnable action) {
        Button b = new Button(this);
        b.setText(text);
        b.setAllCaps(false);
        b.setTextColor(Color.WHITE);
        b.setBackgroundColor(Color.rgb(10,31,44));
        b.setPadding(0,0,0,0);
        b.setOnClickListener(v -> action.run());
        return b;
    }
}

final class GlyphRegistry {
    public static final class Glyph {
        public final String gid;
        public final String transliteration;
        public final String ipa;
        public final int codePoint;
        public final int drawableRes;

        public Glyph(String gid, String transliteration, String ipa, int codePoint, int drawableRes) {
            this.gid = gid;
            this.transliteration = transliteration;
            this.ipa = ipa;
            this.codePoint = codePoint;
            this.drawableRes = drawableRes;
        }

        public String puaText() {
            return new String(Character.toChars(codePoint));
        }
    }

    public static final Glyph[] GLYPHS = new Glyph[] {
        new Glyph("G01", "A", "/a/", 0xE001, R.drawable.glyph_g01),
        new Glyph("G02", "E", "/e/", 0xE002, R.drawable.glyph_g02),
        new Glyph("G03", "I", "/i/", 0xE003, R.drawable.glyph_g03),
        new Glyph("G04", "O", "/o/", 0xE004, R.drawable.glyph_g04),
        new Glyph("G05", "U", "/u/", 0xE005, R.drawable.glyph_g05),
        new Glyph("G06", "Ë", "/ə/", 0xE006, R.drawable.glyph_g06),
        new Glyph("G07", "H", "/h/", 0xE007, R.drawable.glyph_g07),
        new Glyph("G08", "’", "/ʔ/", 0xE008, R.drawable.glyph_g08),
        new Glyph("G09", "‘", "/ʕ/", 0xE009, R.drawable.glyph_g09),
        new Glyph("G10", "Ḥ", "/ħ/", 0xE00A, R.drawable.glyph_g10),
        new Glyph("G11", "M", "/m/", 0xE00B, R.drawable.glyph_g11),
        new Glyph("G12", "N", "/n/", 0xE00C, R.drawable.glyph_g12),
        new Glyph("G13", "NG", "/ŋ/", 0xE00D, R.drawable.glyph_g13),
        new Glyph("G14", "L", "/l/", 0xE00E, R.drawable.glyph_g14),
        new Glyph("G15", "R", "/r/", 0xE00F, R.drawable.glyph_g15),
        new Glyph("G16", "Y", "/j/", 0xE010, R.drawable.glyph_g16),
        new Glyph("G17", "W", "/w/", 0xE011, R.drawable.glyph_g17),
        new Glyph("G18", "B", "/b/", 0xE012, R.drawable.glyph_g18),
        new Glyph("G19", "D", "/d/", 0xE013, R.drawable.glyph_g19),
        new Glyph("G20", "G", "/g/", 0xE014, R.drawable.glyph_g20),
        new Glyph("G21", "P", "/p/", 0xE015, R.drawable.glyph_g21),
        new Glyph("G22", "T", "/t/", 0xE016, R.drawable.glyph_g22),
        new Glyph("G23", "K", "/k/", 0xE017, R.drawable.glyph_g23),
        new Glyph("G24", "Q", "/q/", 0xE018, R.drawable.glyph_g24),
        new Glyph("G25", "F", "/f/", 0xE019, R.drawable.glyph_g25),
        new Glyph("G26", "S", "/s/", 0xE01A, R.drawable.glyph_g26),
        new Glyph("G27", "SH", "/ʃ/", 0xE01B, R.drawable.glyph_g27),
        new Glyph("G28", "KH", "/x/", 0xE01C, R.drawable.glyph_g28),
        new Glyph("G29", "TH", "/θ/", 0xE01D, R.drawable.glyph_g29),
        new Glyph("G30", "TS", "/ts/", 0xE01E, R.drawable.glyph_g30),
        new Glyph("G31", "V", "/v/", 0xE01F, R.drawable.glyph_g31),
        new Glyph("G32", "Z", "/z/", 0xE020, R.drawable.glyph_g32),
        new Glyph("G33", "ZH", "/ʒ/", 0xE021, R.drawable.glyph_g33),
        new Glyph("G34", "DH", "/ð/", 0xE022, R.drawable.glyph_g34),
        new Glyph("G35", "CH", "/tʃ/", 0xE023, R.drawable.glyph_g35),
        new Glyph("G36", "DJ", "/dʒ/", 0xE024, R.drawable.glyph_g36),
        new Glyph("G37", "Ṣ", "/sˤ/", 0xE025, R.drawable.glyph_g37),
        new Glyph("G38", "Ṭ", "/tˤ/", 0xE026, R.drawable.glyph_g38),
        new Glyph("G39", "GH", "/ɣ/", 0xE027, R.drawable.glyph_g39),
        new Glyph("G40", "Ü", "/y/", 0xE028, R.drawable.glyph_g40)
    };

    public static Glyph byGid(String gid) {
        for (Glyph g : GLYPHS) if (g.gid.equals(gid)) return g;
        return null;
    }

    private GlyphRegistry() {}
}

final class TransliterationComposer {

    private static final LinkedHashMap<String, String> TOKENS = new LinkedHashMap<>();

    static {
        TOKENS.put("NG","G13");
        TOKENS.put("SH","G27");
        TOKENS.put("KH","G28");
        TOKENS.put("TH","G29");
        TOKENS.put("TS","G30");
        TOKENS.put("ZH","G33");
        TOKENS.put("DH","G34");
        TOKENS.put("CH","G35");
        TOKENS.put("DJ","G36");
        TOKENS.put("GH","G39");

        TOKENS.put("A","G01"); TOKENS.put("E","G02"); TOKENS.put("I","G03");
        TOKENS.put("O","G04"); TOKENS.put("U","G05"); TOKENS.put("Ë","G06");
        TOKENS.put("H","G07"); TOKENS.put("’","G08"); TOKENS.put("‘","G09");
        TOKENS.put("Ḥ","G10"); TOKENS.put("M","G11"); TOKENS.put("N","G12");
        TOKENS.put("L","G14"); TOKENS.put("R","G15"); TOKENS.put("Y","G16");
        TOKENS.put("W","G17"); TOKENS.put("B","G18"); TOKENS.put("D","G19");
        TOKENS.put("G","G20"); TOKENS.put("P","G21"); TOKENS.put("T","G22");
        TOKENS.put("K","G23"); TOKENS.put("Q","G24"); TOKENS.put("F","G25");
        TOKENS.put("S","G26"); TOKENS.put("V","G31"); TOKENS.put("Z","G32");
        TOKENS.put("Ṣ","G37"); TOKENS.put("Ṭ","G38"); TOKENS.put("Ü","G40");
    }

    public static final class Result {
        public final List<GlyphRegistry.Glyph> glyphs;
        public final String pua;
        public final String unresolved;

        Result(List<GlyphRegistry.Glyph> glyphs, String pua, String unresolved) {
            this.glyphs = glyphs;
            this.pua = pua;
            this.unresolved = unresolved;
        }
    }

    public static Result compose(String raw) {
        String src = raw.toUpperCase(Locale.ROOT);
        ArrayList<GlyphRegistry.Glyph> glyphs = new ArrayList<>();
        StringBuilder pua = new StringBuilder();
        StringBuilder unresolved = new StringBuilder();

        int i = 0;
        while (i < src.length()) {
            char ch = src.charAt(i);
            if (Character.isWhitespace(ch)) {
                pua.append(ch);
                i++;
                continue;
            }

            String hit = null;
            String gid = null;

            if (i + 2 <= src.length()) {
                String two = src.substring(i, i + 2);
                gid = TOKENS.get(two);
                if (gid != null) hit = two;
            }

            if (hit == null) {
                String one = src.substring(i, i + 1);
                gid = TOKENS.get(one);
                if (gid != null) hit = one;
            }

            if (hit == null) {
                unresolved.append(ch);
                i++;
                continue;
            }

            GlyphRegistry.Glyph glyph = GlyphRegistry.byGid(gid);
            glyphs.add(glyph);
            pua.append(glyph.puaText());
            i += hit.length();
        }

        return new Result(glyphs, pua.toString(), unresolved.toString());
    }

    private TransliterationComposer() {}
}
