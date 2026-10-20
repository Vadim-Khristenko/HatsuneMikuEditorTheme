package com.github.vadimkhristenko.hatsunemikutheme.wallpaper;

import com.intellij.openapi.application.ApplicationManager;
import com.intellij.openapi.components.PersistentStateComponent;
import com.intellij.openapi.components.Service;
import com.intellij.openapi.components.State;
import com.intellij.openapi.components.Storage;
import org.jetbrains.annotations.NotNull;

/** What the user picked on Settings | Appearance & Behavior | Hatsune Miku. */
@Service(Service.Level.APP)
@State(name = "HatsuneMikuWallpaper", storages = @Storage("hatsune-miku.xml"))
public final class WallpaperSettings implements PersistentStateComponent<WallpaperSettings.Data> {
    public enum Source { NONE, ART, FILE }
    public enum Target { EDITOR, FRAME, BOTH }

    public static final class Data {
        public Source source = Source.NONE;
        public String file = "";
        public Target target = Target.EDITOR;
        /** 0 to 100, the same scale as the IDE's own background image dialog. */
        public int opacity = 12;
        public String fill = "scale";
        public String anchor = "center";
        /** The specs this plugin wrote last, so it never clears a background the user set by hand. */
        public String ownEditor = "";
        public String ownFrame = "";

        public Data copy() {
            Data d = new Data();
            d.source = source;
            d.file = file;
            d.target = target;
            d.opacity = opacity;
            d.fill = fill;
            d.anchor = anchor;
            d.ownEditor = ownEditor;
            d.ownFrame = ownFrame;
            return d;
        }
    }

    private Data data = new Data();

    public static WallpaperSettings getInstance() {
        return ApplicationManager.getApplication().getService(WallpaperSettings.class);
    }

    @Override
    public @NotNull Data getState() {
        return data;
    }

    @Override
    public void loadState(@NotNull Data state) {
        data = state;
    }
}
