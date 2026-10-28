package com.github.vadimkhristenko.hatsunemikutheme;

import com.intellij.ide.ui.LafManager;
import com.intellij.ide.ui.laf.UIThemeLookAndFeelInfo;
import org.jetbrains.annotations.Nullable;

import java.awt.Color;

/** The 8 looks. Accents are the new tab's (browser/src/palette.ts); browser/test/palette-sync.test.ts keeps them equal. */
public enum MikuTheme {
    MIKU_DARK("Hatsune Miku Dark", "miku-dark", true, 0x39c5bb, 0xff6a88),
    MIKU_LIGHT("Hatsune Miku Light", "miku-light", false, 0x007a72, 0xd40040),
    SAKURA_DARK("Hatsune Miku Sakura Dark", "sakura-dark", true, 0xe87ea1, 0x39c5bb),
    SAKURA_LIGHT("Hatsune Miku Sakura Light", "sakura-light", false, 0xbd3b6e, 0x007865),
    SNOW_DARK("Snow Miku Dark", "snow-dark", true, 0x95caed, 0xefa7b5),
    SNOW_LIGHT("Snow Miku Light", "snow-light", false, 0x05598b, 0xb8456a),
    TETO_DARK("Kasane Teto Dark", "teto-dark", true, 0xda646a, 0xe3b56a),
    TETO_LIGHT("Kasane Teto Light", "teto-light", false, 0xc13c51, 0x8f6420);

    public final String themeName;
    public final String id;
    public final boolean dark;
    public final Color accent;
    public final Color accent2;

    MikuTheme(String themeName, String id, boolean dark, int accent, int accent2) {
        this.themeName = themeName;
        this.id = id;
        this.dark = dark;
        this.accent = new Color(accent);
        this.accent2 = new Color(accent2);
    }

    /** The Miku look the IDE wears right now, or null under any other theme. */
    public static @Nullable MikuTheme current() {
        UIThemeLookAndFeelInfo laf = LafManager.getInstance().getCurrentUIThemeLookAndFeel();
        if (laf == null) return null;
        for (MikuTheme t : values()) if (t.themeName.equals(laf.getName())) return t;
        return null;
    }
}
